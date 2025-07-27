import { useState } from "react";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:8000/auth/login", { email, password });
      localStorage.setItem("access_token", res.data.access_token);
      navigate("/");
    } catch (err) {
      alert(err.response?.data?.detail || "Login failed");
    }
  };

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    try {
      const res = await axios.post("http://localhost:8000/auth/google", {
        token: credentialResponse.credential,
      });
      localStorage.setItem("access_token", res.data.access_token);
      navigate("/");
    } catch (error) {
      alert("Google login failed");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Login</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
          className="mb-3 p-2 w-full border rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          required
          onChange={(e) => setPassword(e.target.value)}
          className="mb-3 p-2 w-full border rounded"
        />
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">Login</button>
      </form>

      <div className="mt-4">
        <p className="text-sm text-gray-600 mb-2">or login with</p>
        <GoogleLogin onSuccess={handleGoogleLoginSuccess} onError={() => alert("Google Login Failed")} />
      </div>
    </div>
  );
};

export default Login;
