import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import "./login.scss";

const Login = () => {
  const [inputs, setInputs] = useState({
    username: "",
    password: ""
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setInputs((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:8080/api/v1/player/login", inputs);

      if (res.data.status === "00") {
        localStorage.setItem("token", res.data.data); // Save token
        navigate("/"); // redirect to homepage
      } else {
        toast.error("Invalid username or password", {
          position: "top-right",
          autoClose: 3000,
          pauseOnHover: true,
          draggable: true
        });
      }
    } catch (err) {
      toast.error("Network error or invalid login", {
        position: "top-right",
        autoClose: 3000,
        pauseOnHover: true,
        draggable: true
      });
    }
  };

  return (
    <div className="login">
      <ToastContainer />
      <div className="card">
        <div className="left">
          <h1>Are you new here?</h1>
          <p>create an account, sell, buy and steal coins from your friends</p>
          <span>What are you waiting for</span>
          <Link to="/register">
            <button>Register</button>
          </Link>
        </div>
        <div className="right">
          <h1>Login</h1>
          <form onSubmit={handleLogin}>
            <input
              type="text"
              name="username"
              placeholder="Username"
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              onChange={handleChange}
              required
            />
            <button type="submit">Login</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
