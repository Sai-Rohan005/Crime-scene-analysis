from flask import Blueprint, request, jsonify
from config.settings import UPLOAD_DIR
from models.detection import detect_objects_and_classify
from models.summary_generator import generate_summary
from services.mongo_service import summaries_collection
import os
from datetime import datetime

summary_bp = Blueprint("summary", __name__)

@summary_bp.route("/ml/generate-summary", methods=["POST"])
def generate_summary_route():
    case_id = request.form.get("case_id")
    image_id = request.form.get("image_id")
    image_file = request.files.get("image")

    if not all([case_id, image_id, image_file]):
        return jsonify({"error": "Missing case_id, image_id, or image"}), 400

    image_path = os.path.join(UPLOAD_DIR, f"{case_id}_{image_id}.jpg")
    image_file.save(image_path)

    detection = detect_objects_and_classify(image_path)
    summary = generate_summary(detection['crime_type'], detection['objects_detected'])

    summaries_collection.insert_one({
        "case_id": case_id,
        "image_id": image_id,
        "crime_type": detection['crime_type'],
        "objects_detected": detection['objects_detected'],
        "summary": summary,
        "timestamp": datetime.utcnow()
    })
    print("✅ Flask: /generate-summary endpoint hit!")
    print("➡️ Form Data - Case ID:", case_id)
    print("➡️ Form Data - Image ID:", image_id)
    print("➡️ Image file received?", bool(image_file))

    return jsonify({
        "case_id": case_id,
        "image_id": image_id,
        "crime_type": detection['crime_type'],
        "objects_detected": detection['objects_detected'],
        "summary": summary
    })
