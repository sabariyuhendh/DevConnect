# Network Setup Guide - DevConnect

## Issues Fixed

### 1. Username Check Issue
- **Problem**: Username was always showing as "taken" even when available
- **Root Cause**: 
  - Frontend was using wrong environment variable (`REACT_APP_API_BASE` instead of `VITE_API_URL`)
  - Boolean conversion logic was incorrect
- **Fix**: 
  - Updated to use `import.meta.env.VITE_API_URL` for Vite
  - Changed to explicit `data.available === true` check
  - Added console logging for debugging

### 2. API Connection Issue
- **Problem**: Frontend couldn't connect to backend API
- **Root Cause**: 
  - Wrong environment variable name
  - CORS not properly configured for network access
- **Fix**: 
  - Updated API base URL configuration
  - Enhanced CORS to allow all origins in development
  - Added proper CORS headers

## Setup Instructions

### For Local Development (Same Machine)

#### Backend (.env)
```env
PORT=3001
NODE_ENV="development"
FRONTEND_URL=http://localhost:5173
CORS_ORIGIN=*
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:3001
```

### For Network Access (Different Devices on Same Network)

#### Step 1: Find Your Local IP Address

**On Windows:**
```bash
ipconfig
# Look for "IPv4 Address" under your active network adapter
# Example: 192.168.1.100
```

**On Mac/Linux:**
```bash
ifconfig
# or
ip addr show
# Look for inet address (not 127.0.0.1)
# Example: 192.168.1.100
```

#### Step 2: Update Backend Configuration

**Backend (.env)**
```env
PORT=3001
NODE_ENV="development"
FRONTEND_URL=http://192.168.1.100:5173
CORS_ORIGIN=*
```

#### Step 3: Update Frontend Configuration

**Frontend (.env)**
```env
VITE_API_URL=http://192.168.1.100:3001
```

#### Step 4: Start Servers

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
npm run dev -- --host
```

Note: The `--host` flag allows Vite to accept connections from network.

#### Step 5: Access from Other Devices

- On the same device: `http://localhost:5173`
- From other devices on network: `http://192.168.1.100:5173`

### For Production

#### Backend (.env)
```env
PORT=3001
NODE_ENV="production"
FRONTEND_URL=https://your-domain.com
CORS_ORIGIN=https://your-domain.com
```

#### Frontend (.env)
```env
VITE_API_URL=https://api.your-domain.com
```

## Troubleshooting

### Username Check Still Not Working

1. **Check browser console** for error messages
2. **Verify API URL** is correct in frontend/.env
3. **Check backend logs** for incoming requests
4. **Test API directly**:
   ```bash
   curl "http://localhost:3001/api/auth/check-username?username=testuser"
   ```

### Cannot Connect from Network

1. **Firewall**: Ensure ports 3001 and 5173 are not blocked
2. **Network**: Ensure devices are on the same network
3. **IP Address**: Verify you're using the correct local IP
4. **Backend binding**: Ensure backend is listening on 0.0.0.0, not just localhost

### CORS Errors

1. **Check CORS_ORIGIN** in backend/.env
2. **Restart backend** after changing .env
3. **Clear browser cache** and reload
4. **Check browser console** for specific CORS error messages

## Testing the Fix

### Test Username Check

1. Go to signup page
2. Type a username (at least 2 characters)
3. Wait 400ms for debounce
4. Should see "Username available" in green if available
5. Check browser console for logs:
   - "Username check response: {available: true/false}"

### Test API Connection

1. Open browser DevTools → Network tab
2. Try to signup/login
3. Check if requests are going to correct URL
4. Verify response status codes (200 = success, 4xx/5xx = error)

## Additional Notes

- **Development Mode**: CORS is set to allow all origins (`*`)
- **Production Mode**: Set specific CORS_ORIGIN for security
- **Environment Variables**: Restart servers after changing .env files
- **Vite Projects**: Use `VITE_` prefix for environment variables
- **React Projects**: Use `REACT_APP_` prefix for environment variables
