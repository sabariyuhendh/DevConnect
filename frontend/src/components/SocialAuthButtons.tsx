import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiBase } from '../utils/api';

type Provider = 'google' | 'github';

export default function SocialAuthButtons() {
  const { setUser } = useAuth();

  async function handleOAuth(provider: Provider) {
    try {
      // Example: open popup to provider OAuth endpoint that returns token via redirect or postMessage.
      // For simplicity, we assume the backend redirects back to the app with a token in query or we can open a popup.
      // Here we call a direct endpoint that would normally start OAuth; implementation detail depends on your app.
      const popup = window.open(`${apiBase}/api/auth/oauth/${provider}`, '_blank', 'width=500,height=600');
      if (!popup) throw new Error('Popup blocked');

      // Simple message-based flow - wait for popup to send back token via postMessage
      const token: string = await new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('OAuth timeout')), 60000);
        function handler(e: MessageEvent) {
          if (e.data?.dc_oauth_token) {
            clearTimeout(timer);
            window.removeEventListener('message', handler);
            resolve(e.data.dc_oauth_token);
          }
        }
        window.addEventListener('message', handler);
      });

      // Ask for username if not present
      let username = prompt('Choose a username for this app (frontend-only):') || '';
      if (!username) username = `user_${Math.random().toString(36).slice(2, 8)}`;

      // Send token + username to backend finalization endpoint
      const res = await fetch(`${apiBase}/api/auth/oauth/${provider}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, username })
      });
      if (!res.ok) throw await res.json();
      const data = await res.json();
      setUser({ id: data.user?.id, email: data.user?.email, username, token: data.token });
    } catch (err: any) {
      console.error('OAuth failed', err);
      alert(err?.message || 'OAuth failed');
    }
  }

  return (
    <div>
      <button onClick={() => handleOAuth('google')}>Continue with Google</button>
      <button onClick={() => handleOAuth('github')}>Continue with GitHub</button>
    </div>
  );
}
