// src/Login.jsx
import React, { useState } from 'react';

const CONSTANT_USERNAME = "Delhitrip";
const CONSTANT_PASSWORD = "Delhi@2025";

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username === CONSTANT_USERNAME && password === CONSTANT_PASSWORD) {
      onLogin(true);
    } else {
      setError("Invalid username or password.");
    }
  };

  return (
    <div className="login-box">
      <h3>🔒 User Login</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username (Delhitrip)"
          value={username}
          onChange={(e) => { setUsername(e.target.value); setError(''); }}
          required
        />
        <input
          type="password"
          placeholder="Password (Delhi@2025)"
          value={password}
          onChange={(e) => { setPassword(e.target.value); setError(''); }}
          required
        />
        <button type="submit">Log In</button>
      </form>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default Login;