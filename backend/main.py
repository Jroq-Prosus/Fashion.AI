from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from postgrest.exceptions import APIError
from dotenv import load_dotenv
from api.handlers import product_handler, ai_handler, user_handler, voice_handler as voi, ai_trend_geo_handler
from utils.response import standard_response
from fastapi.middleware.cors import CORSMiddleware

load_dotenv('../.env')  # Load .env file ke environment variables

app = FastAPI(title="Product Metadata API", swagger_ui_parameters={"syntaxHighlight": {"theme": "obsidian"}})

# -------------------------------
# Configure CORS
# -------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)

# -------------------------------
# Configure API Documentation 
# -------------------------------

app.include_router(product_handler.router)
app.include_router(user_handler.router)
app.include_router(ai_handler.router)
app.include_router(voi.router)
app.include_router(ai_trend_geo_handler.router)

# -------------------------------
# 🌟 Global Exception Handlers
# -------------------------------

@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content=standard_response(
            code=exc.status_code,
            message=exc.detail,
            data=None
        ),
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content=standard_response(
            code=422,
            message="Validation error",
            data=exc.errors()
        ),
    )

@app.exception_handler(APIError)
async def supabase_api_error_handler(request: Request, exc: APIError):
    # Map Supabase error PGRST116 (no rows) to 404
    status_code = 404 if exc.code == "PGRST116" else 500
    message = "Resource not found" if exc.code == "PGRST116" else "Supabase API error"
    return JSONResponse(
        status_code=status_code,
        content=standard_response(
            code=status_code,
            message=message,
            data={
                "supabase_code": exc.code,
                "supabase_message": exc.message,
                "supabase_details": exc.details
            }
        ),
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content=standard_response(
            code=500,
            message="Internal server error",
            data=str(exc)  # Optional: comment out in production
        ),
    )