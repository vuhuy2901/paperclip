import json
from pathlib import Path
from apps.roles.catalog import required_artifacts, render_artifact


ROLE_IDS = ["project-manager", "architect", "ui-ux-designer", "backend-developer", "frontend-developer", "code-reviewer", "tester", "devops"]


def test_each_role_has_isolated_prompt_skills_policy_and_schema():
    root = Path(__file__).parents[1] / "apps" / "roles"
    for role in ROLE_IDS:
        directory = root / role
        assert (directory / "prompt.md").is_file()
        assert (directory / "skills.md").is_file()
        policy = json.loads((directory / "tool-policy.json").read_text())
        schema = json.loads((directory / "output.schema.json").read_text())
        assert policy["role"] == role
        assert schema["properties"]["role"]["const"] == role


def test_role_artifact_catalog_matches_output_schemas():
    root = Path(__file__).parents[1] / "apps" / "roles"
    for role in ROLE_IDS:
        schema = json.loads((root / role / "output.schema.json").read_text())
        expected = set(schema["properties"]["artifacts"]["items"]["enum"])
        assert set(required_artifacts(role)) == expected
        for path in expected:
            assert render_artifact(role, "test task", path)
