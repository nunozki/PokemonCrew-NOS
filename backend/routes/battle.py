from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend import models, schemas, database

router = APIRouter()

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=schemas.BattleLog)
def create_battle_log(battle_log: schemas.BattleLogCreate, db: Session = Depends(get_db)):
    """Create a new battle log entry."""
    db_battle_log = models.BattleLog(**battle_log.model_dump())
    db.add(db_battle_log)
    db.commit()
    db.refresh(db_battle_log)
    return db_battle_log

@router.get("/", response_model=list[schemas.BattleLog])
def get_battle_logs(db: Session = Depends(get_db)):
    """Get all battle log entries."""
    return db.query(models.BattleLog).order_by(models.BattleLog.timestamp.desc()).all()