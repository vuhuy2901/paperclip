from apps.verification.routing import route_failure


def test_backend_failure_routes_to_backend_owner():
    result = route_failure("FAILED tests/test_storefront.py::test_cancel\nE templates/storefront/backend/main.py:61", "")
    assert result["owner"] == "backend-developer"
    assert result["file"] == "templates/storefront/backend/main.py"
    assert result["line"] == 61


def test_frontend_failure_routes_to_frontend_owner():
    result = route_failure("FAILED templates/storefront/frontend/src/App.tsx:12", "")
    assert result["owner"] == "frontend-developer"
