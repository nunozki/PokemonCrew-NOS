# PokemonCrew-NOS

python -m venv venv
venv\Scripts\activate
uvicorn main:app --reload --port 9000

cd frontend
npx tailwindcss init -p
npm run dev