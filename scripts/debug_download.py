import os
import urllib.request
import urllib.error
import time

# Base path for frontend assets
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSETS_DIR = os.path.join(BASE_DIR, 'frontend', 'src', 'assets', 'breeds')

# Ensure directory exists
os.makedirs(ASSETS_DIR, exist_ok=True)

# Image URLs from ExplorePage.jsx
BREED_IMAGES = {
    'gir': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Gir_01.JPG/320px-Gir_01.JPG',
}

# Wikimedia requires a distinct User-Agent
headers = {
    'User-Agent': 'BreedRecognitionBot/1.0 (https://example.com/contact)'
}

print(f"Downloading images to {ASSETS_DIR}...")

for breed_id, url in BREED_IMAGES.items():
    try:
        filename = f"{breed_id}.jpg"
        filepath = os.path.join(ASSETS_DIR, filename)
        
        print(f"Downloading {breed_id} from {url}...")
        
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as response:
            data = response.read()
            print(f"  - Read {len(data)} bytes")
            with open(filepath, 'wb') as f:
                f.write(data)
            
        print("  - Saved!")
        
    except urllib.error.HTTPError as e:
        print(f"  - HTTP FAILED: {e.code} {e.reason}")
    except Exception as e:
        print(f"  - FAILED: {e}")

print("Debug complete.")
