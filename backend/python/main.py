from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()

# Simulated database of valid police IDs
valid_police_ids = {"POLICE123", "CID456", "SP789"}

# Input schema
class PoliceIDRequest(BaseModel):
    police_id: str

@app.post("/verify-id")
def verify_police_id(data: PoliceIDRequest):
    if data.police_id in valid_police_ids:
        return {"status": "success", "message": "Valid Police ID"}
    else:
        raise HTTPException(status_code=401, detail="Invalid Police ID")

# For standalone script testing
if __name__ == "__main__":
    test = PoliceIDRequest(police_id="CID46")
    result = verify_police_id(test)
    print(result)
