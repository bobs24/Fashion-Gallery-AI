import os
import requests

METABASE_URL = os.environ.get("METABASE_URL")
METABASE_USERNAME = os.environ.get("METABASE_USERNAME")
METABASE_PASSWORD = os.environ.get("METABASE_PASSWORD")

def get_metabase_session():
    """Authenticates with Metabase and returns a session token."""
    session_url = f"{METABASE_URL}/api/session"
    payload = {"username": METABASE_USERNAME, "password": METABASE_PASSWORD}
    res = requests.post(session_url, json=payload)
    res.raise_for_status()
    return res.json()["id"]

def fetch_metabase_products():
    """Fetches product metadata from Metabase card 6174."""
    try:
        token = get_metabase_session()
        card_query_url = f"{METABASE_URL}/api/card/6174/query/json"
        headers = {"Content-Type": "application/json", "X-Metabase-Session": token}
        
        res = requests.post(card_query_url, headers=headers, json={"parameters": []})
        res.raise_for_status()
        
        data = res.json()
        
        parsed_data = []
        for item in data:
            product_id = str(item.get("PRODUCT_ID", "")).strip()
            if product_id:
                parsed_data.append({
                    "product_id": product_id,
                    "BRAND_NAME": item.get("BRAND_NAME"),
                    "PRODUCT_NAME": item.get("PRODUCT_NAME"),
                    "CATEGORY": item.get("CATEGORY"),
                    "SUBCATEGORY": item.get("SUBCATEGORY"),
                    "PRODUCT_GENDER": item.get("PRODUCT_GENDER"),
                    "GROUP_CODE": item.get("GROUP_CODE"),
                })
        return parsed_data
    except Exception as e:
        print(f"Error fetching from Metabase: {e}")
        raise