# ------------------------------
# File: utils/video_utils.py
# ------------------------------

import os
import cv2
import json
import numpy as np
from datetime import timedelta, datetime
from scenedetect import VideoManager, SceneManager
from scenedetect.detectors import ContentDetector
from PIL import Image
import torch
from ultralytics import YOLO
from transformers import OwlViTProcessor, OwlViTForObjectDetection, CLIPProcessor, CLIPModel
import google.generativeai as genai
from moviepy.video.io.VideoFileClip import VideoFileClip


from config import (
    GEMINI_API_KEY, VIDEO_PATH,
    KEYFRAMES_DIR, DETECTIONS_DIR, SUMMARIES_DIR, CLIPS_DIR,
    ANNOTATED_DIR, FINAL_REPORT_PATH, CRIME_OBJECT_WEIGHTS,
    OWL_PROMPTS, CLIP_SEMANTIC_PROMPTS, CRIME_PROMPTS
)

# Initialize Gemini
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel("models/gemini-1.5-flash-latest")

# Load models
yolo_model = YOLO("yolov8n.pt")
owl_model = OwlViTForObjectDetection.from_pretrained("google/owlvit-base-patch32")
owl_processor = OwlViTProcessor.from_pretrained("google/owlvit-base-patch32")
clip_model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
clip_processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")

def get_video_duration(video_path):
    cap = cv2.VideoCapture(video_path)
    duration = cap.get(cv2.CAP_PROP_FRAME_COUNT) / cap.get(cv2.CAP_PROP_FPS)
    cap.release()
    return duration

def detect_scenes_with_fallback(video_path, fallback_interval=5):
    video_manager = VideoManager([video_path])
    scene_manager = SceneManager()
    scene_manager.add_detector(ContentDetector(threshold=20.0))
    video_manager.set_downscale_factor()
    video_manager.start()
    scene_manager.detect_scenes(frame_source=video_manager)
    scene_list = scene_manager.get_scene_list()

    if not scene_list:
        print("[⚠️] No scenes detected — falling back to fixed intervals.")
        duration = get_video_duration(video_path)
        scene_list = [(i, min(i + fallback_interval, duration)) for i in range(0, int(duration), fallback_interval)]
    else:
        scene_list = [(scene[0].get_seconds(), scene[1].get_seconds()) for scene in scene_list]

    return scene_list

def extract_keyframes(video_path, scene_times, frames_per_scene=2):
    cap = cv2.VideoCapture(video_path)
    for i, (start, end) in enumerate(scene_times):
        interval = (end - start) / (frames_per_scene + 1)
        for j in range(1, frames_per_scene + 1):
            timestamp = start + j * interval
            cap.set(cv2.CAP_PROP_POS_MSEC, timestamp * 1000)
            ret, frame = cap.read()
            if ret:
                filename = f"{KEYFRAMES_DIR}/scene{i+1}_frame{j}.jpg"
                cv2.imwrite(filename, frame)
                meta = {
                    "start_time": str(timedelta(seconds=int(start))),
                    "end_time": str(timedelta(seconds=int(end)))
                }
                with open(filename.replace(".jpg", ".meta"), "w") as meta_f:
                    json.dump(meta, meta_f)
    cap.release()

def detect_objects(image_path):
    image_pil = Image.open(image_path).convert("RGB")
    image_tensor = torch.tensor(image_pil.size[::-1])
    result = {"image": image_path, "detections": []}
    meta_path = image_path.replace(".jpg", ".meta")
    if os.path.exists(meta_path):
        with open(meta_path) as m:
            meta = json.load(m)
            result.update({
                "start_time": meta.get("start_time"),
                "end_time": meta.get("end_time"),
                "start_sec": sum(x * int(t) for x, t in zip([3600, 60, 1], meta["start_time"].split(":"))),
                "end_sec": sum(x * int(t) for x, t in zip([3600, 60, 1], meta["end_time"].split(":")))
            })
    image_cv = cv2.cvtColor(np.array(image_pil), cv2.COLOR_RGB2BGR)
    yolo_results = yolo_model(image_path)[0]
    for box in yolo_results.boxes:
        cls_id = int(box.cls[0])
        label = yolo_model.names[cls_id].lower()
        conf = float(box.conf[0])
        result["detections"].append({"label": label, "source": "YOLOv8", "confidence": conf})
        xyxy = box.xyxy[0].cpu().numpy().astype(int)
        cv2.rectangle(image_cv, tuple(xyxy[:2]), tuple(xyxy[2:]), (0, 255, 0), 2)
    owl_inputs = owl_processor(text=OWL_PROMPTS, images=image_pil, return_tensors="pt")
    with torch.no_grad():
        owl_outputs = owl_model(**owl_inputs)
    owl_results = owl_processor.post_process_object_detection(
        outputs=owl_outputs, target_sizes=image_tensor.unsqueeze(0), threshold=0.25
    )[0]
    for box, score, label_id in zip(owl_results["boxes"], owl_results["scores"], owl_results["labels"]):
        label = OWL_PROMPTS[label_id].replace("a ", "")
        result["detections"].append({"label": label, "source": "OWL-ViT", "confidence": round(score.item(), 2)})
        x1, y1, x2, y2 = box.int().tolist()
        for i in range(x1, x2, 10):
            cv2.line(image_cv, (i, y1), (i + 5, y1), (0, 0, 255), 1)
        for j in range(y1, y2, 10):
            cv2.line(image_cv, (x1, j), (x1, j + 5), (0, 0, 255), 1)
    inputs = clip_processor(text=CLIP_SEMANTIC_PROMPTS, images=image_pil, return_tensors="pt", padding=True)
    with torch.no_grad():
        outputs = clip_model(**inputs)
    probs = outputs.logits_per_image.softmax(dim=1).squeeze()
    for i, score in enumerate(probs):
        if score.item() >= 0.45:
            result["detections"].append({"label": CLIP_SEMANTIC_PROMPTS[i], "source": "CLIP", "confidence": round(score.item(), 2)})
    crime_inputs = clip_processor(text=CRIME_PROMPTS, images=image_pil, return_tensors="pt", padding=True)
    with torch.no_grad():
        crime_outputs = clip_model(**crime_inputs)
    crime_probs = crime_outputs.logits_per_image.softmax(dim=1).squeeze()
    best_idx = torch.argmax(crime_probs).item()
    result["crime_type"] = CRIME_PROMPTS[best_idx]
    result["crime_score"] = round(crime_probs[best_idx].item(), 2)
    with open(os.path.join(DETECTIONS_DIR, os.path.splitext(os.path.basename(image_path))[0] + ".json"), "w") as f:
        json.dump(result, f, indent=2)
    cv2.imwrite(os.path.join(ANNOTATED_DIR, os.path.basename(image_path)), image_cv)

def generate_summary(crime_type, objects):
    prompt = f"""
You are a forensic analyst. Based on the detected objects and predicted crime type, generate a structured forensic scene summary. 
Also determine the priority level of the scene (High / Medium / Low) and give a one-line reason for your choice.

### Crime Type:
{crime_type}

### Detected Objects:
{chr(10).join(['- ' + obj for obj in objects])}

### Format:
1. Scene Overview  
2. Key Evidence  
3. Possible Events  
4. Recommended Forensic Actions  
5. Priority Level: <High / Medium / Low> - <one-line reason>
"""
    response = model.generate_content(prompt)
    return response.text.strip()

def process_summaries():
    scene_map = {}
    for fname in sorted(os.listdir(DETECTIONS_DIR)):
        if fname.endswith(".json") and "scene" in fname:
            scene_id = fname.split("_")[0]
            with open(os.path.join(DETECTIONS_DIR, fname), "r") as f:
                data = json.load(f)
            objects = [d["label"] for d in data.get("detections", [])]
            crime_type = data.get("crime_type")
            score = data.get("crime_score", 0)
            timestamp = f"{data.get('start_time', '??')} - {data.get('end_time', '??')}"
            start_sec = data.get("start_sec", 0)
            end_sec = data.get("end_sec", 0)
            if scene_id not in scene_map:
                scene_map[scene_id] = {"objects": set(), "crime_scores": [], "timestamp": timestamp,
                                       "start": start_sec, "end": end_sec}
            scene_map[scene_id]["objects"].update(objects)
            if crime_type and score >= 0.5:
                scene_map[scene_id]["crime_scores"].append((crime_type, score))
    for scene_id, data in scene_map.items():
        best_crime = sorted(data["crime_scores"], key=lambda x: -x[1])
        selected_crime = best_crime[0][0] if best_crime else "general crime scene"
        summary = generate_summary(selected_crime, sorted(data["objects"]))
        priority_line = [line for line in summary.splitlines() if "Priority Level:" in line]
        priority = "Low"
        if priority_line:
            for level in ["High", "Medium", "Low"]:
                if level in priority_line[0]:
                    priority = level
                    break
        out_path = os.path.join(SUMMARIES_DIR, f"{scene_id}_summary.md")
        with open(out_path, "w") as f:
            f.write(f"### {scene_id.capitalize()} ({data['timestamp']})\n")
            f.write(f"**Priority:** {priority}\n\n{summary}")
        if priority == "High" and data["start"] < data["end"]:
            try:
                clip = VideoFileClip(VIDEO_PATH).subclip(data["start"], data["end"])
                clip_path = os.path.join(CLIPS_DIR, f"{scene_id}_clip.mp4")
                clip.write_videofile(clip_path, codec="libx264", logger=None)
            except Exception as e:
                print(f"[!] Clip save failed for {scene_id}: {e}")

def generate_case_report():
    summaries = []
    for fname in sorted(os.listdir(SUMMARIES_DIR)):
        if fname.endswith(".md"):
            with open(os.path.join(SUMMARIES_DIR, fname), "r") as f:
                summaries.append(f.read().strip())
    prompt = f"""
You are a senior forensic AI. Compile the following scene summaries into a structured final case report:

{chr(10).join(summaries)}

### Structure:
1. Case Overview  
2. High-Priority Scenes  
3. Supporting Scenes  
4. Final Notes  
5. Attachments
"""
    response = model.generate_content(prompt)
    report = response.text.strip()
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    date_str = datetime.now().strftime("%B %d, %Y")
    header = f"# Forensic Case Report\n\n**Case ID:** CASE-{timestamp}  \n**Date:** {date_str}  \n**Generated By:** CrimeSleuth AI\n\n---\n"
    with open(FINAL_REPORT_PATH, "w") as f:
        f.write(header + report)
    print(f"✅ Final report saved: {FINAL_REPORT_PATH}")

def run_full_pipeline(video_path):
    scenes = detect_scenes_with_fallback(video_path)
    extract_keyframes(video_path, scenes)
    for file in sorted(os.listdir(KEYFRAMES_DIR)):
        if file.endswith(".jpg"):
            detect_objects(os.path.join(KEYFRAMES_DIR, file))
    process_summaries()
    generate_case_report()
