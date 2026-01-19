import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useApi } from '../utils/api';

export default function ProfileView() {
  const { user, setUser } = useAuth();
  const { jsonFetch } = useApi();
  const [bio, setBio] = useState('');
  const [username, setUsername] = useState(user?.username || '');

  useEffect(() => {
    async function load() {
      try {
        // Fetch profile (backend may not use frontend username, but we include it in header/body)
        const profile = await jsonFetch(`/api/profiles/me`);
        setBio(profile.bio || '');
        if (profile.username) setUsername(profile.username);
      } catch (e) {
        // ignore
      }
    }
    load();
    // eslint-disable-next-line
  }, []);

  async function save() {
    try {
      const updated = await jsonFetch(`/api/profiles/me`, {
        method: 'PUT',
        body: { bio, username } // frontend username included
      } as any);
      setUser({ ...user, username: updated.username || username });
      alert('Profile saved');
    } catch (err: any) {
      alert(err?.message || 'Save failed');
    }
  }

  return (
    <div>
      <h3>Profile</h3>
      <label>
        Username
        <input value={username} onChange={e => setUsername(e.target.value)} />
      </label>
      <label>
        Bio
        <textarea value={bio} onChange={e => setBio(e.target.value)} />
      </label>
      <button onClick={save}>Save profile</button>
    </div>
  );
}
