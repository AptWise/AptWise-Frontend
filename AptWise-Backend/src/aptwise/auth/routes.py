"""
Authentication routes for user registration, login, and logout.
"""
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, Response, status, Request
from fastapi.responses import RedirectResponse
from .models import UserCreate, UserLogin, UserResponse, LinkedInUserProfile, LinkedInAuthRequest
from .utils import (create_access_token, set_access_cookies,
                    unset_jwt_cookies, get_current_user, hash_password)
from ..database import (get_user_by_email, create_user, delete_user, 
                        get_user_by_linkedin_id, create_user_with_linkedin,
                        update_user_linkedin_connection, disconnect_user_linkedin)
from .linkedin_service import linkedin_oauth_service

router = APIRouter(prefix="/auth", tags=["authentication"])


@router.post("/create-account", response_model=UserResponse)
async def create_account(user_data: UserCreate, response: Response):
    """Create a new user account."""    # Check if email already exists
    existing_user = get_user_by_email(user_data.email)
    if existing_user:
        raise HTTPException(status_code=400,
                            detail="Email already registered")

    # Hash the password
    hashed_password = hash_password(user_data.password)

    # Create new user record
    new_user = {
        "name": user_data.name,
        "email": user_data.email,
        "password": hashed_password,
        "linkedin_url": user_data.linkedin_url,
        "github_url": user_data.github_url
        }    # Add user to database
    success = create_user(new_user)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database service unavailable"
        )

    # Create access token with JWT
    access_token = create_access_token(data={"sub": user_data.email})
    set_access_cookies(response, access_token)    # Return user data (without password)
    return {
        "name": new_user["name"],
        "email": new_user["email"],
        "linkedin_url": new_user["linkedin_url"],
        "github_url": new_user["github_url"],
        "linkedin_id": None,
        "profile_picture_url": None,
        "is_linkedin_connected": False
    }


@router.post("/login")
async def login(user_data: UserLogin, response: Response):
    """Authenticate a user."""
    hashed_password = hash_password(user_data.password)
    # Try to find user in database
    user = get_user_by_email(user_data.email)

    if user and user["password"] == hashed_password:
        # Create access token with JWT
        access_token = create_access_token(data={"sub": user_data.email})
        # Set the JWT cookies
        set_access_cookies(response, access_token)
        return {"status": "success", "message": "Login successful"}

    raise HTTPException(status_code=401, detail="Invalid email or password")


@router.post("/logout")
async def logout(response: Response):
    """Log out a user by clearing the JWT cookie."""
    unset_jwt_cookies(response)
    return {"status": "success", "message": "Successfully logged out"}


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: Optional[str] =
                                Depends(get_current_user)):
    """Get current user information."""
    if current_user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"})    # Find user in database
    db_user = get_user_by_email(current_user)
    if db_user:
        return {
            "name": db_user["name"],
            "email": db_user["email"],
            "linkedin_url": db_user["linkedin_url"],
            "github_url": db_user["github_url"],
            "linkedin_id": db_user.get("linkedin_id"),
            "profile_picture_url": db_user.get("profile_picture_url"),
            "is_linkedin_connected": db_user.get("is_linkedin_connected", False)
        }

    raise HTTPException(status_code=404, detail="User not found")


@router.delete("/delete-account")
async def delete_account(response: Response, current_user: Optional[str] =
                         Depends(get_current_user)):
    """Delete a user account."""
    if current_user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"}
        )
    # Delete from database
    db_success = delete_user(current_user)

    if db_success:
        unset_jwt_cookies(response)  # Log the user out
        return {"status": "success", "message": "Account deleted successfully"}

    # If we couldn't delete the user,
    # it might not exist or there was a database error
    raise HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail="Could not delete user account"
    )


# Debug endpoint to check LinkedIn configuration
@router.get("/debug/linkedin")
async def debug_linkedin_config():
    """Debug LinkedIn OAuth configuration - REMOVE IN PRODUCTION."""
    from ..config.linkedin_config import LINKEDIN_CLIENT_ID, LINKEDIN_CLIENT_SECRET, LINKEDIN_REDIRECT_URI
    
    return {
        "client_id_configured": bool(LINKEDIN_CLIENT_ID),
        "client_secret_configured": bool(LINKEDIN_CLIENT_SECRET),
        "redirect_uri_configured": bool(LINKEDIN_REDIRECT_URI),
        "client_id_value": LINKEDIN_CLIENT_ID,  # Remove in production
        "redirect_uri_value": LINKEDIN_REDIRECT_URI,
        "service_configured": linkedin_oauth_service.configured if hasattr(linkedin_oauth_service, 'configured') else "Unknown"
    }


# LinkedIn OAuth routes
@router.get("/linkedin/authorize")
async def linkedin_authorize():
    """Generate LinkedIn OAuth authorization URL."""
    try:
        auth_data = linkedin_oauth_service.generate_authorization_url()
        return {
            "authorization_url": auth_data["authorization_url"],
            "state": auth_data["state"]
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate LinkedIn authorization URL: {str(e)}"
        )


@router.get("/linkedin/callback")
async def linkedin_redirect_callback(code: str = None, state: str = None, error: str = None, error_description: str = None):    """Handle LinkedIn OAuth redirect and forward to frontend callback."""
    frontend_callback_url = "http://localhost:5174/auth/linkedin/callback"
    
    if error:
        # Redirect to frontend with error
        redirect_url = f"{frontend_callback_url}?error={error}&error_description={error_description or ''}"
    elif code and state:
        # Redirect to frontend with auth code
        redirect_url = f"{frontend_callback_url}?code={code}&state={state}"
    else:
        # Redirect to frontend with generic error
        redirect_url = f"{frontend_callback_url}?error=invalid_request&error_description=Missing required parameters"
    
    return RedirectResponse(url=redirect_url)


@router.post("/linkedin/callback")
async def linkedin_callback(auth_request: LinkedInAuthRequest, response: Response):
    """Handle LinkedIn OAuth callback and create/login user."""
    try:
        # Exchange code for access token
        token_data = await linkedin_oauth_service.exchange_code_for_token(auth_request.code)
        access_token = token_data["access_token"]
        
        # Get user profile from LinkedIn
        linkedin_profile = await linkedin_oauth_service.get_user_info(access_token)
        
        if not linkedin_profile.get("email"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Unable to retrieve email from LinkedIn profile"
            )
        
        # Check if user exists by email
        existing_user = get_user_by_email(linkedin_profile["email"])
        
        if existing_user:
            # Update existing user with LinkedIn connection
            linkedin_data = {
                "linkedin_id": linkedin_profile["linkedin_id"],
                "linkedin_access_token": access_token,
                "profile_picture_url": linkedin_profile.get("profile_picture_url")
            }
            
            success = update_user_linkedin_connection(linkedin_profile["email"], linkedin_data)
            if not success:
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail="Failed to update LinkedIn connection"
                )
        else:
            # Check if LinkedIn ID is already connected to another account
            linkedin_user = get_user_by_linkedin_id(linkedin_profile["linkedin_id"])
            if linkedin_user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="This LinkedIn account is already connected to another user"
                )
            
            # Create new user with LinkedIn data
            new_user_data = {
                "name": linkedin_profile["full_name"],
                "email": linkedin_profile["email"],
                "linkedin_id": linkedin_profile["linkedin_id"],
                "linkedin_access_token": access_token,
                "profile_picture_url": linkedin_profile.get("profile_picture_url")
            }
            
            success = create_user_with_linkedin(new_user_data)
            if not success:
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail="Failed to create user account"
                )
        
        # Create JWT token for the user
        jwt_token = create_access_token(data={"sub": linkedin_profile["email"]})
        set_access_cookies(response, jwt_token)
        
        return {
            "status": "success",
            "message": "LinkedIn authentication successful",
            "user": {
                "name": linkedin_profile["full_name"],
                "email": linkedin_profile["email"],
                "linkedin_id": linkedin_profile["linkedin_id"],
                "profile_picture_url": linkedin_profile.get("profile_picture_url"),
                "is_linkedin_connected": True
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"LinkedIn authentication failed: {str(e)}"
        )


@router.post("/linkedin/connect")
async def connect_linkedin(auth_request: LinkedInAuthRequest, 
                          current_user: Optional[str] = Depends(get_current_user)):
    """Connect LinkedIn account to existing authenticated user."""
    if current_user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    try:
        # Exchange code for access token
        token_data = await linkedin_oauth_service.exchange_code_for_token(auth_request.code)
        access_token = token_data["access_token"]
        
        # Get user profile from LinkedIn
        linkedin_profile = await linkedin_oauth_service.get_user_info(access_token)
        
        # Check if LinkedIn ID is already connected to another account
        linkedin_user = get_user_by_linkedin_id(linkedin_profile["linkedin_id"])
        if linkedin_user and linkedin_user["email"] != current_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This LinkedIn account is already connected to another user"
            )
        
        # Update user with LinkedIn connection
        linkedin_data = {
            "linkedin_id": linkedin_profile["linkedin_id"],
            "linkedin_access_token": access_token,
            "profile_picture_url": linkedin_profile.get("profile_picture_url")
        }
        
        success = update_user_linkedin_connection(current_user, linkedin_data)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Failed to connect LinkedIn account"
            )
        
        return {
            "status": "success",
            "message": "LinkedIn account connected successfully",
            "linkedin_profile": {
                "linkedin_id": linkedin_profile["linkedin_id"],
                "profile_picture_url": linkedin_profile.get("profile_picture_url")
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to connect LinkedIn account: {str(e)}"
        )


@router.post("/linkedin/disconnect")
async def disconnect_linkedin(current_user: Optional[str] = Depends(get_current_user)):
    """Disconnect LinkedIn account from current user."""
    if current_user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    try:
        success = disconnect_user_linkedin(current_user)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Failed to disconnect LinkedIn account"
            )
        
        return {
            "status": "success",
            "message": "LinkedIn account disconnected successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to disconnect LinkedIn account: {str(e)}"
        )


@router.get("/linkedin/profile")
async def get_linkedin_profile(current_user: Optional[str] = Depends(get_current_user)):
    """Get LinkedIn profile information for the current user."""
    if current_user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    try:
        # Get user from database
        db_user = get_user_by_email(current_user)
        if not db_user or not db_user.get("is_linkedin_connected"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="LinkedIn account not connected"
            )
        
        # Check if we have a valid access token
        access_token = db_user.get("linkedin_access_token")
        if not access_token:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="LinkedIn access token not available"
            )
        
        # Fetch fresh profile data from LinkedIn
        linkedin_profile = await linkedin_oauth_service.get_user_info(access_token)
        
        return {
            "status": "success",
            "linkedin_profile": linkedin_profile,
            "cached_data": {
                "linkedin_id": db_user.get("linkedin_id"),
                "profile_picture_url": db_user.get("profile_picture_url"),
                "is_linkedin_connected": db_user.get("is_linkedin_connected")
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch LinkedIn profile: {str(e)}"
        )
