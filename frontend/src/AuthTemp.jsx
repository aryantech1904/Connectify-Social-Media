import "./Auth.css";
import { useState } from "react";
import api from "./api/api";
import { Users } from "lucide-react";

function Auth({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const endpoint = isRegister
        ? "/auth/register"
        : "/auth/login";

      const payload = isRegister
        ? form
        : { email: form.email, password: form.password };

      const response = await api.post(endpoint, payload);
      const data = response.data;

      if (data.token) {
        localStorage.setItem("connectify_token", data.token);
        onLogin();
      } else if (isRegister) {
        setMessage("Account created. Please log in.");
        setIsRegister(false);
      } else {
        setMessage("Login response did not contain a token.");
      }
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
        "Unable to connect. Please check that the backend is running."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="auth-logo">
          <Users size={30} />
        </div>

        <h1>Connectify</h1>
        <p>Connect, share and discover your community.</p>

        {isRegister && (
          <>
            <input
              name="name"
              placeholder="Full name"
              value={form.name}
              onChange={handleChange}
              required
            />
            <input
              name="username"
              placeholder="Username"
              value={form.username}
              onChange={handleChange}
              required
            />
          </>
        )}

        <input
          name="email"
          type="email"
          placeholder="Email address"
          value={form.email}
          onChange={handleChange}
          required
        />

        <input
          name="password"
          type="password"
          placeholder="Password (minimum 6 characters)"
          value={form.password}
          onChange={handleChange}
          minLength={6}
          required
        />

        {message && <p className="auth-message">{message}</p>}

        <button type="submit" disabled={loading}>
          {loading
            ? "Please wait..."
            : isRegister
              ? "Create Account"
              : "Log In"}
        </button>

        <p className="auth-switch">
          {isRegister ? "Already have an account?" : "New to Connectify?"}
          {" "}
          <button
            type="button"
            className="auth-link"
            onClick={() => {
              setIsRegister(!isRegister);
              setMessage("");
            }}
          >
            {isRegister ? "Log in" : "Sign up"}
          </button>
        </p>
      </form>
    </div>
  );
}

export default Auth;
