FROM python:3.10-slim-buster

WORKDIR /api

COPY requirements.txt requirements.txt
RUN pip3 install -r requirements.txt

COPY . .

# Use uvicorn to run the FastAPI app
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
