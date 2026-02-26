#!/bin/bash

# Run the FastAPI development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
