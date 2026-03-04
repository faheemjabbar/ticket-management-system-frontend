# Deployment Guide

## Production Environment Setup

### 1. Environment Variables

Set the following environment variable in your hosting platform (Vercel, Netlify, etc.):

```env
NEXT_PUBLIC_API_URL=https://your-backend-url.com
```

**Important:**
- Do NOT include a trailing slash in the URL
- The URL must be accessible from the browser (not just server-side)
- Example: `https://ticket-backend.railway.app` ✅
- Wrong: `https://ticket-backend.railway.app/` ❌

### 2. Backend CORS Configuration

Ensure your backend has CORS configured to allow requests from your frontend domain:

```typescript
// In your NestJS backend main.ts
app.enableCors({
  origin: [
    'http://localhost:3000',           // Local development
    'https://your-frontend-domain.com' // Production
  ],
  credentials: true,
});
```

### 3. Common Production Issues

#### Issue: "Cannot GET /api/..."

**Causes:**
1. `NEXT_PUBLIC_API_URL` not set in production environment
2. Backend URL has a trailing slash
3. Backend is not running or not accessible
4. CORS not configured properly

**Solutions:**
1. Check environment variables in your hosting platform dashboard
2. Remove trailing slash from `NEXT_PUBLIC_API_URL`
3. Verify backend is running: `curl https://your-backend-url.com/health`
4. Check browser console for CORS errors

#### Issue: "property X should not exist" validation errors

**Causes:**
- Frontend sending fields that backend DTO doesn't accept
- Backend validation schema mismatch

**Solutions:**
- This has been fixed in the latest code
- Backend DTOs don't accept: `type`, `status`, `acceptanceCriteria`, `priorityScore` in create/update
- These fields are set by the backend automatically

#### Issue: "Failed to load dashboard data"

**Causes:**
1. Authentication token not being sent
2. Backend session expired
3. API URL misconfigured

**Solutions:**
1. Clear browser localStorage and login again
2. Check Network tab in browser DevTools for actual API calls
3. Verify `NEXT_PUBLIC_API_URL` is correct

### 4. Deployment Checklist

Before deploying to production:

- [ ] Set `NEXT_PUBLIC_API_URL` environment variable
- [ ] Remove trailing slash from API URL
- [ ] Configure backend CORS with frontend domain
- [ ] Test backend health endpoint
- [ ] Clear browser cache and localStorage
- [ ] Test login flow
- [ ] Test creating a ticket
- [ ] Check browser console for errors

### 5. Platform-Specific Instructions

#### Vercel

1. Go to Project Settings → Environment Variables
2. Add `NEXT_PUBLIC_API_URL` with your backend URL
3. Redeploy the application

#### Netlify

1. Go to Site Settings → Environment Variables
2. Add `NEXT_PUBLIC_API_URL` with your backend URL
3. Trigger a new deploy

#### Railway

1. Go to Variables tab
2. Add `NEXT_PUBLIC_API_URL` with your backend URL
3. Redeploy

### 6. Debugging Production Issues

Enable detailed logging in browser console:

```javascript
// In browser console
localStorage.setItem('debug', 'axios');
```

Check the actual API calls being made:
1. Open Browser DevTools (F12)
2. Go to Network tab
3. Filter by "Fetch/XHR"
4. Look for failed requests
5. Check the request URL and response

### 7. Backend Health Check

Test if your backend is accessible:

```bash
# Check if backend is running
curl https://your-backend-url.com/health

# Check if auth endpoint works
curl https://your-backend-url.com/auth/admin-exists
```

Expected response:
```json
{"exists": true}
```

If you get a 404 or connection error, your backend is not accessible.
