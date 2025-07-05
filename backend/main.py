from fastapi import FastAPI
from api.handlers import product_handler
from dotenv import load_dotenv

load_dotenv()  # Load .env file ke environment variables

app = FastAPI(title="Product Metadata API")
app.include_router(product_handler.router)
