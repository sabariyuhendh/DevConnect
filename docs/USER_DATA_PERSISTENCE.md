# User Data Persistence Guide

## Overview
This document explains how user data is persisted throughout the DevConnect application.

## Data Flow

### 1. Signup Flow
```
User fills form → Frontend validates → POST /api/auth/signup → Backend creates user in DB
→ Backend returns { token, user } → Frontend stores in localStorage & AuthContext
→ User redirected to /feed
```

### 2. Login Flow
```
User enters credentials → POST /api/auth/login → Backend validates & returns { token, user }
→ Frontend stores in localStorage & AuthContext → User redirected to /feed
```

### 3. Page Refresh
```
Page loads → AuthContext reads from localStorage → User data restored
→ App continues with authenticated state
```

### 4. Profile Page Load
```
User navigates to /profile → ProfilePage checks AuthContext → If authenticated:
GET /api/profiles/me with token → Backend returns full profile → Display data
```

## Storage Layers

### Layer 1: Database (PostgreSQL)
**Location:** Backend database via Prisma

**Stored Data:**
- id (unique identifier)
- email (unique)
- username (unique)
- password (hashed with bcrypt)
- firstName, lastName
- bio, title, company, location
- profilePicture, coverPicture
- skills (array)
- yearsOfExp, availability
- github, linkedin, twitter, website
- isOnline, lastSeen
- profileViews
- preferences (JSON)
- createdAt, updatedAt

**Persistence:** Permanent until deleted

**Access:** Backend only, via Prisma ORM

### Layer 2: LocalStorage (Browser)
**Location:** `localStorage.dc_user`

**Stored Data:**
```json
{
  "id": "user_id",
  "email": "user@example.com",
  "username": "johndoe",
  "firstName": "John",
  "lastName": "Doe",
  "profilePicture": "https://...",
  "token": "jwt_token_here"
}
```

**Persistence:** Until user logs out or clears browser data

**Access:** Frontend JavaScript

**Purpose:** 
- Maintain session across page refreshes
- Quick access to basic user info
- Store JWT token for API requests

### Layer 3: React Context (AuthContext)
**Location:** In-memory React state

**Stored Data:** Same as localStorage + additional fields loaded from API

**Persistence:** Only during current session (lost on page refresh, but restored from localStorage)

**Access:** Any React component via `useAuth()` hook

**Purpose:**
- Provide user data to all components
- Centralized authentication state
- Easy access without prop drilling

## Data Synchronization

### On Signup/Login
1. Backend creates/validates user
2. Backend returns user data + JWT token
3. Frontend receives response
4. Frontend calls `setUser(userData)` in AuthContext
5. AuthContext stores to localStorage
6. AuthContext updates React state
7. All components re-render with new user data

### On Page Refresh
1. App loads
2. AuthContext initializes
3. AuthContext reads from localStorage
4. If data exists, restore to React state
5. App continues with authenticated state

### On Profile Page Load
1. Component checks `isAuthenticated` from AuthContext
2. If authenticated, fetch full profile from API
3. Display merged data (localStorage + API response)
4. Update local state with fresh data

### On Logout
1. User clicks logout
2. Frontend calls `signOut()` from AuthContext
3. AuthContext clears React state
4. AuthContext removes from localStorage
5. User redirected to login page

## Code Examples

### Storing User Data (Login/Signup)
```typescript
// In Login.tsx or Signup.tsx
const userData = {
  id: data.user?.id,
  email: data.user?.email,
  username: data.user?.username,
  firstName: data.user?.firstName,
  lastName: data.user?.lastName,
  profilePicture: data.user?.profilePicture,
  token: data.token
};

setUser(userData); // Automatically persists to localStorage
```

### Reading User Data
```typescript
// In any component
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }
  
  return <div>Hello, {user?.firstName}!</div>;
}
```

### Fetching Fresh Profile Data
```typescript
// In ProfilePage.tsx
const { user, isAuthenticated } = useAuth();

useEffect(() => {
  const fetchProfile = async () => {
    const res = await fetch(`${API_BASE}/api/profiles/me`, {
      headers: {
        'Authorization': `Bearer ${user.token}`
      }
    });
    const data = await res.json();
    setProfileData(data.user);
  };
  
  if (isAuthenticated) {
    fetchProfile();
  }
}, [user, isAuthenticated]);
```

### Logging Out
```typescript
// In any component
import { useAuth } from '@/contexts/AuthContext';

function LogoutButton() {
  const { signOut } = useAuth();
  
  return (
    <button onClick={signOut}>
      Logout
    </button>
  );
}
```

## Data Consistency

### Ensuring Data is Up-to-Date

**Problem:** LocalStorage data might be stale

**Solution:** Always fetch fresh data from API for critical operations

**Example:**
```typescript
// Profile page fetches fresh data on load
useEffect(() => {
  fetchProfile(); // Gets latest from database
}, []);

// But uses localStorage data for quick display
const displayName = user?.firstName || 'User';
```

### Handling Token Expiration

**Problem:** JWT tokens expire after 15 minutes

**Solution:** 
1. Backend returns 401 Unauthorized
2. Frontend catches error
3. Frontend clears localStorage
4. Frontend redirects to login

**Example:**
```typescript
try {
  const res = await fetch(url, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (res.status === 401) {
    signOut(); // Clear data and redirect
    return;
  }
} catch (error) {
  // Handle error
}
```

## Security Considerations

### What's Stored in LocalStorage
- ✅ User ID (safe to store)
- ✅ Email (safe to store)
- ✅ Username (safe to store)
- ✅ Name (safe to store)
- ✅ Profile picture URL (safe to store)
- ✅ JWT token (necessary for API requests)
- ❌ Password (NEVER stored - only hashed in database)

### Token Security
- Tokens are short-lived (15 minutes)
- Tokens are validated on every API request
- Tokens are cleared on logout
- Tokens are stored in localStorage (XSS risk - use HTTPS in production)

### Best Practices
1. Always use HTTPS in production
2. Implement refresh tokens for longer sessions
3. Clear sensitive data on logout
4. Validate tokens on backend
5. Use secure, httpOnly cookies for tokens (future improvement)

## Debugging

### Check LocalStorage
```javascript
// In browser console
console.log(localStorage.getItem('dc_user'));
```

### Check AuthContext
```javascript
// In React DevTools
// Find AuthContext.Provider
// Inspect value prop
```

### Clear User Data
```javascript
// In browser console
localStorage.removeItem('dc_user');
window.location.reload();
```

### Verify Token
```bash
# Decode JWT token (use jwt.io or)
echo "YOUR_TOKEN" | cut -d'.' -f2 | base64 -d | jq
```

## Common Issues

### Issue: User data lost on refresh
**Cause:** LocalStorage not being read
**Solution:** Check AuthContext initialization in `AuthContext.tsx`

### Issue: Profile page shows old data
**Cause:** Not fetching fresh data from API
**Solution:** Ensure `useEffect` in ProfilePage calls API

### Issue: "Please log in" after refresh
**Cause:** Token expired or localStorage cleared
**Solution:** Log in again, implement refresh tokens

### Issue: Username/email already exists
**Cause:** Duplicate data in database
**Solution:** Backend validates uniqueness, show error to user

## Future Improvements

1. **Refresh Tokens:** Implement long-lived refresh tokens
2. **Optimistic Updates:** Update UI before API response
3. **Offline Support:** Cache data for offline access
4. **Real-time Sync:** WebSocket for live updates
5. **Encrypted Storage:** Encrypt sensitive data in localStorage
6. **Session Management:** Track multiple devices/sessions
7. **Data Validation:** Validate data before storing
8. **Error Recovery:** Automatic retry on network errors
