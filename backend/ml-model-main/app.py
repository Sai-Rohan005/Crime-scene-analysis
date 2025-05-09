from flask import Flask
from routes.summary_routes import summary_bp
from routes.report_routes import report_bp
from flask_cors import CORS


app = Flask(__name__)
CORS(app)
CORS(app, supports_credentials=True, origins=["http://localhost:8080"])
@app.route("/health", methods=["GET", "HEAD"])
def health_check():
    return {"status": "ok"}, 200
app.register_blueprint(summary_bp)
app.register_blueprint(report_bp)

if __name__ == "__main__":
    app.run(debug=True, port=8000)
