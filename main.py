import traceback
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from langchain_community.document_loaders import UnstructuredPDFLoader
from langchain_ollama import OllamaEmbeddings, ChatOllama
from langchain_community.vectorstores import Chroma
from langchain.prompts import ChatPromptTemplate, PromptTemplate
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from langchain.retrievers.multi_query import MultiQueryRetriever
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from google.oauth2 import id_token
from google.auth.transport import requests
from fastapi.security import OAuth2PasswordRequestForm
import bcrypt
from fastapi import Body,Request
from fastapi.responses import FileResponse
from fastapi import Path

from typing import List
import os
import tempfile
import shutil
import uuid

from pymongo import MongoClient
from dotenv import load_dotenv

from jose import JWTError, jwt
from datetime import datetime, timedelta
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

load_dotenv() 
 # load variables from .env
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key")
import os
print("SECRET_KEY =", os.getenv("JWT_SECRET_KEY"))

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60






# Get MongoDB URI from env
MONGO_URI = os.getenv("MONGODB_URI")


# Connect to MongoDB Atlas
client = MongoClient(MONGO_URI)

# Access your DB and collection
db = client["ollama_chat"]
chat_collection = db["chat_sessions"]

PERSIST_DIRECTORY = os.path.join("data", "vectors")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, use frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Store vector databases in memory
vector_dbs = {}



class GoogleToken(BaseModel):
    token: str

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_access_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def get_current_user(token: str = Depends(oauth2_scheme)):
    print(f"Received token: {token}")
    payload = decode_access_token(token)
    print(f"Decoded payload: {payload}")
    if payload is None or "sub" not in payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication credentials")
    return payload["sub"]  # This will be the email in your token    


@app.put("/chat/{collection_name}/rename")
async def rename_chat(collection_name: str, request: Request, current_user: str = Depends(get_current_user)):
    body =  await request.json()
    new_name = body.get("new_name")
    if not new_name:
        raise HTTPException(status_code=400, detail="New name required")
    
    result = chat_collection.update_one(
        {"collection_name": collection_name, "user_email": current_user},
        {"$set": {"collection_name": new_name}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Chat not found or unauthorized")
    
    # Update in memory vector_dbs as well
    if collection_name in vector_dbs:
        vector_dbs[new_name] = vector_dbs.pop(collection_name)

    return {"message": "Chat renamed"}    

@app.delete("/chat/{collection_name}")
def delete_chat(collection_name: str, current_user: str = Depends(get_current_user)):
    result = chat_collection.delete_one({
        "collection_name": collection_name,
        "user_email": current_user
    })
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Chat not found or unauthorized")

    # Also remove from vector_dbs
    if collection_name in vector_dbs:
        del vector_dbs[collection_name]

    return {"message": "Chat deleted"}


@app.post("/auth/google")
async def google_auth(request: Request):
    body = await request.json()
    print("Request JSON body:", body)  # Debug log
    credential = body.get("credential")
    if not credential:
        raise HTTPException(status_code=400, detail="Missing credential") 
    
    try:
        print("Received token:", credential)

        idinfo = id_token.verify_oauth2_token(
            credential,
            requests.Request(),
            "1087297958571-b1686rktjt4em5bq4c967vo83pqknbf3.apps.googleusercontent.com",
            clock_skew_in_seconds=10
        )

        print("ID Token Verified:", idinfo)

        user_id = idinfo['sub']
        email = idinfo.get('email')

        user = db.users.find_one({"google_sub": user_id})
        if not user:
            db.users.insert_one({"google_sub": user_id, "email": email})

        token = create_access_token({"sub": email})
        return {"access_token": token, "token_type": "bearer"}

    except ValueError as ve:
        print("Google token validation error:", str(ve))
        raise HTTPException(status_code=400, detail=f"Invalid Google token : {ve}")
    except Exception as e:
        print("Unexpected error:", traceback.format_exc())
        raise HTTPException(status_code=500, detail="Internal Server Error")

    
    
# Signup
@app.post("/auth/signup")
async def signup(email: str = Body(...), password: str = Body(...)):
    existing_user = db.users.find_one({"email": email})
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")

    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

    db.users.insert_one({
        "email": email,
        "hashed_password": hashed_password.decode('utf-8')
    })

    token = create_access_token({"sub": email})
    return {"access_token": token, "token_type": "bearer"}


# Login
@app.post("/auth/login")
async def login(email: str = Body(...), password: str = Body(...)):
    user = db.users.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not bcrypt.checkpw(password.encode('utf-8'), user['hashed_password'].encode('utf-8')):
        raise HTTPException(status_code=401, detail="Incorrect password")

    token = create_access_token({"sub": email})
    return {"access_token": token, "token_type": "bearer"}

@app.post("/upload_pdfs")
async def upload_pdfs(files: List[UploadFile] = File(...), current_user: str = Depends(get_current_user)):
    print(f"[UPLOAD] Received {len(files)} files from user {current_user}")
    
    all_docs = []
    os.makedirs("./temp", exist_ok=True)

    for uploaded_file in files:
        try:
            print(f"[UPLOAD] Processing: {uploaded_file.filename}")
            file_content = await uploaded_file.read()
            
            # Save file
            path = f"./temp/{uploaded_file.filename}"
            with open(path, "wb") as f:
                f.write(file_content)
            print(f"[UPLOAD] File saved to: {path}")

            # Load PDF
            loader = UnstructuredPDFLoader(path)
            docs = loader.load()
            print(f"[UPLOAD] Extracted {len(docs)} documents from {uploaded_file.filename}")

            if not docs:
                raise Exception("No text extracted from PDF")

            all_docs.extend(docs)

        except Exception as e:
            print(f"[UPLOAD ERROR] Error processing {uploaded_file.filename}: {e}")
            raise HTTPException(status_code=500, detail=f"PDF upload failed: {e}")

    # Continue if all files succeeded
    chunks = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200).split_documents(all_docs)

    collection_name = f"multi-pdf-rag-{uuid.uuid4().hex}"
    vector_db = Chroma.from_documents(
        documents=chunks,
        embedding=OllamaEmbeddings(model="nomic-embed-text"),
        collection_name=collection_name
    )

    vector_dbs[collection_name] = vector_db

    chat_collection.insert_one({
        "user_email": current_user,
        "collection_name": collection_name,
        "pdf_files": [f.filename for f in files],
        "chat_history": [],
        "created_at": datetime.utcnow()
    })

    return {"message": "Uploaded successfully", "collection_name": collection_name}





@app.post("/ask")
async def ask_question(query: str = Form(...), collection_name: str = Form(...), model: str = Form("llama3.2:3b"), current_user: str = Depends(get_current_user) ):
    vector_db = vector_dbs.get(collection_name)
    if not vector_db:
        return {"answer": "Collection not found. Please upload PDF again."}

    llm = ChatOllama(model=model)

    prompt = PromptTemplate(
        input_variables=["question"],
        template="""You are an AI assistant. Generate 2 rephrased versions of the user question for better retrieval. Separate them by newline.
        Original question: {question}"""
    )

    retriever = MultiQueryRetriever.from_llm(
        vector_db.as_retriever(),
        llm,
        prompt=prompt
    )

    rag_prompt = ChatPromptTemplate.from_template(
        "Answer the question based ONLY on the following context:\n{context}\nQuestion: {question}"
    )

    chain = (
        {"context": retriever, "question": RunnablePassthrough()}
        | rag_prompt
        | llm
        | StrOutputParser()
    )

    session = chat_collection.find_one({"collection_name": collection_name, "user_email": current_user})
    if not session:
        return {"answer": "Session not found or you don't have access."}

    vector_db = vector_dbs.get(collection_name)
    if not vector_db:
        return {"answer": "Collection not found. Please upload PDF again."}
    
    # If chain.invoke is synchronous, just call it
    result = chain.invoke(query)

    chat_collection.update_one(
    {"collection_name": collection_name, "user_email": current_user},
    {"$push": {"chat_history": {"question": query, "answer": result}}}
    )


    # If async, use: result = await chain.invoke(query)

    return {"answer": result}


@app.get("/chats")
def get_chats(current_user: str = Depends(get_current_user)):
    sessions = chat_collection.find(
        {"user_email": current_user},  # only current user's sessions
        {"_id": 0, "collection_name": 1, "pdf_files": 1, "created_at": 1}
    )
    return list(sessions)

@app.get("/chat/{collection_name}")
def get_chat(collection_name: str, current_user: str = Depends(get_current_user)):
    session = chat_collection.find_one(
        {"collection_name": collection_name, "user_email": current_user},  # restrict by user
        {"_id": 0}
    )
    if not session:
        return {"error": "Chat not found or you don't have access"}
    return session


@app.get("/pdf-files/{collection_name}/{filename}")
def serve_pdf_file(collection_name: str = Path(...), filename: str = Path(...), current_user: str = Depends(get_current_user)):
    # For security, you may want to verify the user owns this collection/chat
    session = chat_collection.find_one({"collection_name": collection_name, "user_email": current_user})
    if not session:
        raise HTTPException(status_code=404, detail="Chat not found or unauthorized")

    # Construct the file path
    file_path = os.path.join("temp", filename)
    if not os.path.isfile(file_path):
        raise HTTPException(status_code=404, detail="File not found")

    # Return the file as a streaming response with correct content type
    return FileResponse(file_path, media_type="application/pdf", filename=filename)