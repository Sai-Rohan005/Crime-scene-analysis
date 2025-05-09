from config.settings import GEMINI_API_KEY
import google.generativeai as genai

genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel("models/gemini-1.5-flash-latest")

def generate_summary(crime_type, objects):
    prompt = f"""
You are a forensic analyst. Based on the detected objects and predicted crime type, generate a detailed and structured forensic scene summary for official documentation.

### Crime Type:
{crime_type}

### Detected Objects:
{chr(10).join(['- ' + obj for obj in objects])}

### Instructions:
- DO NOT use placeholders like [Insert name]
- Avoid dramatic or emotional language
- Infer logical scene conditions and actions based on objects
- Maintain a formal, structured tone used in forensic reports

### Summary Format:
1. Scene Overview  
2. Key Evidence  
3. Possible Events (based only on objects)  
4. Recommended Forensic Actions

Write the complete summary below:
"""
    response = model.generate_content(prompt)
    return response.text.strip()

