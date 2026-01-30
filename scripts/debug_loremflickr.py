import os
import urllib.request
import urllib.error

# Base path for frontend assets
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSETS_DIR = os.path.join(BASE_DIR, 'frontend', 'src', 'assets', 'breeds')

# Ensure directory exists
os.makedirs(ASSETS_DIR, exist_ok=True)

# Try loremflickr
url = 'https://loremflickr.com/640/480/cow'
# Redirects are common on these services, standard urllib handles redirects automatically.

print(f"Downloading from {url}...")

try:
    with urllib.request.urlopen(url) as response:
        print(f"  - Successfully opened! Content length: {response.length}")
        with open(os.path.join(ASSETS_DIR, 'test_cow.jpg'), 'wb') as f:
            f.write(response.read())
            print("  - Saved test_cow.jpg")
except urllib.error.HTTPError as e:
    print(f"  - HTTP FAILED: {e.code} {e.reason}")
except Exception as e:
    print(f"  - FAILED: {e}")
