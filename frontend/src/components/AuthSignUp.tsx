import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiBase } from '../utils/api';

export default function AuthSignUp() {
  const { setUser } = useAuth();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [agree, setAgree] = useState(false);

  const [checking, setChecking] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Debounced username availability check
  useEffect(() => {
    if (!username) {
      setUsernameAvailable(null);
      setChecking(false);
      return;
    }
    let mounted = true;
    setChecking(true);
    const id = setTimeout(async () => {
      try {
        const res = await fetch(`${apiBase}/api/auth/check-username?username=${encodeURIComponent(username)}`);
        if (!res.ok) {
          if (mounted) setUsernameAvailable(null);
        } else {
          const data = await res.json();
          if (mounted) setUsernameAvailable(Boolean(data.available));
        }
      } catch {
        if (mounted) setUsernameAvailable(null);
      } finally {
        if (mounted) setChecking(false);
      }
    }, 400);
    return () => {
      mounted = false;
      clearTimeout(id);
    };
  }, [username]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!username) return setError('Username is required');
    if (usernameAvailable === false) return setError('Username is taken');
    if (!email) return setError('Email is required');
    if (!password) return setError('Password is required');
    if (password !== confirm) return setError('Passwords do not match');
    if (!agree) return setError('You must agree to the Terms of Service');

    setLoading(true);
    try {
      const body = { username, email, password };
      const res = await fetch(`${apiBase}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Signup failed' }));
        throw err;
      }
      const data = await res.json();
      // Persist token and username in auth context
      setUser({ id: data.user?.id, email: data.user?.email, username: data.user?.username || username, token: data.token });
    } catch (err: any) {
      setError(err?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 420, padding: 12 }}>
      <h3>Create your account</h3>

      <label>
        Username
        <input
          value={username}
          onChange={e => setUsername(e.target.value.trim())}
          placeholder="Choose a username"
          required
        />
      </label>
      <div style={{ fontSize: 12, color: usernameAvailable === false ? 'crimson' : 'green', minHeight: 18 }}>
        {checking ? 'Checking username...' : username ? (usernameAvailable ? 'Username available' : usernameAvailable === false ? 'Taken' : '') : 'Pick a unique username'}
      </div>

      <label>
        Email address
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
      </label>

      <label>
        Password
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
      </label>

      <label>
        Confirm password
        <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required />
      </label>

      <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input type="checkbox" checked={agree} onChange={e => setAgree(e.target.checked)} />
        <span>I agree to the Terms of Service</span>
      </label>

      <button type="submit" disabled={loading || checking || usernameAvailable === false}>
        {loading ? 'Creating account...' : 'Create account'}
      </button>

      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
    </form>
  );
}
