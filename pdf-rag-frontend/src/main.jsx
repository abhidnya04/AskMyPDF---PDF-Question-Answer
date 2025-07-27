import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './App.css'; 
import App from './App.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google';

const clientId = "1087297958571-b1686rktjt4em5bq4c967vo83pqknbf3.apps.googleusercontent.com"; 

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
)
