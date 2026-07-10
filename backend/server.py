"""
Reverse proxy for the Kubernetes ingress.

The environment routes /api/* on the preview URL to port 8001. Since the whole
app is Next.js (which listens on 3000), we forward everything from 8001 to
localhost:3000 so the /api/* handlers reach the Next.js server.
"""
import httpx
from fastapi import FastAPI, Request, Response
from fastapi.responses import StreamingResponse

app = FastAPI()
TARGET = "http://127.0.0.1:3000"

HOP_BY_HOP = {
    "connection",
    "keep-alive",
    "proxy-authenticate",
    "proxy-authorization",
    "te",
    "trailers",
    "transfer-encoding",
    "upgrade",
    "content-encoding",
    "content-length",
}


@app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"])
async def proxy(path: str, request: Request):
    url = f"{TARGET}/{path}"
    if request.url.query:
        url = f"{url}?{request.url.query}"

    forwarded_headers = {
        k: v for k, v in request.headers.items() if k.lower() not in HOP_BY_HOP
    }
    body = await request.body()

    async with httpx.AsyncClient(timeout=60.0) as client:
        upstream = await client.request(
            request.method,
            url,
            headers=forwarded_headers,
            content=body,
            follow_redirects=False,
        )

    response_headers = {
        k: v for k, v in upstream.headers.items() if k.lower() not in HOP_BY_HOP
    }
    return Response(
        content=upstream.content,
        status_code=upstream.status_code,
        headers=response_headers,
        media_type=upstream.headers.get("content-type"),
    )
