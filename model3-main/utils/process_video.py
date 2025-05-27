from utils.video_utils import (
    detect_scenes_with_fallback, extract_keyframes, detect_objects,
    process_summaries, generate_case_report
)
from config import (
    KEYFRAMES_DIR, DETECTIONS_DIR, ANNOTATED_DIR, SUMMARIES_DIR,
    CLIPS_DIR
)
from config import FINAL_REPORT_PATH as REPORT_FILE

import os

def run_full_pipeline(video_path):
    scenes = detect_scenes_with_fallback(video_path)
    extract_keyframes(video_path, scenes)

    for img_file in sorted(os.listdir(KEYFRAMES_DIR)):
        if img_file.endswith(".jpg"):
            detect_objects(os.path.join(KEYFRAMES_DIR, img_file))

    process_summaries()
    generate_case_report()

    return {"scenes": len(scenes), "report": REPORT_FILE}
