from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.orm import defer
from backend import models, schemas, database, auth

router = APIRouter()

@router.get("/", response_model=schemas.Team)
def get_team(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    # The user_id column might not exist if the database is old.
    # We defer loading it to avoid an error, as it's not used here anyway.
    team = db.query(models.Team).filter(models.Team.user_id == current_user.id).first()
    if not team:
        # For simplicity, we'll use a single user and team.
        # In a real app, you'd get the current user.
        team = models.Team(name=f"{current_user.username}'s Team", user_id=current_user.id)
        db.add(team)
        db.commit()
        db.refresh(team)
    return team

@router.get("/list", response_model=list[schemas.Team])
def list_teams(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    """List all teams."""
    return db.query(models.Team).filter(models.Team.user_id == current_user.id).all()

@router.post("/create", response_model=schemas.Team)
def create_team(team_data: schemas.TeamCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    """Create a new team."""
    new_team = models.Team(name=team_data.name, user_id=current_user.id)
    db.add(new_team)
    db.commit()
    db.refresh(new_team)
    return new_team

@router.put("/{team_id}", response_model=schemas.Team)
def update_team(team_id: int, team_data: schemas.TeamCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    """Update a team's name."""
    team = db.query(models.Team).filter(models.Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found.")
    team.name = team_data.name
    db.commit()
    db.refresh(team)
    return team

@router.delete("/{team_id}", status_code=204)
def delete_team(team_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    """Delete a team."""
    team = db.query(models.Team).filter(models.Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found.")
    
    if team.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this team")
    
    team.pokemons.clear()
    db.delete(team)
    db.commit()

@router.post("/{team_id}/add", response_model=schemas.Team)
def add_pokemon(team_id: int, pokemon: schemas.PokemonCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    team = db.query(models.Team).filter(models.Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found.")
    if len(team.pokemons) >= 6:
        raise HTTPException(status_code=400, detail="This team already has 6 Pokemons.")

    # Check if this specific pokemon is already in this specific team
    for p in team.pokemons:
        if p.name == pokemon.name:
            raise HTTPException(status_code=400, detail="This Pokemon is already in this team.")

    # Find pokemon or create it if it doesn't exist in the pokemons table
    db_pokemon = db.query(models.Pokemon).filter_by(name=pokemon.name).first()
    if not db_pokemon:
        db_pokemon = models.Pokemon(name=pokemon.name, image=pokemon.image)
        db.add(db_pokemon)
        db.commit()
        db.refresh(db_pokemon)

    team.pokemons.append(db_pokemon)
    db.commit()
    db.refresh(team)
    return team

@router.delete("/{team_id}/remove/{name}", response_model=schemas.Team)
def remove_pokemon(team_id: int, name: str, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    team = db.query(models.Team).filter(models.Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found.")

    pokemon_to_remove = None
    for p in team.pokemons:
        if p.name == name:
            pokemon_to_remove = p
            break
    
    if pokemon_to_remove:
        team.pokemons.remove(pokemon_to_remove)
        db.commit()
        db.refresh(team)
        return team

    raise HTTPException(status_code=404, detail="Pokemon not found in this team.")
