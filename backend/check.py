from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()

# ✅ Mock police ID database
mock_db = {
    "POL12345": {"name": "Jane Smith", "department": "LAPD"},
    "DEL99999": {"name": "Ravi Kumar", "department": "Delhi Police"}
}

# ✅ Request model
class PoliceIDRequest(BaseModel):
    police_id: str

# ✅ Response model
class PoliceIDResponse(BaseModel):
    valid: bool
    name: str | None = None
    department: str | None = None
    message: str | None = None

# ✅ POST endpoint
@app.post("/verify-police-id", response_model=PoliceIDResponse)
def verify_police_id(request: PoliceIDRequest):
    police_id = request.police_id
    if police_id in mock_db:
        data = mock_db[police_id]
        print(f"[LOG] Verified Police ID: {police_id}, Name: {data['name']}")
        return {"valid": True, **data}
    
    print(f"[LOG] Invalid Police ID attempted: {police_id}")
    return {"valid": False, "message": "Police ID not found"}
