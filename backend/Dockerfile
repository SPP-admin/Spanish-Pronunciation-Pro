FROM python:3.10-slim-buster

WORKDIR /app

# Install ffmpeg for audio processing
RUN apt-get update && apt-get install -y ffmpeg

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

# Use uvicorn to run the FastAPI app
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
