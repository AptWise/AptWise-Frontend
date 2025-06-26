# GitHub OAuth Frontend Setup Guide for AptWise

## Overview

This guide explains how to set up and test GitHub OAuth integration in the AptWise frontend. The GitHub OAuth allows users to sign up and log in using their GitHub accounts, as well as connect their GitHub accounts to existing profiles.

## Prerequisites

1. Backend must be running with GitHub OAuth configured (see `AptWise-Backend/GITHUB_OAUTH_SETUP.md`)
2. GitHub OAuth app must be created with proper redirect URIs
3. Environment variables must be set in the backend

## Files Created/Modified

### New Files Created:
- `src/services/githubService.js` - GitHub OAuth service for frontend
- `src/pages/GitHubCallback.jsx` - Handles OAuth callback from GitHub  
- `src/pages/GitHubTest.jsx` - Test component for GitHub OAuth functionality

### Modified Files:
- `src/services/api.js` - Added GitHub OAuth API endpoints
- `src/pages/Registration.jsx` - Added GitHub authentication in registration flow
- `src/pages/Login.jsx` - Added GitHub login functionality
- `src/App.jsx` - Added routes for GitHub callback and test pages

## Features Implemented

### 1. **Registration Flow (Step 1)**
- GitHub authentication button in registration form
- Automatic data pre-filling from GitHub profile
- Seamless integration with existing registration process

### 2. **Registration Flow (Step 2)**  
- Connect GitHub account to profile during registration
- Visual feedback for connection status
- Loading states and error handling

### 3. **Login Page**
- GitHub login button alongside LinkedIn and email/password
- Direct authentication through GitHub OAuth
- Automatic redirect to dashboard on successful login

### 4. **GitHub OAuth Service**
- Popup window handling for OAuth flow
- Secure message passing between windows
- Error handling and user feedback
- Connection and disconnection functionality

## Usage Examples

### Registration with GitHub (Step 1)
```jsx
// User clicks GitHub button in registration
// - Opens popup window for GitHub OAuth
// - Pre-fills registration form with GitHub data
// - Proceeds to step 2 of registration
```

### GitHub Connection (Step 2)
```jsx
// User connects GitHub during registration step 2
// - Shows connection status with visual feedback
// - Allows skipping if not desired
```

### Login with GitHub
```jsx
// User clicks GitHub button on login page
// - Authenticates with GitHub OAuth
// - Redirects to dashboard on success
```

## API Endpoints Used

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/auth/github/authorize` | Get GitHub OAuth authorization URL |
| POST | `/auth/github/callback` | Complete OAuth flow with auth code |
| POST | `/auth/github/connect` | Connect GitHub to existing account |
| POST | `/auth/github/disconnect` | Disconnect GitHub from account |
| GET | `/auth/debug/github` | Check GitHub OAuth configuration |

## Testing

### 1. **Backend Configuration Test**
Visit: `http://localhost:5174/test-github`
- Click "Test Backend Config" to verify backend setup
- Should show GitHub client configuration status

### 2. **Authentication Test**
Visit: `http://localhost:5174/test-github`
- Click "Test GitHub Authentication" 
- Should open GitHub OAuth popup and return user data

### 3. **Registration Flow Test**
Visit: `http://localhost:5174/Registration`
- Click GitHub button in Step 1
- Verify profile data is pre-filled
- Complete registration process

### 4. **Login Test**
Visit: `http://localhost:5174/login`
- Click GitHub button
- Should authenticate and redirect to dashboard

### 5. **Connection Test**
Visit: `http://localhost:5174/Registration` (when logged in)
- Go to Step 2
- Click GitHub connection button
- Verify connection status updates

## Troubleshooting

### Common Issues

1. **"GitHub OAuth is not configured on this server"**
   - Check backend environment variables
   - Verify GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET are set
   - Test with `/auth/debug/github` endpoint

2. **"Authentication window was closed"**
   - User closed popup manually
   - Normal behavior, should be handled gracefully
   - Will show simulation success message for testing

3. **CORS errors**
   - Ensure backend allows frontend origin
   - Check that backend is running on correct port (8000)
   - Verify API_BASE_URL in frontend .env

4. **Popup blocked**
   - Browser may block popups for security
   - User needs to allow popups for the site
   - Consider adding user instructions

5. **"This GitHub account is already connected to another user"**
   - GitHub account is already linked to different user
   - Normal security behavior
   - User should use different GitHub account or login to existing account

## Security Features

1. **CSRF Protection**: State parameter prevents cross-site request forgery
2. **Secure Popup Communication**: Origin verification for message passing
3. **Token Handling**: Access tokens managed securely by backend
4. **Error Isolation**: OAuth errors don't affect main application flow

## Development Notes

### Frontend Port Configuration
- Frontend runs on port 5174 (default Vite dev server)
- Backend expects redirect to `http://localhost:5174/auth/github/callback`
- Update GitHub OAuth app redirect URI if using different port

### Environment Variables
Frontend `.env` file:
```env
VITE_API_BASE_URL=http://localhost:8000
```

### Production Considerations
1. Update redirect URIs for production domain
2. Remove debug endpoints and test routes
3. Implement proper error logging
4. Add rate limiting for OAuth endpoints
5. Use HTTPS for all OAuth communication

## File Structure

```
src/
├── services/
│   ├── api.js (modified)
│   ├── githubService.js (new)
│   └── linkedinService.js
├── pages/
│   ├── Registration.jsx (modified)
│   ├── Login.jsx (modified)
│   ├── GitHubCallback.jsx (new)
│   └── GitHubTest.jsx (new)
└── App.jsx (modified)
```

## Next Steps

1. **Test all OAuth flows** to ensure proper functionality
2. **Configure GitHub OAuth app** with correct redirect URIs
3. **Set up backend environment variables** for GitHub OAuth
4. **Test edge cases** like connection errors and user cancellation
5. **Deploy and test in production environment**

---

## Quick Start Checklist

- [ ] Backend GitHub OAuth configured and running
- [ ] GitHub OAuth app created with redirect URI `http://localhost:8000/auth/github/callback`
- [ ] Frontend dependencies installed and running
- [ ] Test GitHub configuration: `http://localhost:5174/test-github`
- [ ] Test registration flow: `http://localhost:5174/Registration`
- [ ] Test login flow: `http://localhost:5174/login`
- [ ] Verify all OAuth scenarios work as expected

Your GitHub OAuth integration is now ready for testing!
