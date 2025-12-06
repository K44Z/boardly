FROM python:3.12-slim

RUN apt-get update && apt-get install -y ffmpeg

RUN pip install fastapi uvicorn openai-whisper python-multipart

COPY app.py /app/app.py
WORKDIR /app

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
