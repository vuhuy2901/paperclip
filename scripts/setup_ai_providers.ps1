param(
  [string]$OllamaModel = "qwen2.5:0.5b"
)

$ErrorActionPreference = "Stop"

Write-Host "Starting Docker AI profile (Ollama)..."
docker compose --profile ai up -d ollama

Write-Host "Waiting for Ollama..."
for ($i = 0; $i -lt 30; $i++) {
  try {
    Invoke-WebRequest -UseBasicParsing http://localhost:11434/api/tags | Out-Null
    break
  } catch {
    Start-Sleep -Seconds 2
  }
  if ($i -eq 29) { throw "Ollama did not become ready on port 11434." }
}

Write-Host "Pulling Ollama model $OllamaModel..."
docker compose --profile ai exec ollama ollama pull $OllamaModel
if ($LASTEXITCODE -ne 0) {
  throw "Ollama model pull failed with exit code $LASTEXITCODE. Check Docker Desktop logs and retry."
}
Write-Host "Ollama is ready. Configure OPENROUTER_API_KEY in .env for OpenRouter roles."
