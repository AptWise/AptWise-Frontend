# LinkedIn OAuth Setup Guide for AptWise Frontend

## Overview
This guide will help you set up LinkedIn OAuth authentication in your AptWise application. The integration allows users to sign up and log in using their LinkedIn accounts.

## Prerequisites

1. **LinkedIn Developer Account**: You need a LinkedIn Developer account to create an OAuth app
2. **Backend Running**: The AptWise backend should be running on `http://localhost:8000`
3. **Frontend Running**: The frontend should be running on `http://localhost:5174` (or your available port)

## Step 1: Create LinkedIn OAuth App

1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/)
2. Sign in with your LinkedIn account
3. Click "Create App"
4. Fill in the required information:
   - **App name**: AptWise (or your preferred name)
   - **LinkedIn Page**: Create a LinkedIn page for your app or use your personal page
   - **Privacy policy URL**: Add your privacy policy URL (can be temporary for development)
   - **App logo**: Upload your app logo

5. Once created, go to the "Auth" tab
6. Add the following redirect URLs under "Authorized redirect URLs for your app":
   ```
   http://localhost:5174/auth/linkedin/callback
   ```
7. Under "OAuth 2.0 scopes", request access to:
   - `openid` (to access basic OpenID Connect information)
   - `profile` (to access profile information)
   - `email` (to access email address)

   **Note**: The old scopes `r_liteprofile` and `r_emailaddress` have been deprecated by LinkedIn.

## Step 2: Configure Backend Environment Variables

1. In your backend directory (`AptWise-Backend`), create or update the `.env` file:

```env
# LinkedIn OAuth Configuration
LINKEDIN_CLIENT_ID=your_linkedin_client_id_here
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret_here
LINKEDIN_REDIRECT_URI=http://localhost:5173/auth/linkedin/callback

# Database and other configs...
```

2. Replace `your_linkedin_client_id_here` and `your_linkedin_client_secret_here` with the actual values from your LinkedIn OAuth app.

## Step 3: Update LinkedIn OAuth Redirect URI

The backend configuration has been updated to use the frontend callback URL:
- **Frontend Callback**: `http://localhost:5173/auth/linkedin/callback`
- **Backend API Endpoint**: `http://localhost:8000/auth/linkedin/callback`

## Step 4: Start the Applications

1. **Start the Backend**:
   ```bash
   cd AptWise-Backend
   # Activate your virtual environment
   # Then start the server
   uvicorn src.aptwise.main:app --reload --host 0.0.0.0 --port 8000
   ```

2. **Start the Frontend**:
   ```bash
   cd AptWise-Frontend
   npm run dev
   ```

## Step 5: Test LinkedIn OAuth

### Testing Registration with LinkedIn

1. Go to `http://localhost:5173/Registration`
2. In Step 1, click the "LinkedIn" button
3. You should be redirected to LinkedIn's authorization page
4. After granting permission, you should be redirected back and logged in
5. Check that you're redirected to the dashboard

### Testing Login with LinkedIn

1. Go to `http://localhost:5173/login`
2. Click the "LinkedIn" button
3. You should be redirected to LinkedIn's authorization page
4. After authorization, you should be logged in and redirected to the dashboard

### Testing LinkedIn Connection (Step 2 of Registration)

1. Create a regular account first (without LinkedIn)
2. In Step 2 of registration, click the LinkedIn connection button
3. This should connect your LinkedIn account to your existing account

## Step 6: Debugging

### Backend Debug Endpoint

The backend includes a debug endpoint to check LinkedIn configuration:

```bash
curl http://localhost:8000/auth/debug/linkedin
```

This will return information about whether your LinkedIn OAuth is properly configured.

### Frontend Console Logs

Check the browser console for any error messages during the OAuth flow. The services log authentication results and errors.

### Common Issues

1. **"Invalid redirect_uri"**: Make sure the redirect URI in your LinkedIn app matches exactly: `http://localhost:5173/auth/linkedin/callback`

2. **"unauthorized_client"**: Check that your LinkedIn Client ID and Secret are correct in the backend `.env` file

3. **Popup blocked**: Some browsers block popups. Make sure to allow popups for your development site

4. **CORS errors**: Make sure your backend is running and accessible from the frontend

## Step 7: Production Deployment

When deploying to production:

1. Update the LinkedIn app redirect URLs to include your production domain
2. Update the environment variables with production URLs
3. Ensure HTTPS is used for production (LinkedIn requires HTTPS for OAuth)

## File Structure

The LinkedIn OAuth integration includes these new files:

```
src/
├── services/
│   ├── api.js                 # API service for backend communication
│   └── linkedinService.js     # LinkedIn OAuth service
├── pages/
│   ├── LinkedInCallback.jsx   # OAuth callback handler
│   ├── Dashboard.jsx          # User dashboard
│   ├── Login.jsx             # Updated with LinkedIn login
│   └── Registration.jsx      # Updated with LinkedIn registration
└── .env                      # Environment variables
```

## Environment Variables Reference

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:8000
VITE_LINKEDIN_ENABLED=true
```

### Backend (.env)
```env
LINKEDIN_CLIENT_ID=your_client_id
LINKEDIN_CLIENT_SECRET=your_client_secret
LINKEDIN_REDIRECT_URI=http://localhost:5173/auth/linkedin/callback
```

## API Endpoints

The integration uses these backend endpoints:

- `GET /auth/linkedin/authorize` - Get LinkedIn authorization URL
- `POST /auth/linkedin/callback` - Handle LinkedIn OAuth callback
- `POST /auth/linkedin/connect` - Connect LinkedIn to existing account
- `DELETE /auth/linkedin/disconnect` - Disconnect LinkedIn from account
- `GET /auth/debug/linkedin` - Debug LinkedIn configuration (development only)

## Security Notes

1. Always use HTTPS in production
2. Keep your LinkedIn Client Secret secure
3. Validate state parameters to prevent CSRF attacks (already implemented)
4. Consider implementing rate limiting for OAuth endpoints

You should now have a fully functional LinkedIn OAuth integration! Test each flow to ensure everything works correctly.
