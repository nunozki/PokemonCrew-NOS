import random
import httpx
import json
from sqlalchemy import desc
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, database, auth, schemas

router = APIRouter()

POKEAPI_URL = "https://pokeapi.co/api/v2/pokemon/"

async def get_pokemon_stats(name: str):
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{POKEAPI_URL}{name.lower()}")
        if response.status_code != 200:
            raise HTTPException(status_code=404, detail=f"Pokemon '{name}' not found")
        data = response.json()
        # Add Pokémon ID to be used in the frontend
        stats = {s["stat"]["name"]: s["base_stat"] for s in data["stats"]}
        return {
            "name": name.capitalize(),
            "hp": stats.get("hp", 1),
            "attack": stats.get("attack", 1),
            "defense": stats.get("defense", 1),
            "speed": stats.get("speed", 1),
            "id": data["id"],
        }

@router.get("/", response_model=list[schemas.BattleLog])
async def get_battle_history(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Get the battle history for the current user."""
    return db.query(models.BattleLog).filter(models.BattleLog.user_id == current_user.id).order_by(desc(models.BattleLog.timestamp)).all()

@router.get("/{battle_id}", response_model=schemas.BattleLogDetails)
async def get_battle_details(
    battle_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    battle = db.query(models.BattleLog).filter(models.BattleLog.id == battle_id, models.BattleLog.user_id == current_user.id).first()
    if not battle:
        raise HTTPException(status_code=404, detail="Battle not found")
    return battle

@router.post("/", response_model=schemas.BattleResponse)
async def run_battle(
    pokemon_names: list[str],
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    if len(pokemon_names) != 2:
        raise HTTPException(status_code=400, detail="Exactly two pokemon names are required for a battle.")

    # Validate whether Pokémon belong to the user's teams
    user_pokemons = {p.name.lower() for team in current_user.teams for p in team.pokemons}
    pokemon1_name_lower = pokemon_names[0].lower()
    pokemon2_name_lower = pokemon_names[1].lower()

    if pokemon1_name_lower not in user_pokemons or pokemon2_name_lower not in user_pokemons:
        raise HTTPException(status_code=403, detail="One or more selected Pokémon are not in your teams.")


    p1_stats = await get_pokemon_stats(pokemon_names[0])
    p2_stats = await get_pokemon_stats(pokemon_names[1])
    initial_p1_stats = p1_stats.copy()
    initial_p2_stats = p2_stats.copy()

    # Determine turn order
    attacker, defender = (p1_stats, p2_stats) if p1_stats["speed"] >= p2_stats["speed"] else (p2_stats, p1_stats)

    battle_log = []
    battle_log.append(f"Battle starts between {p1_stats['name']} and {p2_stats['name']}!")
    battle_log.append(f"{attacker['name']} is faster and attacks first.")

    while p1_stats["hp"] > 0 and p2_stats["hp"] > 0:
        damage = max(1, round((attacker["attack"] / defender["defense"]) * 10 * (random.uniform(0.9, 1.1))))
        defender["hp"] -= damage
        battle_log.append(f"{attacker['name']} attacks {defender['name']} for {damage} damage.")
        battle_log.append(f"{defender['name']} has {max(0, defender['hp'])} HP remaining.")

        if defender["hp"] <= 0:
            winner_name = attacker["name"]
            battle_log.append(f"{defender['name']} fainted. {winner_name} wins!")
            break

        # Swap roles
        attacker, defender = defender, attacker

    db_log = models.BattleLog(
        pokemon1_name=pokemon_names[0].capitalize(),
        pokemon2_name=pokemon_names[1].capitalize(),
        winner_name=winner_name,
        log=json.dumps(battle_log),
        pokemon1_stats=json.dumps(initial_p1_stats),
        pokemon2_stats=json.dumps(initial_p2_stats),
        user_id=current_user.id
    )
    db.add(db_log)
    db.commit()
    db.refresh(db_log)

    return {"winner": winner_name, "log": battle_log, "p1_stats": p1_stats, "p2_stats": p2_stats, "id": db_log.id, "timestamp": db_log.timestamp}