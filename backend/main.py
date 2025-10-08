from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, HTTPException
from backend import models, database
from backend.routes import team, battle, user
import httpx

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="MyPokemonCrew API")

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173"
]


POKEAPI_URL = "https://pokeapi.co/api/v2"

app.include_router(team.router, prefix="/api/team", tags=["Team"])
app.include_router(battle.router, prefix="/api/battle", tags=["Battle"])
app.include_router(user.router, prefix="/api/users", tags=["Users"])

# Allow frontend to access backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Frontend's origin
    allow_credentials=True,
    allow_methods=["*"],  # GET, POST, etc.
    allow_headers=["*"],
)

@app.get("/api/pokemon/")
async def list_pokemons(limit: int = 20, offset: int = 0):
    """List Pokémon with pagination."""
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{POKEAPI_URL}/pokemon?limit={limit}&offset={offset}")
        data = response.json()

        results = []
        for p in data["results"]:
            poke_id = p["url"].split("/")[-2]
            results.append({
                "id": poke_id,
                "name": p["name"].capitalize(),
                "image": f"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/{poke_id}.png"
            })

        return {"count": data["count"], "results": results}

@app.get("/api/pokemon/{name}")
async def pokemon_detail(name: str):
    """Details of a specific Pokémon by name."""
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{POKEAPI_URL}/pokemon/{name.lower()}")
        if response.status_code != 200:
            raise HTTPException(status_code=404, detail="Pokemon not found")
        data = response.json()

        pokemon = {
            "id": data["id"],
            "name": data["name"].capitalize(),
            "height": data["height"],
            "weight": data["weight"],
            "types": [t["type"]["name"] for t in data["types"]],
            "stats": {s["stat"]["name"]: s["base_stat"] for s in data["stats"]},
            "image": data["sprites"]["other"]["official-artwork"]["front_default"]
        }

        return pokemon