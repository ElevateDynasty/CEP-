import os
import urllib.request
import urllib.error
import time
import random

# Base path for frontend assets
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSETS_DIR = os.path.join(BASE_DIR, 'frontend', 'src', 'assets', 'breeds')

# Ensure directory exists
os.makedirs(ASSETS_DIR, exist_ok=True)

# Image URLs from ExplorePage.jsx
CATTLE_BREEDS = [
    'gir', 'sahiwal', 'redSindhi', 'tharparkar', 'kankrej', 'ongole', 'hariana', 
    'rathi', 'deoni', 'khillari', 'kangayam', 'hallikar', 'amritmahal', 'punganur', 'vechur'
]

BUFFALO_BREEDS = [
    'murrah', 'mehsana', 'jaffarabadi', 'surti', 'bhadawari', 'niliRavi', 
    'nagpuri', 'pandharpuri', 'toda'
]

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}

print(f"Downloading authentic placeholders to {ASSETS_DIR}...")

def download_image(breed_id, keyword):
    try:
        filename = f"{breed_id}.jpg"
        filepath = os.path.join(ASSETS_DIR, filename)
        
        # Use a random lock to get different images for different breeds but consistent for the same breed if we ran this again (though random seed changes)
        # Actually random number is better to ensure diversity now.
        url = f"https://loremflickr.com/640/480/{keyword}?lock={random.randint(1, 1000)}"
            
        print(f"Downloading {breed_id} ({keyword})...", end=" ")
        
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as response, open(filepath, 'wb') as f:
            f.write(response.read())
            
        print("Done!")
        time.sleep(1) # Be nice
        
    except Exception as e:
        print(f"FAILED: {e}")

for breed in CATTLE_BREEDS:
    download_image(breed, 'cow,cattle')

for breed in BUFFALO_BREEDS:
    download_image(breed, 'waterbuffalo,buffalo')

print("Download complete.")
