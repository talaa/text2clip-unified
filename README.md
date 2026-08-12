# Text2Clip Unified

AI-powered text-to-video clip generator — unified frontend and backend monorepo. The application is served by a single FastAPI backend which also acts as the host for the built React frontend.

## Structure

text2clip-unified/
├── backend/     # Python/FastAPI backend — scene generation, TTS, video assembly, serving UI
├── frontend/    # React frontend — prompt UI and video preview
└── README.md

## Setup & Running Locally

### 1. Build the Frontend

First, you need to build the React application so the backend can serve its static files.

```bash
cd frontend
npm install
npm run build
cd ..
```

### 2. Setup the Backend

Ensure you have Python installed.

```bash
cd backend
python3 -m virtualenv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Environment variables

Create `backend/.env` with your API keys:
```
TOGETHER_API_KEY=your_together_api_key
OPENAI_API_KEY=your_openrouter_api_key
```
Note: OpenRouter is used for the LLM model to generate scenes.

### 4. Run the Application

Start the FastAPI server (from the `backend` directory):
```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

The application is now accessible at `http://localhost:8000/`. The FastAPI backend serves the React application directly!

## API Documentation

Since we use FastAPI, interactive API documentation is automatically generated and available at `http://localhost:8000/docs`.

## Deployment

You can deploy the single backend application (which serves the frontend) on platforms like Render, Heroku, or AWS. Be sure to configure the start command to `uvicorn main:app --host 0.0.0.0 --port $PORT` and ensure the frontend build process runs before startup.
