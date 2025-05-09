from config.settings import GEMINI_API_KEY
import google.generativeai as genai

genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel("models/gemini-1.5-flash-latest")

def generate_case_report(case_id, image_summaries):
    summary_list = '\n'.join([f"- {item}" for item in image_summaries])
    prompt = f"""
You are a forensic officer. Based on the following individual image-level forensic summaries, generate a single, unified case report.

Case ID: {case_id}

Summaries:
{summary_list}

Create a formal, evidence-driven, and well-structured case report.
"""
    response = model.generate_content(prompt)
    return response.text.strip()
