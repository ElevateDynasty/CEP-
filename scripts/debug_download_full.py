import os
import urllib.request
import urllib.error

# Base path for frontend assets
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSETS_DIR = os.path.join(BASE_DIR, 'frontend', 'src', 'assets', 'breeds')

# Ensure directory exists
os.makedirs(ASSETS_DIR, exist_ok=True)

# Try the full resolution URL
url = 'https://upload.wikimedia.org/wikipedia/commons/6/6f/Gir_01.JPG'
headers = {
    'User-Agent': 'BreedRecognitionBot/1.0 (https://example.com/contact)'
}

print(f"Downloading Gir full from {url}...")

try:
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req) as response:
        print(f"  - Successfully opened! Content length: {response.length}")
except urllib.error.HTTPError as e:
    print(f"  - HTTP FAILED: {e.code} {e.reason}")
except Exception as e:
    print(f"  - FAILED: {e}")
