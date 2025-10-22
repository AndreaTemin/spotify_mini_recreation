import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Link } from 'react-router-dom';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // 1. Log in to get the token
      const loginResponse = await api.post('/token', 
        new URLSearchParams({
          username: email, // FastAPI's OAuth2 form expects 'username'
          password: password,
        }),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }
      );
      
      const token = loginResponse.data.access_token;

      // 2. Use the token to get user info
      const userResponse = await api.get('/users/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      // 3. Call the login function from our context
      login(token, userResponse.data);

    } catch (err) {
      setError('Failed to log in. Check your email or password.');
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">Login</button>
      </form>
      <p>
        Don't have an account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
};

export default LoginPage;