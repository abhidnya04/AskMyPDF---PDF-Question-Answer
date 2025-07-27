import { useEffect, useState } from "react";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";

// Set default mode to 'signup' instead of 'login'
const AuthModal = ({ mode = "signup", onClose, onLogin, googleLoginKey }) => {
  const [authMode, setAuthMode] = useState(mode);

  useEffect(() => {
    document.body.classList.add("modal-open");
    return () => {
      document.body.classList.remove("modal-open");
    };
  }, []);

  return (
    <div className="fixed inset-0 w-screen h-screen bg-black/50 backdrop-blur-sm flex justify-center items-center z-50" style={{ width: "100vw", height: "100vh" }}>
      <div>
        {authMode === "login" ? (
          <LoginForm
            onClose={onClose}
            switchToSignup={() => setAuthMode("signup")}
            onLogin={onLogin}  // pass down here
              googleLoginKey={googleLoginKey}
          />
        ) : (
          <SignupForm
            onClose={onClose}
            switchToLogin={() => setAuthMode("login")}
            onLogin={onLogin}  // pass down here
             googleLoginKey={googleLoginKey}
          />
        )}
      </div>
    </div>
  );
};

export default AuthModal;
