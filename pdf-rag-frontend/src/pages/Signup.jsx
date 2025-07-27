import { useState } from "react";
import axios from "axios";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8000/auth/signup", { email, password });
      alert("Signup successful. Please log in.");
    } catch (err) {
      alert(err.response?.data?.detail || "Signup failed.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleSignup} className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Signup</h2>
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
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">Signup</button>
      </form>
    </div>
  );
};

export default Signup;
