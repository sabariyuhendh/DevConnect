import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiBase } from '../utils/api';
import { validateUsernameFormat, validateEmail, validatePassword, getPasswordStrength } from '../utils/validation';

export default function AuthSignUp() {
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [confirm, setConfirm] = useState('');
  const [agree, setAgree] = useState(false);

  const [checking, setChecking] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [usernameFormatError, setUsernameFormatError] = useState<string | null>(null);

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

  // Validate username format first, then check availability
  useEffect(() => {
    if (!username || username.length < 2) {
      setUsernameAvailable(null);
      setUsernameFormatError(null);
      setChecking(false);
      return;
    }

    // First validate format
    const formatValidation = validateUsernameFormat(username);
    if (!formatValidation.valid) {
      setUsernameFormatError(formatValidation.message || 'Invalid username format');
      setUsernameAvailable(null);
      setChecking(false);
      return;
    }

    // Format is valid, clear error
    setUsernameFormatError(null);

    // Now check availability with debounce
    let mounted = true;
    setChecking(true);
    const id = setTimeout(async () => {
      try {
        const normalizedUsername = username.toLowerCase().trim();
        const url = `${apiBase}/api/auth/check-username?username=${encodeURIComponent(normalizedUsername)}`;
        console.log('[Username Check] Checking username:', normalizedUsername);
        console.log('[Username Check] API URL:', url);
        
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
          if (mounted) setUsernameAvailable(data.available === true);
        }
      } catch (err) {
        console.error('[Username Check] Network error:', err);
        if (mounted) setUsernameAvailable(null);
      } finally {
        if (mounted) setChecking(false);
      }
    }, 500); // Increased debounce to 500ms for better UX
    
    return () => {
      mounted = false;
      clearTimeout(id);
    };
  }, [username]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    console.log('[Signup] Starting signup process...');

    // Validate all fields
    if (!firstName.trim()) return setError('First name is required');
    if (!lastName.trim()) return setError('Last name is required');
    if (!username.trim()) return setError('Username is required');
    
    const usernameValidation = validateUsernameFormat(username);
    if (!usernameValidation.valid) return setError(usernameValidation.message || 'Invalid username');
    
    if (usernameAvailable === false) return setError('Username is taken');
    
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) return setError(emailValidation.message || 'Invalid email');
    
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) return setError(passwordValidation.message || 'Invalid password');
    
    if (password !== confirm) return setError('Passwords do not match');
    if (!agree) return setError('You must agree to the Terms of Service');

    setLoading(true);
    try {
      const normalizedUsername = username.toLowerCase().trim();
      const body = { 
        username: normalizedUsername, 
        email: email.trim(), 
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim()
      };
      const url = `${apiBase}/api/auth/signup`;
      
      console.log('[Signup] API URL:', url);
      console.log('[Signup] Request body:', { ...body, password: '***' });
      
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
      
      // Persist token and user data in auth context
      setUser({ 
        id: data.user?.id, 
        email: data.user?.email, 
        username: data.user?.username || normalizedUsername, 
        token: data.token 
      });
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

  const passwordStrength = password ? getPasswordStrength(password) : null;

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 420, padding: 12 }}>
      <h3>Create your account</h3>

      <label>
        First Name
        <input
          value={firstName}
          onChange={e => setFirstName(e.target.value)}
          placeholder="John"
          required
        />
      </label>

      <label>
        Last Name
        <input
          value={lastName}
          onChange={e => setLastName(e.target.value)}
          placeholder="Doe"
          required
        />
      </label>

      <label>
        Username
        <input
          value={username}
          onChange={e => setUsername(e.target.value.trim())}
          placeholder="Choose a username"
          required
        />
      </label>
      <div style={{ fontSize: 12, minHeight: 18, marginBottom: 8 }}>
        {checking ? (
          <span style={{ color: '#666' }}>Checking username...</span>
        ) : usernameFormatError ? (
          <span style={{ color: 'crimson' }}>{usernameFormatError}</span>
        ) : username ? (
          usernameAvailable ? (
            <span style={{ color: 'green' }}>✓ Username available</span>
          ) : usernameAvailable === false ? (
            <span style={{ color: 'crimson' }}>✗ Username taken</span>
          ) : null
        ) : (
          <span style={{ color: '#666' }}>Pick a unique username (3-30 characters, start with letter)</span>
        )}
      </div>

      <label>
        Email address
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
      </label>

      <label>
        Password
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
      </label>
      {password && passwordStrength && (
        <div style={{ fontSize: 12, marginBottom: 8 }}>
          Password strength: <span style={{ 
            color: passwordStrength.strength === 'weak' ? 'crimson' : passwordStrength.strength === 'medium' ? 'orange' : 'green',
            fontWeight: 'bold'
          }}>
            {passwordStrength.strength.toUpperCase()}
          </span>
        </div>
      )}

      <label>
        Confirm password
        <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required />
      </label>

      <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input type="checkbox" checked={agree} onChange={e => setAgree(e.target.checked)} />
        <span>I agree to the Terms of Service</span>
      </label>

      <button type="submit" disabled={loading || checking || usernameAvailable === false || !!usernameFormatError}>
        {loading ? 'Creating account...' : 'Create account'}
      </button>

      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
    </form>
  );
}
