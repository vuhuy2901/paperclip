FROM python:3.13-slim
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends git && rm -rf /var/lib/apt/lists/*
COPY pyproject.toml README.md ./
COPY apps ./apps
COPY cli.py ./
RUN pip install --no-cache-dir .[dev]
RUN mkdir -p /app/data
CMD ["uvicorn", "apps.core_api.main:app", "--host", "0.0.0.0", "--port", "8000"]
