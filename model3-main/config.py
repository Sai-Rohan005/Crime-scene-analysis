# config.py

import os
from dotenv import load_dotenv

load_dotenv()

# === Gemini Key ===
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# === Directory Paths ===
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
KEYFRAMES_DIR = os.path.join(BASE_DIR, "static", "keyframes")
DETECTIONS_DIR = os.path.join(BASE_DIR, "static", "hybrid_outputs")
SUMMARIES_DIR = os.path.join(BASE_DIR, "static", "scene_summaries")
CLIPS_DIR = os.path.join(BASE_DIR, "static", "high_priority_clips")
ANNOTATED_DIR = os.path.join(BASE_DIR, "static", "annotated_images")
FINAL_REPORT_PATH = os.path.join(BASE_DIR, "static", "case_report.md")

# === Video Input Path (can be overridden) ===
VIDEO_UPLOAD_FOLDER = "static/videos"
VIDEO_PATH = f"{VIDEO_UPLOAD_FOLDER}/input.mp4"

# === Crime Object Weights (optional for scoring) ===
CRIME_OBJECT_WEIGHTS = {
    "dead body": 3.0, "gun": 2.5, "knife": 2.5, "blood stain": 2.0,
    "pool of blood": 2.0, "bullet casing": 1.8, "shattered glass": 1.2,
    "money": 1.0, "safe": 1.0
}

# === OWL-ViT Object Prompts ===
OWL_PROMPTS = [
    "a person", "a dead body", "a knife", "a gun", "a bag", "a phone", "a wallet", "money",
    "a safe", "an evidence marker", "a chair", "a bullet", "a stack of money",
    "paper currency", "a broken object"
]

# === CLIP Semantic Labels ===
CLIP_SEMANTIC_PROMPTS = ["blood stain", "pool of blood", "shattered glass", "bullet casing"]

# === CLIP Crime Scene Classification Prompts ===
CRIME_PROMPTS = [
    "murder scene", "arson case", "theft", "robbery scene", "suicide",
    "accidental death", "drug-related crime", "vandalism", "kidnapping",
    "general crime scene", "nota"
]

# === Ensure all directories exist on start ===
for path in [KEYFRAMES_DIR, DETECTIONS_DIR, SUMMARIES_DIR, CLIPS_DIR, ANNOTATED_DIR]:
    os.makedirs(path, exist_ok=True)
