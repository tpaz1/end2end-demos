from fastapi import FastAPI
from fastapi.responses import Response, HTMLResponse
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
import os
import structlog

load_dotenv()

app = FastAPI()
log = structlog.get_logger()

app.mount("/static", StaticFiles(directory="static"), name="static")

NAME = "Python"


def get_version() -> str:
    return os.environ.get("APP_VERSION", "1.0.0")

# Python brand: #3776ab blue, #ffd43b yellow
INDEX_HTML_TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Python · Version</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      min-height: 100vh;
      font-family: 'Segoe UI', system-ui, sans-serif;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
      color: #e8e8e8;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      overflow-x: hidden;
    }
    .card {
      background: rgba(255,255,255,0.06);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255,212,59,0.2);
      border-radius: 24px;
      padding: 2.5rem;
      max-width: 420px;
      width: 100%;
      text-align: center;
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.4);
    }
    .logo-wrap {
      width: 140px;
      height: 140px;
      margin: 0 auto 1.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      filter: drop-shadow(0 0 24px rgba(255,212,59,0.5));
      animation: float 4s ease-in-out infinite;
    }
    .logo-wrap img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
    @keyframes float {
      0%, 100% { transform: translateY(0) rotate(-2deg); }
      50% { transform: translateY(-12px) rotate(2deg); }
    }
    h1 { font-size: 1.75rem; font-weight: 700; margin-bottom: 0.25rem; color: #ffd43b; }
    .sub { color: #94a3b8; font-size: 0.95rem; margin-bottom: 1.5rem; }
    .version-line {
      font-size: 2.75rem;
      font-weight: 700;
      color: #ffd43b;
      margin: 0;
      animation: float 4s ease-in-out infinite;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo-wrap" aria-hidden="true"><img src="/static/logo.png" alt="Python"></div>
    <h1>Python</h1>
    <p class="sub">Application version</p>
    <p class="version-line">{{VERSION}}</p>
  </div>
</body>
</html>
"""


@app.get("/", response_class=HTMLResponse)
async def index():
    return INDEX_HTML_TEMPLATE.replace("{{VERSION}}", get_version())


@app.get("/version")
async def version():
    return Response(
        content=f"{NAME} Application version - {get_version()}",
        media_type="text/plain; charset=utf-8",
    )


@app.get("/plusone/{number}")
async def plus_one(number: int):
    result = number + 1
    log.info("plus_one", number=number, result=result)
    return Response(
        content=f"{NAME} - {result} - {NAME}",
        media_type="text/plain; charset=utf-8",
    )
