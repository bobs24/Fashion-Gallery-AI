import os
import json
import time # Import the time module
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

from services.supabase_service import fetch_supabase_products
from services.metabase_service import fetch_metabase_products
# from services.gemini_service import validate_user_image, generate_try_on_image
from services.gemini_service import generate_try_on_image

app = FastAPI()

# Configure CORS to allow requests from the frontend
origins = [
    "http://localhost",
    "http://localhost:3000",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Simple Caching Setup ---
# This dictionary will store our product data in memory
products_cache = {
    "data": [],
    "last_fetched": 0
}
# We'll cache the data for 300 seconds (5 minutes)
CACHE_DURATION_SECONDS = 300

# --- Data Models for API requests ---
class TryOnPayload(BaseModel):
    user_image_b64: str
    user_image_mime: str
    product: dict

# --- API Endpoints ---
@app.get("/api/products")
async def get_all_products():
    """
    Fetches all product data from Supabase and Metabase, with caching.
    """
    current_time = time.time()
    
    # --- Caching logic start ---
    # Check if the cache is still valid (not expired) and not empty
    if current_time - products_cache["last_fetched"] < CACHE_DURATION_SECONDS and products_cache["data"]:
        print("✅ Returning products from cache.")
        return products_cache["data"]
    # --- Caching logic end ---

    print("⏳ Cache expired or empty. Fetching new product data from databases...")
    try:
        supabase_products = fetch_supabase_products()
        metabase_products = fetch_metabase_products()
        
        metabase_map = {p['product_id']: p for p in metabase_products}
        
        enriched_products = []
        for sp in supabase_products:
            try:
                embedding_list = json.loads(sp.get('product_embedding', '[]'))
            except (json.JSONDecodeError, TypeError):
                embedding_list = []

            metadata = metabase_map.get(str(sp['product_id']))
            if metadata:
                sp.update(metadata)
                sp['product_embedding'] = embedding_list
                enriched_products.append(sp)
        
        # --- Update the cache with the new data and timestamp ---
        products_cache["data"] = enriched_products
        products_cache["last_fetched"] = current_time
        print("✅ Cache updated successfully.")
                
        return enriched_products
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/generate-try-on")
async def create_try_on_image(payload: TryOnPayload):
    """
    Receives user image and product, calls Gemini, and returns the generated image.
    """
    try:
        # validation_str = validate_user_image(payload.user_image_b64)
        # validation = json.loads(validation_str)

        # # if not validation.get("isSafe"):
        # #      raise HTTPException(status_code=400, detail="The uploaded image is not suitable. Please upload a different photo.")
        # if validation.get("containsNudity"):
        #      raise HTTPException(status_code=400, detail="The uploaded photo appears to contain nudity, which is not permitted.")
        # if not validation.get("hasPerson"):
        #     raise HTTPException(status_code=400, detail="We couldn't detect a person in the image. Please use a clearer photo.")

        generated_image_b64 = generate_try_on_image(
            user_image_b64=payload.user_image_b64,
            user_image_mime=payload.user_image_mime,
            product=payload.product
        )
        return {"generated_image_b64": generated_image_b64}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))