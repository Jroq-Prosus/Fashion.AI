import io
import base64
from setup import Initializer
from PIL import Image

Initializer = Initializer.get_instance()


def groq_llama_completion(messages, token=1024):
    completion = Initializer.client_groq.chat.completions.create(
        model="meta-llama/llama-4-scout-17b-16e-instruct",
        messages=messages,
        temperature=1,
        max_completion_tokens=1024,
        top_p=1,
        stream=True,
        stop=None,
    )
    # Stream the output
    inference_result = ""
    for chunk in completion:
        chunk_inference = chunk.choices[0].delta.content or ""
        inference_result += chunk_inference
        print(chunk_inference, end="")
    return inference_result


def compress_and_encode_image(image_path, max_size=(512, 512), quality=70):
    image = Image.open(image_path).convert("RGB")
    image.thumbnail(max_size)  # Resize proportionally
    buffer = io.BytesIO()
    image.save(buffer, format="JPEG", quality=quality)
    base64_img = base64.b64encode(buffer.getvalue()).decode("utf-8")
    return base64_img
