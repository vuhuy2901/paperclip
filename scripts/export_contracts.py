import json
from pathlib import Path
from apps.core_api.main import app
from apps.core_api.schemas import TaskResult

ROOT = Path(__file__).resolve().parents[1]
(ROOT / "packages/contracts/generated").mkdir(parents=True, exist_ok=True)
(ROOT / "packages/contracts/generated/openapi.json").write_text(json.dumps(app.openapi(), indent=2), encoding="utf-8")
(ROOT / "packages/contracts/generated/task-result.schema.json").write_text(json.dumps(TaskResult.model_json_schema(), indent=2), encoding="utf-8")
print("exported contracts")
