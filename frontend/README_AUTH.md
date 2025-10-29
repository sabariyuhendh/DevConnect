# DevConnect — Frontend: Username integration & auth notes

Purpose
- Ensure the chosen username (entered on signup) is available across the frontend UI (profiles, feeds, posts, chats) and included with API calls so the app shows a stable display name even if the backend does not immediately return it.

Where username is stored (frontend)
- Auth context: src/contexts/AuthContext.tsx (persist in localStorage). The context must expose setUser and user with { id?, email?, username?, token? }.
- Signup: src/pages/Signup.tsx — writes username into AuthContext after successful signup.
- Signin/social flows: include username if the user supplies one and persist it similarly.

Where username is used in the UI
- Profile pages/components: show user.username first, fallback to email local-part.
- Feed items / posts: show post.authorUsername if available, else post.author.username or email prefix.
- Chat messages: show message.authorUsername or derive from message.author.
- Any optimistic client update (new post, new chat message) should include authorUsername from the AuthContext so the UI displays immediately.

API integration (recommended helper)
- Add a small helper that injects current frontend username into JSON payloads and sets header `X-Client-Username`. Example (place in src/utils/api.ts and wire into your hooks):

```typescript
// example: src/utils/api.ts
// This is the minimal idea — adapt to your app's hook pattern
import { getAuthUser } from '@/contexts/AuthContext'; // or import hook

export async function jsonFetch(url: string, options: RequestInit = {}) {
  const base = process.env.REACT_APP_API_BASE || '';
  const auth = getAuthUser(); // implement getAuthUser to return stored user
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (auth?.token) headers.set('Authorization', `Bearer ${auth.token}`);
  if (auth?.username) headers.set('X-Client-Username', auth.username);

  let body = options.body;
  if (body && typeof body !== 'string') {
    const parsed = { ...(body as any) };
    if (!parsed.username && auth?.username) parsed.username = auth.username;
    body = JSON.stringify(parsed);
  }
  return fetch(base + url, { ...options, headers, body });
}
```

Backend endpoints expected by frontend
- GET /api/auth/check-username?username=xxx -> { available: true|false }
- POST /api/auth/signup { firstName, lastName, email, username, password } -> ideally returns { token, user: { id, email, username } }
- POST /api/auth/signin { email, password, username? } -> return token + user
- POST /api/auth/oauth/:provider/complete { token, username } -> return token + user

Frontend flow checklist (what to implement in code)
1. Signup: on submit send username to backend and then persist username in AuthContext (done in src/pages/Signup.tsx).
2. Signin/OAuth: accept client-supplied username and persist it when appropriate.
3. API helper: ensure username is injected into outgoing payloads and header `X-Client-Username`.
4. UI components: always prefer to render username from AuthContext or response payloads; fallback to email prefix or generated label.
5. WebSockets / realtime: when sending a new chat message include authorUsername from AuthContext; server should replace with canonical username if different.

Notes on server-authoritative usernames
- Frontend persistence is immediate UX improvement; to make username canonical, have backend persist username on signup / oauth-complete and return it in auth responses. Enforce uniqueness at DB level.

Where to change in the repo
- ctx: src/contexts/AuthContext.tsx — ensure it saves username to localStorage and exposes getAuthUser or useAuth.
- api helper: src/utils/api.ts — inject username into bodies/headers.
- UI: update FeedItem, ChatMessage, ProfileView to read and prefer authorUsername/user.username.

If you want, I can:
- Add a tiny jsonFetch helper file into src/utils/api.ts that uses your project's alias setup.
- Update FeedItem and ChatMessage components to prefer authorUsername and show the AuthContext username where applicable.
