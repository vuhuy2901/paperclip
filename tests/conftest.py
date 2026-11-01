"""Keep test databases isolated from developer runtime state."""

import os
import tempfile
from pathlib import Path

_storefront_tmp = tempfile.TemporaryDirectory(prefix="ai-company-pytest-", ignore_cleanup_errors=True)
os.environ.setdefault("STOREFRONT_DATABASE_URL", f"sqlite:///{Path(_storefront_tmp.name, 'storefront.db').as_posix()}")
