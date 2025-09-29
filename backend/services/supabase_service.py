import os
from supabase import create_client, Client

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)

def fetch_supabase_products():
    """
    Fetches all 1500 products from our new, pre-sampled table.
    """
    try:
        # This line correctly fetches from your new table.
        response = supabase.from_('get_random_products').select('*').execute()
        
        if response.data:
            return response.data
        return []
    except Exception as e:
        print(f"Error fetching from Supabase table 'get_random_products': {e}")
        raise