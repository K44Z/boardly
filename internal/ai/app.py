from fastapi import FastAPI, UploadFile
import whisper
import tempfile

app = FastAPI()
model = whisper.load_model("base")

@app.post("/transcribe")
async def transcribe(audio: UploadFile):
    with tempfile.NamedTemporaryFile(delete=True, suffix=".wav") as f:
        f.write(await audio.read())
        f.flush()
        result = model.transcribe(f.name)
        return {"text": result["text"]}
