from pymongo import MongoClient
from config.settings import MONGO_URI

client = MongoClient(MONGO_URI)
db = client["forensic_ai"]
summaries_collection = db["image_summaries"]
reports_collection = db["case_reports"]
