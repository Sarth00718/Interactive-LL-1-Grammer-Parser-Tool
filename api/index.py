import sys
import os

# Append the backend directory so internal package imports (app.services, etc.) resolve properly
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.abspath(os.path.join(current_dir, "..", "backend"))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.main import app as fastapi_app  # noqa: E402


async def app(scope, receive, send):
    if scope["type"] == "http":
        headers = dict(scope.get("headers", []))
        raw_matched = headers.get(b"x-matched-path") or headers.get(b"x-vercel-matched-path")
        if raw_matched:
            matched_path = raw_matched.decode("utf-8").split("?")[0]
            scope["path"] = matched_path
    await fastapi_app(scope, receive, send)
