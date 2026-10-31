from types import SimpleNamespace
import pytest
from apps.orchestration.dag import order_tasks

def test_dag_orders_dependencies_before_dependents():
    result = order_tasks([SimpleNamespace(role="backend", depends_on=["architect"]), SimpleNamespace(role="architect", depends_on=[])])
    assert [task.role for task in result] == ["architect", "backend"]

def test_dag_rejects_cycle():
    with pytest.raises(ValueError, match="cycle"):
        order_tasks([SimpleNamespace(role="a", depends_on=["b"]), SimpleNamespace(role="b", depends_on=["a"])])
