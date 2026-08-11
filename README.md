# Text2Clip Unified

AI-powered text-to-video clip generator — combined frontend and backend monorepo.

## Structure

```
text2clip-unified/
├── backend/     # Python/FastAPI backend — scene generation, TTS, video assembly
├── frontend/    # React frontend — prompt UI and video preview
└── .gitignore
```

## Backend

- **Tech**: Python, FastAPI
- **Main entry**: `backend/main.py`

### Setup

```bash
cd backend
pip install -r requirements.txt
python main.py
```

### Environment variables

Create `backend/.env` with your API keys (see backend source for required keys).

## Frontend

- **Tech**: React (Create React App)

### Setup

```bash
cd frontend
npm install
npm start
```

### Environment variables

Create `frontend/.env`:
```
REACT_APP_API_URL=http://localhost:8000
```

## Deployment

- **Backend**: Hosted on Render (`text2clip-be.onrender.com`)
- **Frontend**: Configure `REACT_APP_API_URL` to point to the backend URL.
