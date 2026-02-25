# Testing Checklist - User Management & Authentication

## 🧪 Manual Testing Guide

### Local Authentication

#### Signup
- [ ] Can create account with valid email, password, and username
- [ ] Cannot create account with existing email
- [ ] Cannot create account with existing username
- [ ] Password is properly hashed in database
- [ ] Receives JWT token on successful signup
- [ ] User is created with correct default values
- [ ] Provider is set to "local"

#### Login
- [ ] Can login with correct email and password
- [ ] Cannot login with incorrect password
- [ ] Cannot login with non-existent email
- [ ] Receives JWT token on successful login
- [ ] Last seen timestamp is updated
- [ ] Online status is set to true

#### Username Check
- [ ] Returns `available: true` for unused username
- [ ] Returns `available: false` for taken username
- [ ] Handles special characters correctly
- [ ] Case-insensitive check works

### OAuth Authentication

#### GitHub OAuth
- [ ] Clicking "Continue with GitHub" redirects to GitHub
- [ ] GitHub authorization page displays correctly
- [ ] After authorization, redirects back to app
- [ ] New user is created with GitHub data
- [ ] Existing user is linked to GitHub account
- [ ] Profile picture is imported from GitHub
- [ ] GitHub username is stored
- [ ] Email is verified automatically
- [ ] Receives JWT token
- [ ] Redirects to /auth/callback with token
- [ ] Frontend extracts and stores token
- [ ] User is redirected to /feed

#### Google OAuth
- [ ] Clicking "Continue with Google" redirects to Google
- [ ] Google authorization page displays correctly
- [ ] After authorization, redirects back to app
- [ ] New user is created with Google data
- [ ] Existing user is linked to Google account
- [ ] Profile picture is imported from Google
- [ ] Email is verified automatically
- [ ] Receives JWT token
- [ ] Redirects to /auth/callback with token
- [ ] Frontend extracts and stores token
- [ ] User is redirected to /feed

### Profile Management

#### Get Profile
- [ ] Can get own profile with /api/profiles/me
- [ ] Can get other user's profile by username
- [ ] Profile includes all expected fields
- [ ] Profile views increment when viewing others
- [ ] Profile views don't increment when viewing own
- [ ] Follow status is correctly shown
- [ ] Follower/following counts are accurate

#### Update Profile
- [ ] Can update firstName and lastName
- [ ] Can update bio (long text)
- [ ] Can update title and company
- [ ] Can update location
- [ ] Can update website (validates URL)
- [ ] Can update social links (github, linkedin, twitter)
- [ ] Can update skills array
- [ ] Can update years of experience
- [ ] Can update availability status
- [ ] Can update timezone and locale
- [ ] Cannot update with invalid data
- [ ] Validation errors are clear

#### Profile Pictures
- [ ] Can update profile picture with valid URL
- [ ] Can update cover picture with valid URL
- [ ] Invalid URLs are rejected
- [ ] Pictures are displayed correctly

#### Preferences
- [ ] Can update notification preferences
- [ ] Can update privacy preferences
- [ ] Can update theme preferences
- [ ] Preferences are stored as JSON
- [ ] Preferences persist across sessions

### Social Features

#### Follow/Unfollow
- [ ] Can follow another user
- [ ] Cannot follow yourself
- [ ] Cannot follow same user twice
- [ ] Can unfollow a user
- [ ] Follow count updates correctly
- [ ] Follower count updates correctly
- [ ] Follow status updates in UI

#### Followers/Following Lists
- [ ] Can get list of followers
- [ ] Can get list of following
- [ ] Lists show correct user data
- [ ] Lists are ordered by date (newest first)
- [ ] Online status is shown correctly

#### User Search
- [ ] Can search by username
- [ ] Can search by first name
- [ ] Can search by last name
- [ ] Can search by title
- [ ] Can search by company
- [ ] Search is case-insensitive
- [ ] Results are limited correctly
- [ ] Results are ordered by profile views

### Authentication & Authorization

#### Protected Routes
- [ ] Cannot access /api/profiles/me without token
- [ ] Cannot update profile without token
- [ ] Cannot follow users without token
- [ ] Invalid token returns 401
- [ ] Expired token returns 401
- [ ] Missing token returns 401

#### Token Management
- [ ] Token is stored in localStorage
- [ ] Token is sent in Authorization header
- [ ] Token is validated on each request
- [ ] Token contains correct user ID
- [ ] Token expires after configured time

#### Logout
- [ ] Logout sets online status to false
- [ ] Logout updates last seen timestamp
- [ ] Token is removed from frontend
- [ ] User is redirected to login

### Data Validation

#### Input Validation
- [ ] Email format is validated
- [ ] Password strength is enforced
- [ ] Username format is validated
- [ ] URL format is validated
- [ ] Array fields accept arrays
- [ ] Number fields accept numbers
- [ ] Enum fields accept valid values only

#### Error Messages
- [ ] Validation errors are descriptive
- [ ] Database errors are handled gracefully
- [ ] OAuth errors are handled gracefully
- [ ] Network errors are handled gracefully

### Security

#### Password Security
- [ ] Passwords are hashed with bcrypt
- [ ] Plain passwords are never stored
- [ ] Passwords are never returned in responses
- [ ] Password comparison is secure

#### OAuth Security
- [ ] Client secrets are not exposed
- [ ] Redirect URIs are validated
- [ ] State parameter prevents CSRF (if implemented)
- [ ] Tokens are transmitted securely

#### Data Privacy
- [ ] Email is not exposed publicly (unless user allows)
- [ ] Phone is not exposed publicly (unless user allows)
- [ ] Sensitive data requires authentication

### Performance

#### Database Queries
- [ ] Profile queries use indexes
- [ ] Search queries are optimized
- [ ] Follow queries use composite indexes
- [ ] No N+1 query problems

#### Response Times
- [ ] Signup completes in < 2 seconds
- [ ] Login completes in < 1 second
- [ ] Profile fetch completes in < 500ms
- [ ] Search completes in < 1 second

### Edge Cases

#### Unique Constraints
- [ ] Duplicate email is rejected
- [ ] Duplicate username is rejected
- [ ] Duplicate follow is rejected

#### Null/Empty Values
- [ ] Optional fields can be null
- [ ] Empty strings are handled correctly
- [ ] Empty arrays are handled correctly

#### Special Characters
- [ ] Usernames with special chars work
- [ ] Bios with emojis work
- [ ] URLs with query params work

#### Large Data
- [ ] Long bios (500 chars) work
- [ ] Many skills (50+) work
- [ ] Large follower lists work

### Frontend Integration

#### UI Components
- [ ] SocialAuthButtons render correctly
- [ ] GitHub button has correct icon
- [ ] Google button has correct icon
- [ ] Buttons are clickable
- [ ] Loading states are shown

#### Auth Callback
- [ ] /auth/callback extracts token
- [ ] Token is stored correctly
- [ ] User data is fetched
- [ ] Auth context is updated
- [ ] Redirect to /feed works
- [ ] Error handling works

#### Routing
- [ ] /auth/callback route exists
- [ ] Protected routes redirect to login
- [ ] Login redirects to feed after success
- [ ] Signup redirects to feed after success

### Browser Compatibility

- [ ] Works in Chrome
- [ ] Works in Firefox
- [ ] Works in Safari
- [ ] Works in Edge
- [ ] Mobile browsers work

### Environment Configuration

#### Development
- [ ] localhost URLs work
- [ ] Development database works
- [ ] Environment variables load correctly
- [ ] Hot reload works

#### Production
- [ ] HTTPS URLs work
- [ ] Production database works
- [ ] Environment variables are secure
- [ ] CORS is configured correctly

## 🔧 Automated Testing (Future)

### Unit Tests
- [ ] Password hashing function
- [ ] JWT token generation
- [ ] JWT token verification
- [ ] Input validation schemas
- [ ] Username uniqueness check

### Integration Tests
- [ ] Signup endpoint
- [ ] Login endpoint
- [ ] Profile update endpoint
- [ ] Follow/unfollow endpoints
- [ ] Search endpoint

### E2E Tests
- [ ] Complete signup flow
- [ ] Complete login flow
- [ ] Complete OAuth flow
- [ ] Complete profile update flow
- [ ] Complete follow flow

## 📊 Test Results Template

```
Date: ___________
Tester: ___________
Environment: [ ] Development [ ] Staging [ ] Production

Local Authentication:
- Signup: [ ] Pass [ ] Fail - Notes: ___________
- Login: [ ] Pass [ ] Fail - Notes: ___________
- Username Check: [ ] Pass [ ] Fail - Notes: ___________

OAuth:
- GitHub: [ ] Pass [ ] Fail - Notes: ___________
- Google: [ ] Pass [ ] Fail - Notes: ___________

Profile Management:
- Get Profile: [ ] Pass [ ] Fail - Notes: ___________
- Update Profile: [ ] Pass [ ] Fail - Notes: ___________
- Pictures: [ ] Pass [ ] Fail - Notes: ___________

Social Features:
- Follow/Unfollow: [ ] Pass [ ] Fail - Notes: ___________
- Search: [ ] Pass [ ] Fail - Notes: ___________

Security:
- Authentication: [ ] Pass [ ] Fail - Notes: ___________
- Authorization: [ ] Pass [ ] Fail - Notes: ___________

Overall Status: [ ] All Pass [ ] Some Failures [ ] Major Issues

Critical Issues:
1. ___________
2. ___________

Minor Issues:
1. ___________
2. ___________
```

## 🐛 Common Issues & Solutions

### Issue: OAuth redirect_uri_mismatch
**Solution:** Verify redirect URI in OAuth app matches exactly with backend .env

### Issue: Token not received after OAuth
**Solution:** Check FRONTEND_URL in backend .env, verify CORS settings

### Issue: Cannot create user
**Solution:** Run `npx prisma generate`, check database connection

### Issue: Password validation fails
**Solution:** Ensure password meets minimum requirements (length, complexity)

### Issue: Profile picture not updating
**Solution:** Verify URL is valid and accessible, check CORS for image URLs

### Issue: Search returns no results
**Solution:** Check database has users, verify search query format

### Issue: Follow count incorrect
**Solution:** Check for duplicate follows, verify database constraints

## ✅ Sign-Off

- [ ] All critical tests pass
- [ ] No security vulnerabilities
- [ ] Performance is acceptable
- [ ] Documentation is complete
- [ ] Ready for deployment

Signed: ___________ Date: ___________
