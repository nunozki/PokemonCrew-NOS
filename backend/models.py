from sqlalchemy import Column, Integer, String, ForeignKey, Table, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from backend.database import Base

team_pokemon_association = Table('team_pokemon_association', Base.metadata,
    Column('team_id', Integer, ForeignKey('teams.id')),
    Column('pokemon_id', Integer, ForeignKey('pokemons.id'))
)

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True, nullable=True)
    teams = relationship("Team", back_populates="user")

class Team(Base):
    __tablename__ = "teams"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    pokemons = relationship("Pokemon", secondary=team_pokemon_association, back_populates="teams")
    user = relationship("User", back_populates="teams")

class Pokemon(Base):
    __tablename__ = "pokemons"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    image = Column(String)
    teams = relationship("Team", secondary=team_pokemon_association, back_populates="pokemons")

class BattleLog(Base):
    __tablename__ = "battle_logs"
    id = Column(Integer, primary_key=True, index=True)
    pokemon1_name = Column(String)
    pokemon2_name = Column(String)
    winner_name = Column(String)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
