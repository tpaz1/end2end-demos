from fastapi import FastAPI
from fastapi.responses import Response
from dotenv import load_dotenv
import structlog

load_dotenv()

app = FastAPI()
log = structlog.get_logger()


LOGO = "🐍"
NAME = "Python"

@app.get("/plusone/{number}")
async def plus_one(number: int):
    result = number + 1
    log.info("plus_one", number=number, result=result)
    return Response(
        content=f"{LOGO}{NAME} - {result} - {NAME}{LOGO}",
        media_type="text/plain; charset=utf-8",
    )
