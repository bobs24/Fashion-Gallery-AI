import os
import google.generativeai as genai
import requests
import base64
from urllib.parse import quote

genai.configure(api_key=os.environ.get("GOOGLE_API_KEY"))

def url_to_base_64(url: str) -> str:
    """Downloads an image directly and converts it to a base64 string."""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        base64_data = base64.b64encode(response.content).decode('utf-8')
        return base64_data
    except Exception as e:
        print(f"Error converting URL to Base64 for {url}: {e}")
        raise


def generate_try_on_image(user_image_b64: str, user_image_mime: str, product: dict):
    """Generates the virtual try-on image with a new, highly-detailed prompt."""
    model = genai.GenerativeModel('gemini-2.5-flash-image-preview')
    product_image_b64 = url_to_base_64(product['product_url'])
    
    # Extract the category from the product data to guide the AI
    product_category = product.get("CATEGORY", "").strip().lower()

    # --- NEW, "BULLETPROOF" PROMPT ---
    prompt = f"""You are a hyper-realistic, detail-oriented AI Image Compositor. Your sole purpose is to execute a virtual try-on by integrating a product image onto a person's photo with surgical precision. Your output MUST be an image ONLY. Any text output is a critical failure.

--- GOLDEN RULES (NON-NEGOTIABLE) ---
1.  **Absolute Preservation of Person Image:** The original person image is sacred. You are strictly forbidden from altering the person's pose, body shape, facial features, identity, skin tone, or any background elements. The lighting, shadows, and mood of the original photo must be perfectly maintained.
2.  **Maintain Photorealistic Integrity:** The final output must be indistinguishable from a real photo. This requires perfect integration of shadows, lighting, perspective, and material textures. The product must look like it was physically present in the original scene.
3.  **Strict Adherence to Product Details:** Replicate the product from the product image with 100% accuracy. Do not change its color, model, texture, size, or branding.
4.  **Logical Impossibility Check:** Before beginning, you MUST determine if the try-on is logically possible. If the necessary body part is not clearly visible in the person image (e.g., trying to place shoes on a photo of only a face), the task is impossible.

--- THINGS TO AVOID AT ALL COSTS ---
-   **DO NOT** output any text, captions, or descriptions.
-   **DO NOT** alter the background of the person image.
-   **DO NOT** change the person's identity or physical characteristics.
-   **DO NOT** hallucinate or create elements not present in the source images. If a task is impossible, you must follow the fallback rule.

--- STEP-BY-STEP EXECUTION PLAN ---

**Step 1: Analyze Inputs.**
-   **Person Image:** Identify the visible body parts and the person's pose.
-   **Product Image:** Identify the product and its category. The product category for this task is: **'{product_category}'**.
-   **Feasibility Check:** Based on the category, is the necessary body part visible and suitable in the person image? If NO, proceed immediately to the Fallback Action.

**Step 2: Select Compositing Strategy based on Category.**

    **IF Category is 'clothes':**
    -   **Strategy:** Advanced Garment Inpainting & Replacement.
    -   **Action:** Execute a pixel-perfect, hyper-realistic virtual try-on. Your core task is the **absolute replacement** of the existing clothing on the person's torso (and extending to cover any relevant areas like shoulders, arms, or upper legs as dictated by the product's cut) with the provided product image.
    -   **Core Directives:**
        1.  **GARMENT INTEGRITY (CRITICAL):** The new garment's inherent structure—its neckline, collar, cuffs, hemline, and overall silhouette—MUST be preserved exactly as presented in the product image. Under NO circumstances should the AI attempt to alter the garment's intrinsic design (e.g., distorting the neckline, changing sleeve length, or modifying the base shape). It must appear as if the real garment is being worn.
        2.  **FIT & CONFORMATION (ANY HUMAN):** The garment must conform perfectly and realistically to the unique anatomy and pose of the human model, whether male or female. This includes:
            -   **Draping:** Realistic folds, creases, and wrinkles must manifest naturally, responding to the body's curves, joints, and any tension points.
            -   **Stretching/Compression:** If the pose implies tension or compression in the fabric, it must be rendered accurately.
            -   **Sleeves:** Precise rendering of sleeves, ensuring they follow the arm's contours without clipping or floating.
            -   **General Form:** The garment should appear to be physically worn, with accurate volumetric representation around the body.
        3.  **TOTAL OCCLUSION (NON-NEGOTIABLE):** The person's original clothing beneath the new garment, including any visible undergarments, shirts, or stockings, MUST be 100% removed and completely invisible. There should be ZERO ghosting, bleed-through, or any trace of the previous garment's fabric, color, or texture.
        4.  **SEAMLESS INTEGRATION:**
            -   **Lighting:** The new garment must flawlessly adopt the ambient lighting, shadows, and highlights present in the original person's photograph. Cast shadows onto the body from the garment should be physically accurate.
            -   **Texture & Materiality:** Render the specific fabric texture and material properties (e.g., sheen of silk, matte of cotton, texture of knitwear) with photorealistic fidelity.
        5.  **QUALITY:** The final output must be an ultra-high-resolution, photorealistic image, indistinguishable from a professional fashion photograph. Avoid any AI-generated artifacts, blurring, or unrealistic transitions.

   **IF Category is 'bags':**
    -   **Strategy:** Intelligent Layering.
    -   **Action:** Place the bag onto the person in a natural way. DO NOT replace their clothing.
    -   **Details:** Pay extreme attention to scale and interaction. The bag must cast realistic shadows on the person's body and clothing. Straps must curve naturally over shoulders or across the body.

   **IF Category is 'shoes':**
    -   **Strategy:** Footwear Replacement.
    -   **Action:** Replace the person's existing shoes with the product.
    -   **Details:** This is a high-precision task. You MUST render each shoe independently to match the unique angle and perspective of each of the person's feet.

   **IF Category is 'watches' or 'accessories':**
    -   **Strategy:** Precision Layering.
    -   **Action:** Place the accessory on the appropriate body part (watch on wrist, necklace on neck, earrings on ears).
    -   **Details:** Scale is critical. Ensure the item is realistically sized and interacts with the person's skin and other clothing.

   **IF Category is 'essentials':**
    -   **Strategy:** Contextual Integration.
    -   **Action:** Place the item in a way that suggests natural interaction (e.g., in the person's hand).
    -   **Details:** The person's hand should appear to be realistically gripping the object if applicable.

**Step 3: Execute and Finalize.**
-   Perform the selected compositing strategy.
-   Double-check that all Golden Rules and "Things to Avoid" have been followed.
-   Output the final, photorealistic image as your only response.

**--- FALLBACK ACTION (If Task is Impossible) ---**
If you determined in Step 1 that the try-on is impossible, your ONLY action is to return the original person image, completely unmodified.
"""

    user_image_part = {"mime_type": user_image_mime, "data": base64.b64decode(user_image_b64)}
    product_image_part = {"mime_type": "image/jpeg", "data": base64.b64decode(product_image_b64)}
    
    safety_settings = {
        'HARM_CATEGORY_HARASSMENT': 'BLOCK_ONLY_HIGH',
        'HARM_CATEGORY_HATE_SPEECH': 'BLOCK_ONLY_HIGH',
        'HARM_CATEGORY_SEXUALLY_EXPLICIT': 'BLOCK_ONLY_HIGH',
        'HARM_CATEGORY_DANGEROUS_CONTENT': 'BLOCK_ONLY_HIGH',
    }

    response = model.generate_content(
        [prompt, user_image_part, product_image_part],
        safety_settings=safety_settings
    )

    if not response.parts:
        try:
            block_reason = response.prompt_feedback.block_reason
            raise Exception(f"The AI blocked the request. Reason: {block_reason}. Please try a different photo.")
        except Exception as e:
             raise Exception(f"The AI returned an empty response, likely due to safety filters. Please try a different photo. Details: {e}")

    for part in response.parts:
        if part.inline_data:
            return base64.b64encode(part.inline_data.data).decode('utf-8')
            
    if response.text:
        # This error will now be caught correctly
        raise Exception(f"The AI provided a text response instead of an image: \"{response.text}\"")
    
    raise Exception("AI could not generate an image for an unknown reason.")