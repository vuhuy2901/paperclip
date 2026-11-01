FROM docker:27-cli
WORKDIR /app
RUN apk add --no-cache python3 py3-pip && python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
RUN pip install --no-cache-dir fastapi uvicorn pydantic
COPY apps ./apps
CMD ["uvicorn", "apps.preview.service:app", "--host", "0.0.0.0", "--port", "8300"]
