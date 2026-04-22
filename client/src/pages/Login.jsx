import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { setAuth } from '../utils/auth';

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const onChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await api.post('/auth/login', form);
      const token = response?.data?.data?.token;
      const user = response?.data?.data?.user;

      if (!token || !user) {
        throw new Error('Invalid response from server');
      }

      setAuth(token, user);
      setMessage(response?.data?.message || 'Login successful');
      navigate('/dashboard');
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="card auth-card" onSubmit={onSubmit}>
        <h1>Welcome back</h1>
        <p className="muted">Sign in to continue.</p>

        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" value={form.email} onChange={onChange} required />

        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" value={form.password} onChange={onChange} required />

        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>

        {message && <p className="success">{message}</p>}
        {error && <p className="error">{error}</p>}

        <p className="muted">
          No account? <Link to="/register">Register</Link>
        </p>
      </form>
    </div>
  );
}
