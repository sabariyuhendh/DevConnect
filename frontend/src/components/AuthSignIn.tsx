import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiBase } from '../utils/api';
import AuthSignUp from './AuthSignUp'; // render signup on the same page

export default function AuthSignIn() {
  const { setUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState(''); // frontend-only username field
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch(`${apiBase}/api/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, username }) // username included
      });
      if (!res.ok) throw await res.json();
      const data = await res.json();
      setUser({ id: data.user?.id, email: data.user?.email, username, token: data.token });
    } catch (err: any) {
      setError(err?.message || 'Signin failed');
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        <h3>Sign in</h3>
        <label>
          Username (frontend-only)
          <input value={username} onChange={e => setUsername(e.target.value)} />
        </label>
        <label>
          Email
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </label>
        <button type="submit">Sign in</button>
        {error && <div style={{ color: 'red' }}>{error}</div>}

        {/* removed external link; signup is rendered below in this same page */}
      </form>

      {/* Render the actual signup component (contains the visible Username input) */}
      <div style={{ marginTop: 32, borderTop: '1px solid #eee', paddingTop: 20 }}>
        <h3>Create a new account</h3>
        <AuthSignUp />
      </div>
    </>
  );
}
