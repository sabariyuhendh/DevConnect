# DevConnect - Quick Fix Checklist

**Priority-based action items for completing the platform**

---

## 🔴 CRITICAL FIXES (Do First)

### 1. Profile Page - Remove Hardcoded Data
**File:** `frontend/src/pages/Profile.tsx`  
**Issue:** All profile data is hardcoded (lines 48-136)  
**Fix:**
```typescript
// Replace hardcoded profile object with API call
const { data: profile, loading } = useQuery('/api/profile/:userId');
```
**Estimated Time:** 4 hours

### 2. Events Page - Remove Hardcoded Data
**File:** `frontend/src/pages/Events.tsx`  
**Issue:** All events are hardcoded (lines 15-101)  
**Fix:**
- Create backend endpoints: GET /api/events, POST /api/events
- Integrate frontend with API
- Remove hardcoded arrays
**Estimated Time:** 8 hours

### 3. Implement File Upload System
**Files:** Backend + Frontend  
**Issue:** No file upload functionality exists  
**Fix:**
- Choose storage (recommend Cloudinary or AWS S3)
- Create upload endpoint: POST /api/upload
- Add multer middleware
- Implement image processing
- Update profile picture/cover photo endpoints
**Estimated Time:** 12 hours

### 4. Activate Email System
**File:** `backend/src/utils/email.ts`  
**Issue:** Email service configured but not used  
**Fix:**
- Create email templates (welcome, verification, reset)
- Implement sendVerificationEmail()
- Implement sendPasswordResetEmail()
- Add email queue (optional: Bull/Redis)
**Estimated Time:** 8 hours

### 5. Implement Notification System
**Files:** Backend + Frontend  
**Issue:** No notifications are generated or displayed  
**Fix:**
- Create Notification model in database
- Add notification generation on events (likes, comments, etc.)
- Create GET /api/notifications endpoint
- Build notification dropdown UI
- Add real-time delivery via WebSocket
**Estimated Time:** 16 hours

### 6. Implement Messaging System
**Files:** Backend + Frontend  
**Issue:** Database schema exists, no implementation  
**Fix:**
- Create POST /api/conversations endpoint
- Create POST /api/messages endpoint
- Create GET /api/conversations endpoint
- Build messaging UI
- Add real-time message delivery
**Estimated Time:** 20 hours

---

## 🟡 HIGH PRIORITY FIXES

### 7. Connection System
**Issue:** Cannot send/accept connection requests  
**Endpoints Needed:**
- POST /api/connections/request
- POST /api/connections/:id/accept
- POST /api/connections/:id/decline
- GET /api/connections
- DELETE /api/connections/:id
**Estimated Time:** 10 hours

### 8. Event RSVP Functionality
**Issue:** RSVP buttons don't work  
**Endpoints Needed:**
- POST /api/events/:id/rsvp
- GET /api/events/:id/attendees
- DELETE /api/events/:id/rsvp
**Estimated Time:** 6 hours

### 9. Skills/Experience/Education Management
**Issue:** Display only, no CRUD operations  
**Endpoints Needed:**
- POST /api/profile/skills
- DELETE /api/profile/skills/:id
- POST /api/profile/experience
- PUT /api/profile/experience/:id
- DELETE /api/profile/experience/:id
- POST /api/profile/education
- PUT /api/profile/education/:id
- DELETE /api/profile/education/:id
**Estimated Time:** 12 hours

### 10. Content Moderation System
**Issue:** User reports not functional  
**Endpoints Needed:**
- POST /api/reports
- GET /api/admin/reports
- PUT /api/admin/reports/:id/resolve
- POST /api/admin/posts/:id/hide
**Estimated Time:** 10 hours

---

## 🟢 MEDIUM PRIORITY FIXES

### 11. OAuth Integration (GitHub, Google)
**Endpoints Needed:**
- GET /api/auth/github
- GET /api/auth/github/callback
- GET /api/auth/google
- GET /api/auth/google/callback
**Estimated Time:** 12 hours

### 12. Two-Factor Authentication
**Libraries:** speakeasy, qrcode  
**Endpoints Needed:**
- POST /api/auth/2fa/enable
- POST /api/auth/2fa/verify
- POST /api/auth/2fa/disable
- GET /api/auth/2fa/qrcode
**Estimated Time:** 10 hours

### 13. Job Recommendations
**Issue:** Algorithm designed but not implemented  
**Fix:**
- Implement skill matching algorithm
- Create GET /api/jobs/recommendations endpoint
- Add recommendation section to Jobs page
**Estimated Time:** 8 hours

### 14. Advanced Job Search
**Issue:** Basic search only  
**Fix:**
- Add skill-based filtering
- Add salary range filtering
- Add sort options
- Update GET /api/jobs endpoint
**Estimated Time:** 6 hours

### 15. Saved Jobs UI
**Issue:** Backend exists, UI missing  
**Fix:**
- Create saved jobs page
- Add bookmark functionality to job cards
- Create GET /api/jobs/saved endpoint integration
**Estimated Time:** 4 hours

---

## 🔵 LOW PRIORITY FIXES

### 16. Follow System
**Endpoints Needed:**
- POST /api/users/:id/follow
- DELETE /api/users/:id/unfollow
- GET /api/users/:id/followers
- GET /api/users/:id/following
**Estimated Time:** 6 hours

### 17. Post Sharing
**Endpoints Needed:**
- POST /api/posts/:id/share
- Update share count tracking
**Estimated Time:** 4 hours

### 18. Trending Articles Curation
**Issue:** Database schema exists, no curation  
**Fix:**
- Integrate RSS feed parser
- Create article scraping service
- Add cron job for article updates
- Create GET /api/cave/articles endpoint
**Estimated Time:** 12 hours

### 19. Code Snippets Feature
**Issue:** Not started  
**Fix:**
- Create CodeSnippet model
- Add syntax highlighting (highlight.js or prism)
- Create CRUD endpoints
- Build snippet UI
**Estimated Time:** 10 hours

### 20. Achievements System
**Issue:** Hardcoded, no unlock logic  
**Fix:**
- Create achievement definitions
- Implement unlock triggers
- Add achievement tracking
- Create GET /api/achievements endpoint
**Estimated Time:** 8 hours

---

## QUICK WINS (< 2 hours each)

### ✅ Easy Fixes

1. **Remove Placeholder Middleware**
   - File: `backend/src/middleware/security.js`
   - File: `backend/src/middleware/validate copy.js`
   - Action: Delete or implement properly

2. **Fix Activity Stats**
   - File: `frontend/src/pages/Feed.tsx`
   - Issue: Hardcoded to 0
   - Action: Fetch from API

3. **Add Missing TODO Notifications**
   - File: `backend/src/controllers/jobController.ts`
   - Line: 454
   - Action: Implement rejection notification

4. **Remove Duplicate Files**
   - File: `backend/src/middleware/validate copy.js`
   - Action: Delete duplicate file

5. **Fix Contribution Heatmap**
   - File: `frontend/src/components/ContributionHeatmap.tsx`
   - Issue: Displays but not functional
   - Action: Connect to real activity data

---

## TESTING CHECKLIST

### Before Deployment

- [ ] All hardcoded data removed
- [ ] File upload working (profile pictures, cover photos)
- [ ] Email verification working
- [ ] Password reset working
- [ ] Messaging system functional
- [ ] Notifications working
- [ ] Connection requests working
- [ ] Event RSVP working
- [ ] Job application flow complete
- [ ] Admin moderation tools working
- [ ] Mobile responsiveness verified
- [ ] Security audit completed
- [ ] Performance testing done
- [ ] Error handling tested
- [ ] API documentation updated

---

## ESTIMATED TOTAL TIME

- **Critical Fixes:** ~68 hours (1.5-2 weeks)
- **High Priority:** ~50 hours (1-1.5 weeks)
- **Medium Priority:** ~52 hours (1-1.5 weeks)
- **Low Priority:** ~40 hours (1 week)

**Total:** ~210 hours (~5-6 weeks with 1 developer)

---

## RECOMMENDED SPRINT PLAN

### Sprint 1 (Week 1-2): Critical Fixes
- Profile page API integration
- Events page API integration
- File upload system
- Email system activation

### Sprint 2 (Week 3-4): Core Social Features
- Notification system
- Messaging system
- Connection system
- Event RSVP

### Sprint 3 (Week 5-6): Enhancement & Polish
- Skills/Experience/Education management
- Content moderation
- OAuth integration
- Job recommendations

### Sprint 4 (Week 7-8): Final Features & Testing
- Advanced search
- Follow system
- Post sharing
- Comprehensive testing
- Bug fixes
- Documentation

---

## PRIORITY MATRIX

```
High Impact, High Effort:
- File Upload System
- Messaging System
- Notification System

High Impact, Low Effort:
- Profile API Integration
- Events API Integration
- Email System Activation

Low Impact, High Effort:
- Trending Articles
- Code Snippets
- Advanced Analytics

Low Impact, Low Effort:
- Follow System
- Post Sharing
- Activity Stats Fix
```

---

**Focus on High Impact items first, regardless of effort!**

**Document Version:** 1.0  
**Last Updated:** March 19, 2026
