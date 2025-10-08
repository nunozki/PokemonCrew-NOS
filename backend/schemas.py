from pydantic import BaseModel
from typing import List, Optional

class TeamCreate(BaseModel):
    name: str
    
class UserBase(BaseModel):
    username: str
    email: Optional[str] = None

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    model_config = {"from_attributes": True}
    
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    name: str
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

class BattleLogBase(BaseModel):
    pokemon1_name: str
    pokemon2_name: str
    winner_name: str

class BattleLogCreate(BattleLogBase):
    pass

class BattleLog(BattleLogBase):
    id: int
    timestamp: str
    model_config = {"from_attributes": True}
