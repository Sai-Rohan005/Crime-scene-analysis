from flask import Blueprint, request, jsonify
from models.report_generator import generate_case_report
from services.mongo_service import summaries_collection, reports_collection
from datetime import datetime

report_bp = Blueprint("report", __name__)

@report_bp.route("/generate-case-report", methods=["POST"])
def generate_report():
    data = request.get_json()
    case_id = data.get("case_id")

    if not case_id:
        return jsonify({"error": "Missing case_id"}), 400

    summaries = summaries_collection.find({"case_id": case_id})
    summary_list = [s["summary"] for s in summaries]

    if not summary_list:
        return jsonify({"error": "No summaries found for this case_id"}), 404

    report = generate_case_report(case_id, summary_list)
    reports_collection.insert_one({
        "case_id": case_id,
        "report": report,
        "generated_at": datetime.utcnow()
    })

    return jsonify({
        "case_id": case_id,
        "report": report
    })
