import { useAuth } from '../contexts/AuthContext';

// Use VITE_API_URL for Vite projects, fallback to localhost
export const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export function useApi() {
  const { user } = useAuth();

  async function jsonFetch(path: string, options: RequestInit = {}) {
    const url = `${apiBase}${path}`;
    const headers = new Headers(options.headers || {});
    headers.set('Content-Type', 'application/json');
    if (user?.token) headers.set('Authorization', `Bearer ${user.token}`);
    if (user?.username) headers.set('X-Client-Username', user.username);

    let body = options.body;
    if (body && typeof body === 'object') {
      // inject username into JSON body if not already present
      const parsed = { ...(body as any) };
      if (!parsed.username && user?.username) parsed.username = user.username;
      body = JSON.stringify(parsed);
    }

    const res = await fetch(url, { ...options, headers, body });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      throw err;
    }
    return res.json().catch(() => ({}));
  }

  return { jsonFetch };
}
