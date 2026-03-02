# Security Best Practices

## ⚠️ JWT Token Security Alert

A JWT token was detected in logs/code. This document outlines security best practices to prevent token exposure.

## Critical Security Rules

### 1. Never Log Sensitive Data

❌ **NEVER DO THIS:**
```typescript
console.log('Token:', token);
console.log('JWT:', user.token);
console.log('Authorization:', req.headers.authorization);
console.log('Token preview:', token.substring(0, 20));
```

✅ **DO THIS INSTEAD:**
```typescript
console.log('Token present:', !!token);
console.log('Token length:', token?.length);
console.log('Authorization header:', header ? 'Present' : 'Missing');
```

### 2. Environment Variables

❌ **NEVER commit `.env` files:**
```bash
# Bad - exposes secrets
git add backend/.env
git add frontend/.env
```

✅ **Always use `.env.example`:**
```bash
# Good - template without secrets
git add backend/.env.example
git add frontend/.env.example
```

**Verify `.gitignore` includes:**
```
.env
.env.local
.env.*.local
*.env
```

### 3. JWT Secret Management

❌ **NEVER hardcode secrets:**
```typescript
const JWT_SECRET = 'my-secret-key-123'; // ❌ NEVER!
```

✅ **Always use environment variables:**
```typescript
const JWT_SECRET = process.env.JWT_SECRET; // ✅ Correct
```

**Generate strong secrets:**
```bash
# Generate a secure random secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 4. Token Storage (Frontend)

❌ **NEVER expose tokens in:**
- Console logs
- Error messages
- URL parameters
- Local storage keys visible in DevTools

✅ **DO:**
- Store in `localStorage` with proper key
- Clear on logout
- Validate before use
- Never log the actual token value

### 5. API Response Security

❌ **NEVER return tokens in error messages:**
```typescript
throw new Error(`Invalid token: ${token}`); // ❌ Exposes token
```

✅ **DO:**
```typescript
throw new Error('Invalid token'); // ✅ Generic message
```

### 6. Git History

If you've accidentally committed secrets:

```bash
# 1. Remove from current commit
git rm --cached backend/.env
git commit -m "Remove .env file"

# 2. If already pushed, you MUST:
# - Rotate all secrets (generate new JWT_SECRET, etc.)
# - Update .env files
# - Never reuse exposed secrets
```

### 7. Production Checklist

Before deploying:

- [ ] All `.env` files in `.gitignore`
- [ ] No hardcoded secrets in code
- [ ] No token logging in production
- [ ] Strong JWT_SECRET (64+ characters)
- [ ] HTTPS enabled
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Token expiration set (not too long)

### 8. Logging Best Practices

**Development:**
```typescript
if (process.env.NODE_ENV === 'development') {
  console.log('Token length:', token.length);
  console.log('User ID:', userId);
}
```

**Production:**
```typescript
// Use proper logging library
logger.info('User authenticated', { userId, role });
// Never log tokens, passwords, or sensitive data
```

### 9. Code Review Checklist

Before committing, check for:
- [ ] No `console.log` with tokens
- [ ] No hardcoded secrets
- [ ] No `.env` files
- [ ] No API keys in code
- [ ] No passwords in code

### 10. Incident Response

If a token is exposed:

1. **Immediately rotate the JWT_SECRET:**
   ```bash
   # Generate new secret
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   
   # Update backend/.env
   JWT_SECRET=<new-secret>
   
   # Restart backend
   npm run dev
   ```

2. **Invalidate all existing tokens:**
   - All users will need to login again
   - This is necessary for security

3. **Review git history:**
   ```bash
   # Check if secret was committed
   git log -p | grep JWT_SECRET
   ```

4. **If found in git history:**
   - Consider the secret permanently compromised
   - Never reuse it
   - Rotate immediately

## Current Status

✅ **Fixed Issues:**
- Removed token preview from logs
- Removed Authorization header logging
- Only logging token presence and length

✅ **Verified:**
- `.env` files are in `.gitignore`
- No hardcoded secrets in code
- No JWT tokens in code

## Monitoring

**Watch for these patterns in code:**
```bash
# Search for potential token leaks
grep -r "console.log.*token" .
grep -r "console.log.*jwt" .
grep -r "console.log.*authorization" .
grep -r "JWT_SECRET.*=" . --exclude-dir=node_modules
```

## Additional Resources

- [OWASP JWT Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [Secure Token Storage](https://auth0.com/docs/secure/security-guidance/data-security/token-storage)

## Quick Commands

```bash
# Generate new JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Check for exposed secrets
git log -p | grep -i "secret\|password\|token"

# Remove file from git history (if needed)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch backend/.env" \
  --prune-empty --tag-name-filter cat -- --all
```

## Remember

🔒 **Security is not optional**  
🔒 **When in doubt, don't log it**  
🔒 **Rotate secrets if exposed**  
🔒 **Never commit `.env` files**  
🔒 **Use environment variables for all secrets**
