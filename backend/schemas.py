from pydantic import BaseModel
from typing import List, Optional

class PokemonBase(BaseModel):
    name: str
    image: str

class PokemonCreate(PokemonBase):
    pass

class Pokemon(PokemonBase):
    id: int
    model_config = {
        "from_attributes": True  
    }

class TeamBase(BaseModel):
    name: Optional[str] = "My Team"

class Team(TeamBase):
    id: int
    pokemons: List[Pokemon] = []
    model_config = {
        "from_attributes": True  
    }
