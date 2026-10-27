import React, { useState } from 'react';

interface LoginProps {
  onLogin: (token: string, remember: boolean) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      const data = await res.json();
      if (res.ok) onLogin(data.token, remember);
      else setError(data.error || 'Login failed');
    } catch (err) {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-screen">
      <div className="login-card">
        <h2>LOGIN</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input 
              type="text" 
              placeholder="Username" 
              onChange={e => setCredentials({...credentials, username: e.target.value})} 
            />
          </div>
          <div className="form-group">
            <input 
              type="password" 
              placeholder="Password" 
              onChange={e => setCredentials({...credentials, password: e.target.value})} 
            />
          </div>
          <div className="remember-me">
            <input 
              type="checkbox" 
              id="remember" 
              checked={remember} 
              onChange={(e) => setRemember(e.target.checked)} 
            />
            <label htmlFor="remember">Remember me</label>
          </div>
          {error && <div className="login-error">{error}</div>}
          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? '...' : 'LOGIN'}
          </button>
        </form>
      </div>
    </div>
  );
};