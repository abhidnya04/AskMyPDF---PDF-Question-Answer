import React, { useState, useEffect,useRef } from "react";
import axios from "axios";
import "../App.css"; // import your CSS here
import uploadFile from "../assets/file-upload.svg";

function PdfQaPage() {
  const [file, setFile] = useState([]);
  const [fileURL, setFileURL] = useState("");
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [collectionName, setCollectionName] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [model, setModel] = useState("llama3.2:3b");
  const [uploading, setUploading] = useState(false);
const [thinking, setThinking] = useState(false);
const [previewFileURL, setPreviewFileURL] = useState(""); 

const [sidebarOpen, setSidebarOpen] = useState(false);

const [previousChats, setPreviousChats] = useState([]);

useEffect(() => {
  const token = localStorage.getItem("access_token");
   console.log("Token for /chats fetch:", token);

  axios.get("http://localhost:8000/chats", {
    headers: { Authorization: `Bearer ${token}` }
  })
  .then((res) => {
    const sortedChats = res.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    setPreviousChats(sortedChats);
  })
  .catch((err) => {
    console.error("Failed to load previous chats", err);
  });
}, []);

const menuRefs = useRef([]);

// Close any open menu when clicking outside
useEffect(() => {
  const handleClickOutside = (event) => {
    if (
      menuRefs.current.some(ref => ref && ref.contains(event.target))
    ) return; // Click was inside a menu — do nothing

    // Click was outside — close all menus
    setPreviousChats(prev =>
      prev.map(chat => ({ ...chat, showMenu: false }))
    );
  };

  document.addEventListener("mousedown", handleClickOutside);
  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);



// const onFileChange = (e) => {
//   const selectedFiles = Array.from(e.target.files);
//   // Append new files to existing files
//   setFiles((prevFiles) => {
//     // Filter out duplicates by filename if you want
//     const existingNames = new Set(prevFiles.map(f => f.name));
//     const newFiles = selectedFiles.filter(f => !existingNames.has(f.name));
//     return [...prevFiles, ...newFiles];
//   });
//   // Clear the input value so user can re-select same file if needed
//   e.target.value = null;
// };

 const uploadPDF = async () => {
  if (!file || file.length === 0) {
    alert("Please select one or more PDFs.");
    return;
  }
  console.log("Uploading files:", file);
  
  setUploading(true);

  const formData = new FormData();
 file.forEach((f) => {
  if (f.isLocalFile) {
    formData.append("files", f.file);
  }
});

  const token = localStorage.getItem("access_token");
  console.log("Upload token:", token);

  try {
    const res = await axios.post("http://localhost:8000/upload_pdfs", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        "Authorization" : `Bearer ${token}`, 
      },
    });
    console.log(res.data);
    setCollectionName(res.data.collection_name);
    setFileURL(URL.createObjectURL(file[0])); // Preview first file
    setPreviewFileURL(URL.createObjectURL(file[0]));

    alert("PDFs uploaded and vector DB created.");
  } catch (err) {
    console.error("Upload failed:", err);
    alert("Failed to upload PDFs.");
  } finally {
    setUploading(false);
  }
};


  const askQuestion = async () => {
  if (!query || !collectionName) {
    alert("Please enter a question and upload a PDF first.");
    return;
  }

  // Add the question with a placeholder answer "Thinking..."
  setChatHistory(prev => [...prev, { question: query, answer: "Thinking..." }]);

  setThinking(true);
  const currentQuery = query;  // save current query to clear input after
  setQuery("");  // clear input right away

  const formData = new FormData();
  formData.append("query", currentQuery);
  formData.append("collection_name", collectionName);
  formData.append("model", model);

  const token = localStorage.getItem("access_token");


  try {
     const res = await axios.post("http://localhost:8000/ask", formData, {
      headers: {
        Authorization: `Bearer ${token}`,  // <-- Add this
      }
    });
    // Update the last chat entry with the real answer
    setChatHistory(prev => {
      const updated = [...prev];
      updated[updated.length - 1].answer = res.data.answer;
      return updated;
    });

  } catch (err) {
    alert("Failed to get answer.");
    // Optionally update answer to "Failed to get answer."
    setChatHistory(prev => {
      const updated = [...prev];
      updated[updated.length - 1].answer = "Failed to get answer.";
      return updated;
    });
  } finally {
    setThinking(false);
  }
};

const startNewChat = () => {
  // If current chat has a collectionName and chat history, you might want to save it to backend here (optional)
  // For now, just add the current chat to previousChats locally
  if (collectionName && chatHistory.length > 0) {
    const newChatEntry = {
      collection_name: collectionName,
      pdf_files: file.map(f => f.name),
      chat_history: chatHistory,
      created_at: new Date().toISOString(),
      showMenu: false,
    };
    
    setPreviousChats(prev => [newChatEntry, ...prev]);
  }

  // Clear current chat and file states for new chat
  setChatHistory([]);
  setFile([]);
  setPreviewFileURL("");
  setFileURL("");
  setCollectionName("");
  setQuery("");
};

const handleRenameChat = async (oldCollectionName, idx) => {
  const newName = prompt("Enter new chat name:");
  if (!newName) return;

  try {
    await axios.put(`http://localhost:8000/chat/${oldCollectionName}/rename`, {
      new_name: newName
    }, {
      headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` }
    });

    const updatedChats = [...previousChats];
    updatedChats[idx].collection_name = newName;
    updatedChats[idx].showMenu = false;
    setPreviousChats(updatedChats);

    // Update current chat name in state only if it matches the old name
    if (oldCollectionName === collectionName) {
      setCollectionName(newName);
    }

  } catch (err) {
    console.error("Rename failed", err);
    alert("Rename failed");
  }
};


const handleDeleteChat = async (deletedCollectionName) => {
  if (!window.confirm("Are you sure you want to delete this chat?")) return;

  try {
    await axios.delete(`http://localhost:8000/chat/${deletedCollectionName}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` }
    });

    setPreviousChats(prev => prev.filter(chat => chat.collection_name !== deletedCollectionName));

    // Only clear current chat if it was the one deleted
    if (deletedCollectionName === collectionName) {
      startNewChat();
    }

  } catch (err) {
    console.error("Delete failed", err);
    alert("Delete failed");
  }
};


async function fetchPdfWithAuth(collectionName, filename) {
  const token = localStorage.getItem("access_token");
  const url = `http://localhost:8000/pdf-files/${collectionName}/${encodeURIComponent(filename)}`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error("Failed to fetch PDF");
  }
  const blob = await response.blob();
  return URL.createObjectURL(blob);
}




  return (
    <div className="app-container">
      <h1 className="header">
         <button className="hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>
    &#9776;
  </button>
        🧠 Ollama PDF RAG Chat
      </h1>
    

      {/* Sidebar */}
<div className={`sidebar ${sidebarOpen ? "open" : ""}`}>
  <button
    className="close-sidebar-btn"
    onClick={() => setSidebarOpen(false)}
    aria-label="Close sidebar"
  >
   &#9776; {/* This is the × symbol */}
  </button>

  {/* New Chat button */}
  <button className="new-chat-btn" onClick={startNewChat}>
  + New Chat
</button>


  <h3>Chats</h3>
  <ul className="chat-session-list">
  {previousChats.map((chat, idx) => (
    <li key={idx} className={`chat-item ${chat.showMenu ? 'open' : ''}`}>

  <div
    className="chat-name"
    onClick={() => {
      axios.get(`http://localhost:8000/chat/${chat.collection_name}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` }
      })
        .then((res) => {
          if (res.data.chat_history) {
            setChatHistory(res.data.chat_history);
            setCollectionName(chat.collection_name);

       if (res.data.pdf_files && Array.isArray(res.data.pdf_files)) {
  const filesWithUrls = res.data.pdf_files.map(filename => ({
    name: filename,
    url: `http://localhost:8000/pdf-files/${chat.collection_name}/${encodeURIComponent(filename)}`,
    isLocalFile: false,
  }));
  setFile(filesWithUrls);
  if (filesWithUrls.length > 0) {
  // Instead of setPreviewFileURL(filesWithUrls[0].url);
  fetchPdfWithAuth(chat.collection_name, filesWithUrls[0].name)
    .then(url => setPreviewFileURL(url))
    .catch(err => {
      console.error("Failed to load PDF preview", err);
      setPreviewFileURL("");
    });
}

}


          }
        })
        .catch((err) => console.error("Failed to load chat", err));
      setSidebarOpen(false);
    }}
  >
     {chat.pdf_files && chat.pdf_files.length > 0 ? (
      <ul style={{ margin: 0, paddingLeft: "1rem", listStyleType: "disc" }}>
        {chat.pdf_files.map((pdfName, i) => (
          <li key={i} style={{ fontSize: "0.9rem" }}>{pdfName}</li>
        ))}
      </ul>
    ) : (
      chat.collection_name
    )}
  </div>

  <div className="chat-options">
    <span className="three-dots" onClick={(e) => {
      e.stopPropagation();
      const updatedChats = [...previousChats];
      updatedChats[idx].showMenu = !updatedChats[idx].showMenu;
      setPreviousChats(updatedChats);
    }}>⋮</span>
    
    {chat.showMenu && (
       <div
    className="chat-menu"
    ref={(el) => (menuRefs.current[idx] = el)}
  >
        <button onClick={() => handleRenameChat(chat.collection_name, idx)}>Rename</button>
        <button onClick={() => handleDeleteChat(chat.collection_name)}>Delete</button>
      </div>
    )}
  </div>
</li>

  ))}
</ul>

</div>


      <div className="main-content">
        {/* Left Panel: Chat */}
        <div className="left-panel">
          <div className="chat-history">
            {chatHistory.map((item, idx) => (
              <div key={idx} className="chat-pair">
  <div className="chat-line chat-question-line">
    <span className="chat-label">Q:</span>
     <span className="chat-text">{item.question}</span>
  </div>
  <div className="chat-line chat-answer-line">
    <span className="chat-label">A:</span>
  <span className="chat-text">{item.answer}</span>
  </div>
  <hr className="chat-divider" />
</div>



            ))}
              {/* Show thinking message */}
            {/* {thinking && (
  <div className="chat-pair">
    <div className="chat-question">Q: {query}</div>
    <div className="chat-answer"><em>🤔 Thinking...</em></div>
  </div>
)} */}

          </div>

          <div className="chat-input-area">
            <input
              type="text"
              placeholder="Ask a question..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
               onKeyDown={(e) => {
    if (e.key === 'Enter' && !thinking) {
      e.preventDefault(); // prevent default form submit behavior if any
      askQuestion();
    }
  }}
              className="chat-input"
               disabled={thinking}
            />
           
          </div>
        </div>

        {/* Right Panel: Upload + Preview */}
        <div className="right-panel">
  {/* Model selection */}
  {/* <select
    value={model}
    onChange={(e) => setModel(e.target.value)}
    className="model-select"
    disabled={uploading}
  >
    <option value="llama3.2:3b">llama3.2:3b</option>
    <option value="mistral">mistral</option>
  </select> */}

  {/* Upload box container */}
  <div className="file-upload-box">
  {/* Hidden file input */}
  <input
    id="file-upload"
    type="file"
    accept="application/pdf"
  onChange={(e) => {
  const selected = Array.from(e.target.files).map(f => ({
    name: f.name,
    file: f,
    isLocalFile: true,
  }));
  if (selected.length === 0) return;

  setFile(prevFiles => {
    const existingNames = new Set(prevFiles.map(f => f.name));
    const uniqueNew = selected.filter(f => !existingNames.has(f.name));
    return [...prevFiles, ...uniqueNew];
  });

  e.target.value = null;
}}

    className="file-input-hidden"
    disabled={uploading}
    multiple
  />

<label htmlFor="file-upload" className="file-upload-box-inner">
  {/* Upload icon: only when no files */}
  {file.length === 0 && (
    <img src={uploadFile} alt="Upload Icon" className="upload-icon" />
  )}

  {/* File names container above the button, if files selected */}
  {file.length > 0 && (
    <div className="file-names-grid">
      {file.map((f, idx) => (
  <div
    key={idx}
    className="file-name-grid-item"
    onClick={() => {
      if (file[idx].isLocalFile) {
        const url = URL.createObjectURL(file[idx].file);
        setPreviewFileURL(url);
      } else {
        // fetch PDF blob with auth token and set URL
        fetchPdfWithAuth(collectionName, f.name)
          .then(url => setPreviewFileURL(url))
          .catch(err => {
            console.error("Failed to fetch PDF preview", err);
            setPreviewFileURL("");
          });
      }
    }}
    style={{ cursor: "pointer" }}
    title="Click to preview"
  >
    📄 {f.name}
  </div>
))}

    </div>
  )}

  {/* Upload Files button text always visible */}
  <span className="upload-box-button">Upload Files</span>
</label>




</div>

{/* File tags below box */}
{/* {file.length > 0 && (
  <div className="file-tags-container">
    {file.map((f, idx) => {
      const blobURL = URL.createObjectURL(f);
      return (
        <span
          key={idx}
          className="file-tag"
          onClick={() => setPreviewFileURL(blobURL)}
          title="Click to preview"
        >
          {f.name}
          <button
            className="remove-tag-btn"
            onClick={(e) => {
              e.stopPropagation();
              URL.revokeObjectURL(blobURL);
              setFile((prev) => prev.filter((_, i) => i !== idx));
              if (previewFileURL === blobURL) {
                setPreviewFileURL("");
              }
            }}
          >
            ×
          </button>
        </span>
      );
    })}
  </div>
)} */}


  {/* Upload button OUTSIDE box */}
  <button
    onClick={uploadPDF}
    className="upload-button"
    disabled={uploading || file.length === 0}
  >
    Upload PDF{file.length > 1 ? "s" : ""}
  </button>

  {uploading && (
    <div className="uploading-message">⏳ Processing PDF, please wait...</div>
  )}

  {/* Preview iframe */}
  {previewFileURL && (
    <div className="pdf-preview-container">
      <iframe
        src={previewFileURL}
        title="PDF Preview"
        className="pdf-preview"
      ></iframe>
    </div>
  )}
</div>


      </div>
    </div>
  );
}

export default PdfQaPage;
