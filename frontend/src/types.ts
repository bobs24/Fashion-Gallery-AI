// This interface now matches the Supabase table schema provided.
export interface Product {
  product_id: string; // Changed to string to support large int8 values
  product_url: string;
}

// A new type to include the parsed embedding for client-side calculations.
export interface ProductWithEmbedding extends Product {
  product_embedding: number[];
}

// Interface for the data fetched from Metabase.
// Field names are based on the user's request.
export interface MetabaseProduct {
    product_id: string; // Changed to string to support large int8 values
    BRAND_NAME: string | null;
    PRODUCT_NAME: string | null;
    CATEGORY: string | null;
    SUBCATEGORY: string | null;
    PRODUCT_GENDER: string | null;
    GROUP_CODE: string | null;
}

// The final, enriched product type that combines all data sources.
export interface EnrichedProduct extends ProductWithEmbedding, Omit<MetabaseProduct, 'product_id'> {}