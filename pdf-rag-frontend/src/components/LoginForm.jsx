import { useState,useEffect } from "react";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { FaReact } from "react-icons/fa";

const LoginForm = ({ onClose, switchToSignup, onLogin,googleLoginKey }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:8000/auth/login", {
        email,
        password,
      });
      localStorage.setItem("access_token", res.data.access_token);
      alert("Logged in!");
      onLogin(); // notify parent after login
    } catch (err) {
      alert(err.response?.data?.detail || "Login failed");
    }
  };

  const handleGoogleLoginSuccess = async (credentialResponse) => {
  console.log("Google Credential Response:", credentialResponse);
  try {
    if (!credentialResponse.credential) {
      throw new Error("No credential in response");
    }

     // ✅ Decode and inspect audience:
    const payload = JSON.parse(atob(credentialResponse.credential.split('.')[1]));
    console.log("Decoded Google ID token payload:", payload); // 👀 Look here!
    console.log("aud:", payload.aud);  // <- THIS MUST match your client ID exactly
    console.log("Sending to backend:", { credential: credentialResponse.credential });

    const res = await axios.post("http://localhost:8000/auth/google", {
      
      credential: credentialResponse.credential,
    });
    console.log("Backend response:", res.data);
    localStorage.setItem("access_token", res.data.access_token);
    alert("Google Login Success!");
    onLogin();
  } catch (err) {
    console.error("Google login error:", err);
    alert("Google Login Failed");
  }
};

useEffect(() => {
  if (window.google?.accounts?.id) {
    window.google.accounts.id.disableAutoSelect(); // ✅ Important
  }
}, []);


  return (
    <div className="w-full max-w-xl p-8 rounded-xl bg-gradient-primary text-white shadow-glow border border-border backdrop-blur-md relative">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-3 right-4 text-2xl font-bold text-[#4b2e2e] hover:text-[#3a221f]"
        aria-label="Close modal"
      >
        ×
      </button>

      {/* Header */}
      <div className="flex flex-col items-center mb-6">
        <FaReact className="text-4xl mb-2 text-purple-300" />
        <h2 className="text-2xl font-bold">Login</h2>
      </div>

      {/* Email/password login form */}
      <form onSubmit={handleEmailLogin}>
        <label className="block mb-1">Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          className="w-full p-2 mb-4 rounded bg-black/30 text-white placeholder-white/60 outline-none"
        />

        <label className="block mb-1">Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          className="w-full p-2 mb-6 rounded bg-black/30 text-white placeholder-white/60 outline-none"
        />

        <button
          type="submit"
          className="w-full bg-white text-black font-semibold py-2 rounded hover:bg-gray-200 transition"
        >
          SUBMIT
        </button>
      </form>

      {/* Google login */}
      <div className="text-center mt-4">
        <p className="text-sm mb-2">or login with</p>
      <GoogleLogin
  key={googleLoginKey}  // force remount on modal open/close
  onSuccess={handleGoogleLoginSuccess}  // or handleGoogleSignupSuccess
  onError={() => alert("Google login failed")}
/>

      </div>

      {/* Switch to signup */}
      <p className="text-sm mt-4 text-center text-[#4b2e2e]">
        Not registered?{" "}
        <button onClick={switchToSignup} className="underline font-semibold">
          Register
        </button>
      </p>
    </div>
  );
};

export default LoginForm;
