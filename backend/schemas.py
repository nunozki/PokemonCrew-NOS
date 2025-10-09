from pydantic import BaseModel, field_validator
from typing import List, Optional, Any
from datetime import datetime
import json


class TeamCreate(BaseModel):
    name: str
    
class UserBase(BaseModel):
    username: str
    email: Optional[str] = None

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    role: str
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
    log: list[str]

class BattleLogCreate(BattleLogBase):
    pass

class BattleLog(BattleLogBase):
    id: int
    timestamp: datetime
    model_config = {"from_attributes": True}

    @field_validator('log', mode='before')
    @classmethod
    def parse_log(cls, v: Any) -> Any:
        if isinstance(v, str):
            return json.loads(v)
        return v

class BattleLogDetails(BattleLog):
    pokemon1_stats: dict[str, Any]
    pokemon2_stats: dict[str, Any]

    @field_validator('pokemon1_stats', 'pokemon2_stats', mode='before')
    @classmethod
    def parse_stats(cls, v: Any) -> Any:
        if isinstance(v, str):
            try:
                return json.loads(v)
            except json.JSONDecodeError:
                # Handle case where it might not be a valid JSON string
                # Or if it's already a dict from a previous validation step
                return {}
        return v

class BattleResponse(BaseModel):
    id: int
    winner: str
    log: list[str]
    p1_stats: dict
    p2_stats: dict
    timestamp: datetime
