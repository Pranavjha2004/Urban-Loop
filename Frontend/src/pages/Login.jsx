import { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await API.post("/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);

      navigate("/feed");
    } catch (err) {
      console.log(err);
      alert("Login failed");
    }
  };

  return (
    <div>
      <h2>Login</h2>

      <input placeholder="Email" onChange={(e)=>setEmail(e.target.value)} />
      <input type="password" placeholder="Password" onChange={(e)=>setPassword(e.target.value)} />

      <button onClick={handleLogin}>Login</button>

      <Link to="/register">
        <button>Go to Register</button>
      </Link>
    </div>
  );
}

export default Login;