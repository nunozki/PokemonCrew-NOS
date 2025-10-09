from fastapi import APIRouter, Depends, HTTPException, status, Response
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from .. import models, schemas, database, auth

router = APIRouter()

@router.post("/register", response_model=schemas.User)
def register_user(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    hashed_password = auth.get_password_hash(user.password)
    db_user = models.User(username=user.username, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.post("/login")
def login_for_access_token(response: Response, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = auth.create_access_token(data={"sub": user.username})
    response.set_cookie(
        key="access_token",
        value=f"Bearer {access_token}",
        httponly=True,
        samesite="lax",
        secure=False # For production, must be set True (requires HTTPS)
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=schemas.User)
def read_users_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

@router.post("/promote/{username}", response_model=schemas.User, dependencies=[Depends(auth.require_admin_or_no_admins_exist)])
def promote_user_to_admin(username: str, db: Session = Depends(database.get_db)):
    user_to_promote = db.query(models.User).filter(models.User.username == username).first()
    if not user_to_promote:
        raise HTTPException(status_code=404, detail="User not found")
    user_to_promote.role = "admin"
    db.commit()
    db.refresh(user_to_promote)
    return user_to_promote

@router.post("/demote/{username}", response_model=schemas.User, dependencies=[Depends(auth.require_admin)])
def demote_user_from_admin(username: str, db: Session = Depends(database.get_db)):
    user_to_demote = db.query(models.User).filter(models.User.username == username).first()
    if not user_to_demote:
        raise HTTPException(status_code=404, detail="User not found")
    admin_count = db.query(models.User).filter(models.User.role == "admin").count()
    if user_to_demote.role == "admin" and admin_count == 1:
        raise HTTPException(status_code=403, detail="Cannot demote the last admin")
    user_to_demote.role = "normal"
    db.commit()
    db.refresh(user_to_demote)
    return user_to_demote