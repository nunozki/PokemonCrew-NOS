# PokemonCrew-NOS

!!!Known Bug!!! Incorrect stats during battles. Stats are displayed correctly during replay on logs.

## Prerequisites

- [Node.js 18.x+](https://nodejs.org/)
- [npm](https://www.npmjs.com/)
- [Python 3.9+](https://www.python.org/)

## Installation and Usage

# Backend
- cd backend
- python -m venv venv (!!! One time only !!!)
- #Windows
- venv\Scripts\activate
- #macOS / Linux
- source venv/bin/activate
- pip install -r requirements.txt (!!! One time only !!!)
- cd ..
- uvicorn backend.main:app --reload --port 9000 
- http://localhost:9000/docs


# Frontend
- cd frontend
- npm install (!!! One time only !!!)
- npm run dev
- http://localhost:5173/




