from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.routes import grammar, parser
from app.models.grammar import GrammarError

app = FastAPI(
    title="Breaking Down Grammars",
    description="Interactive LL(1) Grammar Analysis and Predictive Parsing Tool",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(GrammarError)
async def grammar_error_handler(request: Request, exc: GrammarError):
    return JSONResponse(status_code=400, content=exc.to_dict())


@app.exception_handler(Exception)
async def generic_error_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error.", "detail": str(exc)},
    )


app.include_router(grammar.router)
app.include_router(parser.router)


@app.get("/")
def root():
    return {"status": "ok", "name": "Breaking Down Grammars API"}


@app.get("/health")
def health():
    return {"status": "healthy"}
