from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from models import database, user
from utils import auth

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=user.UserResponse)
def register(user_data: user.UserCreate, db: Session = Depends(database.get_db)):
    db_user = db.query(user.User).filter(user.User.email == user_data.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = auth.get_password_hash(user_data.password)
    new_user = user.User(email=user_data.email, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login", response_model=user.Token)
def login(user_data: user.UserCreate, db: Session = Depends(database.get_db)):
    db_user = db.query(user.User).filter(user.User.email == user_data.email).first()
    if not db_user or not auth.verify_password(user_data.password, db_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = auth.timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": db_user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}
