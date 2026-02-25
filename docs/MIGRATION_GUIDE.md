# Migration Guide - Existing Database to New User Schema

## Overview

This guide helps you migrate an existing database to the new enhanced user management schema.

## ⚠️ Before You Start

1. **Backup your database** - Always backup before running migrations
2. **Test in development** - Run migrations in dev environment first
3. **Check dependencies** - Ensure all npm packages are installed
4. **Review changes** - Understand what will change in your schema

## 🔄 Migration Steps

### Step 1: Backup Database

```bash
# PostgreSQL backup
pg_dump -U your_username -d your_database > backup_$(date +%Y%m%d).sql

# Or use your database provider's backup tool
```

### Step 2: Update Prisma Schema

The new schema includes these changes to the User model:

**Added Fields:**
- `providerId` (String?) - OAuth provider user ID
- `twitter` (String?) - Twitter handle
- `skills` (String[]) - Array of skills
- `yearsOfExp` (Int?) - Years of experience
- `availability` (String?) - Availability status

**Modified Fields:**
- `provider` - Now has default value "local"
- `bio` - Changed to TEXT type for longer content

**Added Indexes:**
- Composite index on (provider, providerId)

### Step 3: Generate Prisma Client

```bash
cd backend
npx prisma generate
```

### Step 4: Create Migration

#### Option A: Automatic Migration (Recommended for Development)

```bash
npx prisma migrate dev --name add_user_profile_enhancements
```

This will:
1. Analyze schema changes
2. Generate migration SQL
3. Apply migration to database
4. Update Prisma Client

#### Option B: Manual Migration (Recommended for Production)

1. Generate migration without applying:
```bash
npx prisma migrate dev --create-only --name add_user_profile_enhancements
```

2. Review the generated SQL in `prisma/migrations/`

3. Apply manually when ready:
```bash
npx prisma migrate deploy
```

### Step 5: Run Manual SQL (If Needed)

If automatic migration fails due to drift, run this SQL manually:

```sql
-- Add new columns
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "providerId" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "twitter" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "skills" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "yearsOfExp" INTEGER;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "availability" TEXT;

-- Update existing columns
ALTER TABLE "User" ALTER COLUMN "provider" SET DEFAULT 'local';
ALTER TABLE "User" ALTER COLUMN "bio" TYPE TEXT;

-- Add indexes
CREATE INDEX IF NOT EXISTS "User_provider_providerId_idx" 
  ON "User"("provider", "providerId");

-- Update existing users
UPDATE "User" SET "provider" = 'local' WHERE "provider" IS NULL;
UPDATE "User" SET "skills" = ARRAY[]::TEXT[] WHERE "skills" IS NULL;
```

### Step 6: Verify Migration

```bash
# Check schema is in sync
npx prisma migrate status

# Verify in database
psql -U your_username -d your_database -c "\d \"User\""
```

### Step 7: Update Application Code

1. **Install new dependencies:**
```bash
npm install axios
```

2. **Update environment variables:**
```env
# Add to .env
FRONTEND_URL=http://localhost:5173
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_REDIRECT_URI=http://localhost:3001/api/auth/github/callback
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3001/api/auth/google/callback
```

3. **Restart application:**
```bash
npm run dev
```

## 🔍 Verification Checklist

After migration, verify:

- [ ] Existing users can still login
- [ ] User profiles display correctly
- [ ] New fields are accessible
- [ ] No data was lost
- [ ] Application starts without errors
- [ ] Database queries work
- [ ] Indexes are created

## 🐛 Troubleshooting

### Issue: Migration Drift Detected

**Symptom:** Prisma detects drift between schema and database

**Solution:**
1. Review drift details carefully
2. If safe, reset database: `npx prisma migrate reset` (⚠️ DELETES ALL DATA)
3. Or apply manual SQL from Step 5

### Issue: Cannot Add Column

**Symptom:** Error adding column with NOT NULL constraint

**Solution:**
```sql
-- Add column as nullable first
ALTER TABLE "User" ADD COLUMN "newColumn" TEXT;

-- Update existing rows
UPDATE "User" SET "newColumn" = 'default_value';

-- Then add constraint if needed
ALTER TABLE "User" ALTER COLUMN "newColumn" SET NOT NULL;
```

### Issue: Index Already Exists

**Symptom:** Error creating index that already exists

**Solution:**
```sql
-- Use IF NOT EXISTS
CREATE INDEX IF NOT EXISTS "index_name" ON "User"("column");

-- Or drop and recreate
DROP INDEX IF EXISTS "index_name";
CREATE INDEX "index_name" ON "User"("column");
```

### Issue: Type Conversion Error

**Symptom:** Cannot convert column type

**Solution:**
```sql
-- For bio TEXT conversion
ALTER TABLE "User" ALTER COLUMN "bio" TYPE TEXT USING bio::TEXT;

-- For array conversion
ALTER TABLE "User" ALTER COLUMN "skills" TYPE TEXT[] 
  USING CASE 
    WHEN skills IS NULL THEN ARRAY[]::TEXT[]
    ELSE skills::TEXT[]
  END;
```

## 📊 Data Migration Scripts

### Migrate Existing User Data

If you have existing users with old schema:

```sql
-- Set default provider for existing users
UPDATE "User" 
SET "provider" = 'local' 
WHERE "provider" IS NULL;

-- Initialize empty skills array
UPDATE "User" 
SET "skills" = ARRAY[]::TEXT[] 
WHERE "skills" IS NULL;

-- Set default availability
UPDATE "User" 
SET "availability" = 'not-available' 
WHERE "availability" IS NULL;
```

### Extract Skills from Bio

If you stored skills in bio text:

```sql
-- Example: Extract skills from bio (customize as needed)
UPDATE "User"
SET "skills" = string_to_array(
  regexp_replace(bio, '.*Skills:\s*([^\n]+).*', '\1', 'i'),
  ','
)
WHERE bio LIKE '%Skills:%';
```

## 🔄 Rollback Plan

If migration fails and you need to rollback:

### Step 1: Restore Database Backup

```bash
# PostgreSQL restore
psql -U your_username -d your_database < backup_YYYYMMDD.sql
```

### Step 2: Revert Prisma Schema

```bash
git checkout HEAD~1 -- prisma/schema.prisma
npx prisma generate
```

### Step 3: Restart Application

```bash
npm run dev
```

## 📝 Production Migration Checklist

For production environments:

- [ ] Schedule maintenance window
- [ ] Notify users of downtime
- [ ] Create database backup
- [ ] Test migration in staging
- [ ] Review migration SQL
- [ ] Prepare rollback plan
- [ ] Monitor application logs
- [ ] Verify data integrity
- [ ] Test critical user flows
- [ ] Update documentation

## 🎯 Post-Migration Tasks

After successful migration:

1. **Test OAuth flows:**
   - Set up GitHub OAuth app
   - Set up Google OAuth app
   - Test authentication

2. **Update frontend:**
   - Deploy new SocialAuthButtons component
   - Add /auth/callback route
   - Test OAuth integration

3. **Monitor:**
   - Check error logs
   - Monitor database performance
   - Watch for user issues

4. **Document:**
   - Update API documentation
   - Update user guides
   - Record migration date

## 📞 Support

If you encounter issues:

1. Check logs: `backend/logs/` or console output
2. Review Prisma docs: https://www.prisma.io/docs/
3. Check database logs
4. Review this guide's troubleshooting section

## ✅ Success Criteria

Migration is successful when:

- ✅ All existing users can login
- ✅ No data loss occurred
- ✅ New features work correctly
- ✅ Application is stable
- ✅ Performance is acceptable
- ✅ No critical errors in logs

---

**Remember:** Always test migrations in development before applying to production!
