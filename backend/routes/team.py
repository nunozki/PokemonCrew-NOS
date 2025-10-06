from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend import models, schemas, database

router = APIRouter()

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/", response_model=schemas.Team)
def get_team(db: Session = Depends(get_db)):
    team = db.query(models.Team).first()
    if not team:
        team = models.Team()
        db.add(team)
        db.commit()
        db.refresh(team)
    return team

@router.post("/add", response_model=schemas.Team)
def add_pokemon(pokemon: schemas.PokemonCreate, db: Session = Depends(get_db)):
    team = db.query(models.Team).first()
    if not team:
        team = models.Team()
        db.add(team)
        db.commit()
        db.refresh(team)

    if len(team.pokemons) >= 6:
        raise HTTPException(status_code=400, detail="This team already has 6 Pokemons.")

    existing = db.query(models.Pokemon).filter_by(name=pokemon.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="This Pokemon already has a team.")

    new_pokemon = models.Pokemon(name=pokemon.name, image=pokemon.image, team_id=team.id)
    db.add(new_pokemon)
    db.commit()
    db.refresh(team)
    return team

@router.delete("/remove/{name}", response_model=schemas.Team)
def remove_pokemon(name: str, db: Session = Depends(get_db)):
    team = db.query(models.Team).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found.")

    pokemon = db.query(models.Pokemon).filter_by(name=name).first()
    if pokemon:
        db.delete(pokemon)
        db.commit()
    db.refresh(team)
    return team
