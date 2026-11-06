from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.routes import grammar, parser, bottom_up
from app.models.grammar import GrammarError

app = FastAPI(
    title="Complete Grammar Analysis & Parsing Laboratory",
    description="Interactive Compiler Design laboratory supporting Top-Down (LL(1)) and Bottom-Up (LR(0), SLR(1), CLR(1), LALR(1)) parsing.",
    version="2.0.0",
    docs_url="/api/docs",
    openapi_url="/api/openapi.json",
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
app.include_router(bottom_up.router)


@app.get("/")
@app.get("/api")
def root():
    return {"status": "ok", "name": "Breaking Down Grammars API"}


@app.get("/health")
@app.get("/api/health")
def health():
    return {
        "status": "healthy",
        "app": "Complete Grammar Analysis & Parsing Laboratory",
        "version": "2.0.0",
        "methods": ["LL(1)", "LR(0)", "SLR(1)", "CLR(1)", "LALR(1)"],
    }
