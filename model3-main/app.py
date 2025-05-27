from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
from config import VIDEO_PATH, VIDEO_UPLOAD_FOLDER
from utils.process_video import run_full_pipeline
import os

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = VIDEO_UPLOAD_FOLDER

@app.route('/')
def home():
    return "✅ Forensic AI backend is running."

@app.route('/analyze', methods=['POST'])
def analyze():
    if 'video' not in request.files:
        return jsonify({"error": "No video uploaded"}), 400

    video = request.files['video']
    if video.filename == '':
        return jsonify({"error": "No selected file"}), 400

    filename = secure_filename(video.filename)
    video_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    video.save(video_path)

    result = run_full_pipeline(video_path)
    return jsonify({
        "message": "Analysis complete",
        "scenes_detected": result["scenes"],
        "report_path": result["report"]
    })

if __name__ == '__main__':
    app.run(debug=True)