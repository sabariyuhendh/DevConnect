import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiBase } from '../utils/api';

export default function AuthSignUp() {
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [agree, setAgree] = useState(false);

  const [checking, setChecking] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Log API configuration on mount
  useEffect(() => {
    console.log('=== API Configuration ===');
    console.log('API Base URL:', apiBase);
    console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
    console.log('Environment:', import.meta.env.MODE);
    console.log('========================');
  }, []);

  // Debounced username availability check
  useEffect(() => {
    if (!username || username.length < 2) {
      setUsernameAvailable(null);
      setChecking(false);
      return;
    }
    let mounted = true;
    setChecking(true);
    const id = setTimeout(async () => {
      try {
        const url = `${apiBase}/api/auth/check-username?username=${encodeURIComponent(username)}`;
        console.log('[Username Check] Checking username:', username);
        console.log('[Username Check] API URL:', url);
        console.log('[Username Check] API Base:', apiBase);
        
        const res = await fetch(url);
        console.log('[Username Check] Response status:', res.status);
        
        if (!res.ok) {
          console.error('[Username Check] Failed:', res.status, res.statusText);
          const errorText = await res.text();
          console.error('[Username Check] Error body:', errorText);
          if (mounted) setUsernameAvailable(null);
        } else {
          const data = await res.json();
          console.log('[Username Check] Response data:', data);
          console.log('[Username Check] Available:', data.available);
          console.log('[Username Check] Available === true:', data.available === true);
          // Explicitly check if available is true
          if (mounted) setUsernameAvailable(data.available === true);
        }
      } catch (err) {
        console.error('[Username Check] Network error:', err);
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

    console.log('[Signup] Starting signup process...');
    console.log('[Signup] Username:', username);
    console.log('[Signup] Email:', email);
    console.log('[Signup] Username available:', usernameAvailable);

    if (!username) return setError('Username is required');
    if (usernameAvailable === false) return setError('Username is taken');
    if (!email) return setError('Email is required');
    if (!password) return setError('Password is required');
    if (password !== confirm) return setError('Passwords do not match');
    if (!agree) return setError('You must agree to the Terms of Service');

    setLoading(true);
    try {
      const body = { username, email, password };
      const url = `${apiBase}/api/auth/signup`;
      
      console.log('[Signup] API URL:', url);
      console.log('[Signup] API Base:', apiBase);
      console.log('[Signup] Request body:', { username, email, password: '***' });
      
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      console.log('[Signup] Response status:', res.status);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('[Signup] Error response:', errorText);
        let err;
        try {
          err = JSON.parse(errorText);
        } catch {
          err = { message: 'Signup failed' };
        }
        throw err;
      }
      
      const data = await res.json();
      console.log('[Signup] Success! Response:', { ...data, token: '***' });
      
      // Persist token and username in auth context
      setUser({ id: data.user?.id, email: data.user?.email, username: data.user?.username || username, token: data.token });
      console.log('[Signup] User set in context');
      
      // Redirect to feed page
      navigate('/feed');
    } catch (err: any) {
      console.error('[Signup] Error:', err);
      setError(err?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 420, padding: 12 }}>
      <h3>Create your account</h3>

      {/* Debug Info */}
      <div style={{ 
        fontSize: 11, 
        padding: 8, 
        background: '#f0f0f0', 
        border: '1px solid #ccc', 
        borderRadius: 4, 
        marginBottom: 12,
        fontFamily: 'monospace'
      }}>
        <div><strong>Debug Info:</strong></div>
        <div>API Base: {apiBase}</div>
        <div>Env: {import.meta.env.MODE}</div>
      </div>

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
