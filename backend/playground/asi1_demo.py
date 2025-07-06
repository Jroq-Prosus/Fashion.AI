import os
import requests
import json
import dotenv

dotenv.load_dotenv()

url = "https://api.asi1.ai/v1/chat/completions"

payload = json.dumps({
    "model": "asi1-mini",
    "messages": [
        {
            "role": "user",
            "content": "Tell me about the current situation about Elon Musk and President Trump."
        }
    ],
    "temperature": 0,
    "stream": True,
    "max_tokens": 0
})
headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': 'Bearer ' + os.getenv("ASI_ONE_API_KEY", "")
}

response = requests.request("POST", url, headers=headers, data=payload)
text = ""

for line in response.iter_lines(decode_unicode=True):
    if not line or not line.startswith("data: "):
        continue
    try:
        data = json.loads(line[6:])
        delta = data.get("choices", [{}])[0].get("delta", {})
        content = delta.get("content", "")
        if content:
            text += content
    except Exception:
        continue

print(text)
