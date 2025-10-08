from sqlalchemy import Column, Integer, String, ForeignKey, Table
from sqlalchemy.orm import relationship
from backend.database import Base

team_pokemon_association = Table('team_pokemon_association', Base.metadata,
    Column('team_id', Integer, ForeignKey('teams.id')),
    Column('pokemon_id', Integer, ForeignKey('pokemons.id'))
)

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True)
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
