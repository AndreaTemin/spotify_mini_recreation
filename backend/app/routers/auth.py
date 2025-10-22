from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta

from app import crud, schemas, auth, models
from app.database import get_db

router = APIRouter()

@router.post("/register", response_model=schemas.User, status_code=status.HTTP_201_CREATED)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """
    Create a new user.
    """
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    
    # 1. ADD THE HASHING LOGIC HERE
    hashed_password = auth.get_password_hash(user.password)
    
    # 2. PASS THE HASHED PASSWORD TO THE NEW FUNCTION
    return crud.create_user(db=db, user=user, hashed_password=hashed_password)


@router.post("/token", response_model=schemas.Token)
def login_for_access_token(
    db: Session = Depends(get_db), 
    form_data: OAuth2PasswordRequestForm = Depends()
):
    """
    Log in a user and return a JWT access token.
    Uses OAuth2PasswordRequestForm to accept "username" (which is our email)
    and "password" from a form body.
    """
    user = crud.get_user_by_email(db, email=form_data.username)
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = auth.create_access_token(
        data={"sub": user.email}
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/users/me", response_model=schemas.User)
def read_users_me(current_user: models.User = Depends(auth.get_current_user)):
    """
    Get the details for the currently logged-in user.
    This endpoint is protected by the auth.get_current_user dependency.
    """
    return current_user