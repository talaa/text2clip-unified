from openai import OpenAI
import os
import re
from dotenv import load_dotenv
from prompts import SCENE_GENERATION_PROMPT

# Load environment variables from .env file
load_dotenv()

# Set your API key securely
Open_api_key = os.getenv("OPENAI_API_KEY")

client = OpenAI(
  base_url="https://openrouter.ai/api/v1",
  api_key=Open_api_key,
)

def createscenes(topic, num_scenes):
    prompt = SCENE_GENERATION_PROMPT.format(topic=topic, num_scenes=num_scenes)
    completion = client.chat.completions.create(
        extra_headers={
            "HTTP-Referer": "<YOUR_SITE_URL>", # Optional. Site URL for rankings on openrouter.ai.
            "X-Title": "Text 2 Video", # Optional. Site title for rankings on openrouter.ai.
        },
        extra_body={},
        model="openrouter/free",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ]
    )
    result = completion.choices[0].message.content

    # robust parsing to extract json
    match = re.search(r'```json\s*(.*?)\s*```', result, re.DOTALL)
    if match:
        result = match.group(1)
    else:
        # fallback, try to extract first { to last }
        start = result.find('{')
        end = result.rfind('}')
        if start != -1 and end != -1:
            result = result[start:end+1]

    return result
