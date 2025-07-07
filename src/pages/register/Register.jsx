import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import "./register.scss";

 

const Register = () => {
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const { username, password, confirmPassword } = formData;

    if (!username || !password || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const response = await axios.post(API_BASE_URL+"/player/save", {
        username,
        password,
      });

      if (response.data.status === "00") {
        alert("Registration successful!");
        navigate("/login");
      } else {
        setError(response.data.message || "Registration failed");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred during registration");
    }
  };

  return (
    <div className="register">
      <div className="card">
        <div className="left">
          <h1>You already have an account?</h1>
          <p>good...</p>
          <span></span>
          <Link to="/login">
            <button>Login</button>
          </Link>
        </div>
        <div className="right">
          <h1>Register</h1>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
            />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
            {error && <p className="error">{error}</p>}
            <button type="submit">Register</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
