FROM python:3.13-slim
WORKDIR /app
RUN pip install --no-cache-dir "fastapi>=0.115,<1" "uvicorn[standard]>=0.30,<1" "sqlalchemy>=2.0,<3" "pydantic>=2.8,<3" "psycopg[binary]>=3.2,<4"
COPY templates ./templates
CMD ["uvicorn", "templates.storefront.backend.main:app", "--host", "0.0.0.0", "--port", "8200"]
