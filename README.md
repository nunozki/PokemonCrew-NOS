# PokemonCrew-NOS

!!!Known Bug!!! Incorrect stats during battles. Stats are displayed correctly during replay on logs.

## Prerequisites

- [Node.js 18.x+](https://nodejs.org/)
- [npm](https://www.npmjs.com/)
- [Python 3.9+](https://www.python.org/)

## Installation and Usage

# Backend
cd backend
venv\Scripts\activate
pip install -r requirements.txt (!!! One time only !!!)
cd ..
uvicorn backend.main:app --reload --port 9000 
http://localhost:9000/docs


# Frontend
cd frontend
npm run dev
http://localhost:5173/




