import { useState,useEffect } from "react";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";

const SignupForm = ({ onClose, switchToLogin, onLogin,googleLoginKey }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      await fetch("http://localhost:8000/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: username, password }),
      });
      alert("Signup successful. Please login.");
      switchToLogin();
    } catch (err) {
      alert(err.response?.data?.detail || "Signup failed");
    }
  };

  const handleGoogleSignupSuccess = async (credentialResponse) => {
    try {
      const res = await axios.post("http://localhost:8000/auth/google", {
        credential: credentialResponse.credential,
      });
      localStorage.setItem("access_token", res.data.access_token);
      alert("Google Signup Success!");
      onLogin();
    } catch (err) {
      alert("Google Signup Failed");
    }
  };

  useEffect(() => {
  if (window.google?.accounts?.id) {
    window.google.accounts.id.disableAutoSelect(); // ✅ Ensures clean Google login
  }
}, []);


  return (
    <div className="relative w-full max-w-2xl p-8 rounded-xl bg-gradient-primary text-white shadow-glow border border-border backdrop-blur-md">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-3 right-4 text-2xl font-bold text-[#4b2e2e] hover:text-[#3a221f]"
        aria-label="Close modal"
      >
        ×
      </button>

      <h2 className="text-2xl font-bold text-white text-center mb-6">Signup</h2>

      <form onSubmit={handleSignup} className="space-y-4">
        <label className="block text-white mb-1">Email:</label>
        <input
          type="email"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Email"
          required
          className="w-full p-2 rounded bg-black/30 text-white placeholder-white/60 outline-none"
        />

        <label className="block text-white mb-1">Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          className="w-full p-2 rounded bg-black/30 text-white placeholder-white/60 outline-none"
        />

        <label className="block text-white mb-1">Confirm Password:</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm Password"
          required
          className="w-full p-2 rounded bg-black/30 text-white placeholder-white/60 outline-none"
        />

        <button
          type="submit"
          className="w-full bg-white text-black font-semibold py-2 rounded hover:bg-gray-200 transition"
        >
          Sign up
        </button>
      </form>

      <div className="text-center mt-6">
        <p className="text-sm mb-2">or sign up with</p>
       <GoogleLogin
  key={googleLoginKey}  // force remount on modal open/close
  onSuccess={handleGoogleSignupSuccess}  // or handleGoogleSignupSuccess
  onError={() => alert("Google login failed")}
/>


      </div>

      {/* Toggle to login */}
      <p className="text-sm mt-6 text-center text-[#4b2e2e]">
        Already signed in?{" "}
        <button onClick={switchToLogin} className="underline font-semibold">
          Login
        </button>
      </p>
    </div>
  );
};

export default SignupForm;
