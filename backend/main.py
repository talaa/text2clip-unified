import os
import shutil
import uuid
import threading
import time
import logging
import io
import json
from contextlib import asynccontextmanager

from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from dotenv import load_dotenv
import psutil

# Need to make sure these exist and are compatible
from text2speech import text2speech
from scenecreator import createscenes as create_scenes
from generateimage import generate_image
from createvideo import create_video

load_dotenv()
BASE_TEMP_DIR = "temp"
os.makedirs(BASE_TEMP_DIR, exist_ok=True)

logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s %(levelname)s:%(name)s: %(message)s',
    handlers=[logging.FileHandler("app.log"), logging.StreamHandler()]
)
logger = logging.getLogger(__name__)

def safe_rmtree(path, retries=3, delay=0.5):
    for attempt in range(retries):
        try:
            shutil.rmtree(path)
            logger.debug(f"Successfully deleted {path}")
            return True
        except PermissionError as e:
            logger.warning(f"Attempt {attempt + 1}/{retries} failed: {e}")
            for root, dirs, files in os.walk(path, topdown=False):
                for file in files:
                    file_path = os.path.join(root, file)
                    try:
                        os.remove(file_path)
                    except PermissionError as pe:
                        logger.error(f"File locked: {file_path} - {pe}")
            if attempt < retries - 1:
                time.sleep(delay)
            else:
                logger.error(f"Could not delete {path} after {retries} attempts")
                return False
    return True

def cleanup_old_temp_dirs(max_age_hours=24):
    now = time.time()
    deleted = 0
    for folder in os.listdir(BASE_TEMP_DIR):
        path = os.path.join(BASE_TEMP_DIR, folder)
        if os.path.isdir(path):
            creation_time = os.path.getctime(path)
            age_hours = (now - creation_time) / 3600
            if age_hours > max_age_hours:
                logger.debug(f"Cleaning up old directory: {path}")
                if safe_rmtree(path):
                    deleted += 1
    return deleted

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    cleanup_old_temp_dirs()
    yield
    # Shutdown
    pass

app = FastAPI(title="Video Generation API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class GenerateRequest(BaseModel):
    topic: str
    num_scenes: int

def update_status(task_dir, status, output_file=None):
    status_file = os.path.join(task_dir, "status.json")
    data = {"status": status}
    if output_file:
        data["output_file"] = output_file
    with open(status_file, 'w') as f:
        json.dump(data, f)

def generate_video_async(task_id: str, topic: str, num_scenes: int):
    task_dir = os.path.join(BASE_TEMP_DIR, task_id)
    audio_dir = os.path.join(task_dir, "Audio")
    images_dir = os.path.join(task_dir, "images")
    os.makedirs(audio_dir, exist_ok=True)
    os.makedirs(images_dir, exist_ok=True)
    logger.debug(f"Task {task_id} started in {task_dir}")
    logger.debug(f"Initial memory usage: {get_memory_usage()}")

    try:
        update_status(task_dir, "Generating scenes")
        scenes = create_scenes(topic, num_scenes)
        logger.debug(f"Memory usage after scene generation: {get_memory_usage()}")

        try:
            scenes_data = json.loads(scenes)
        except json.JSONDecodeError as e:
            update_status(task_dir, f"Error: JSON parsing failed - {str(e)}")
            return

        scenes_array = scenes_data.get("scenes", [])
        if not scenes_array:
            update_status(task_dir, "Error: No scenes generated")
            return

        update_status(task_dir, "Processing scenes")
        for index, scene in enumerate(scenes_array):
            image_prompt = scene.get("image_prompt", "")
            text = scene.get("text", "")
            scene_id = f"scene{index}"
            generate_image(image_prompt, scene_id, output_dir=images_dir)
            logger.debug(f"Memory usage after generating image {scene_id}: {get_memory_usage()}")
            text2speech(text, scene_id, output_dir=audio_dir)
            logger.debug(f"Memory usage after generating audio {scene_id}: {get_memory_usage()}")

        update_status(task_dir, "Creating video")
        output_file = os.path.join(task_dir, "output_movie.mp4")
        create_video(audio_dir=audio_dir, images_dir=images_dir, output_file=output_file, scenes_array=scenes_array)
        logger.debug(f"Memory usage after video creation: {get_memory_usage()}")

        if not os.path.exists(output_file):
            update_status(task_dir, "Error: Video creation failed")
            return

        update_status(task_dir, "Done", output_file=output_file)

    except Exception as e:
        update_status(task_dir, f"Error: {str(e)}")
        logger.error(f"Task {task_id} failed: {e}")

def get_memory_usage():
    """Returns the memory usage of the current process in MB."""
    process = psutil.Process()
    memory_info = process.memory_info()
    return {
        "rss": memory_info.rss / (1024 * 1024),  # Resident Set Size in MB
        "vms": memory_info.vms / (1024 * 1024),  # Virtual Memory Size in MB
        "percent": psutil.virtual_memory().percent  # System-wide memory usage percentage
    }

# API Routes
@app.post("/api/generate_clip", status_code=202)
def start_generate_video(req: GenerateRequest, background_tasks: BackgroundTasks):
    if not req.topic or req.num_scenes <= 0:
        raise HTTPException(status_code=400, detail="Invalid topic or num_scenes")
    if req.num_scenes > 6:
        raise HTTPException(status_code=400, detail="num_scenes cannot exceed 6")

    task_id = str(uuid.uuid4())
    os.makedirs(os.path.join(BASE_TEMP_DIR, task_id), exist_ok=True)
    update_status(os.path.join(BASE_TEMP_DIR, task_id), "Queued")
    background_tasks.add_task(generate_video_async, task_id, req.topic, req.num_scenes)
    return {"task_id": task_id}

@app.get("/api/progress/{task_id}")
def get_progress(task_id: str):
    task_dir = os.path.join(BASE_TEMP_DIR, task_id)
    status_file = os.path.join(task_dir, "status.json")
    if not os.path.exists(status_file):
        return JSONResponse(status_code=404, content={"state": "PENDING", "status": "Task not found or queued"})
    
    with open(status_file, 'r') as f:
        status_data = json.load(f)
    
    state = "PROGRESS"
    if status_data["status"].startswith("Error"):
        state = "FAILURE"
    elif status_data["status"] == "Done":
        state = "SUCCESS"
    
    response = {"state": state, "status": status_data["status"]}
    if state == "SUCCESS":
        response["download_url"] = f"/api/download/{task_id}"
    return response

@app.get("/api/download/{task_id}")
def download_video(task_id: str):
    task_dir = os.path.join(BASE_TEMP_DIR, task_id)
    status_file = os.path.join(task_dir, "status.json")
    if not os.path.exists(status_file):
        raise HTTPException(status_code=404, detail="Task not found")
    
    with open(status_file, 'r') as f:
        status_data = json.load(f)
    
    if status_data["status"] != "Done":
        raise HTTPException(status_code=400, detail="Task not completed or failed")
    
    output_file = status_data["output_file"]
    if not os.path.exists(output_file):
        raise HTTPException(status_code=500, detail="Video file not found")

    return FileResponse(
        path=output_file,
        media_type="video/mp4",
        filename="output_movie.mp4"
    )

@app.post("/api/cleanup")
def manual_cleanup():
    deleted = cleanup_old_temp_dirs()
    return {"message": f"Cleaned up {deleted} old temporary directories"}

@app.get("/api/health")
def health_check():
    return {"status": "healthy"}

@app.get("/api/memory")
def memory_usage():
    memory = get_memory_usage()
    return {
        "rss_mb": memory["rss"],
        "vms_mb": memory["vms"],
        "system_memory_percent": memory["percent"]
    }

@app.delete("/api/delete_temp/{directory_name}")
def delete_temp_directory(directory_name: str):
    task_dir = os.path.join(BASE_TEMP_DIR, directory_name)
    if not os.path.exists(task_dir):
        raise HTTPException(status_code=404, detail="Directory not found")
    if not os.path.isdir(task_dir):
        raise HTTPException(status_code=400, detail="Specified path is not a directory")

    if safe_rmtree(task_dir):
        return {"message": f"Successfully deleted {directory_name}"}
    else:
        raise HTTPException(status_code=500, detail=f"Failed to delete {directory_name}")


# Serve React app
frontend_dist = os.path.join(os.path.dirname(__file__), "..", "frontend", "build")
if os.path.exists(frontend_dist):
    app.mount("/static", StaticFiles(directory=os.path.join(frontend_dist, "static")), name="static")

    @app.get("/{full_path:path}")
    def serve_frontend(full_path: str):
        # Serve specific files if they exist
        file_path = os.path.join(frontend_dist, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        # Fallback to index.html for React Router
        index_path = os.path.join(frontend_dist, "index.html")
        if os.path.exists(index_path):
            return FileResponse(index_path)
        return JSONResponse(status_code=404, content={"detail": "Frontend not built or found"})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
