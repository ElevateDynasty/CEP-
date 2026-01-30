import os
import shutil

# Paths
ARTIFACTS_DIR = r"C:\Users\gaura\.gemini\antigravity\brain\e94030a0-fbc1-447a-98de-d7a35806b175"
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSETS_DIR = os.path.join(BASE_DIR, 'frontend', 'src', 'assets', 'breeds')

# Ensure assets dir exists
os.makedirs(ASSETS_DIR, exist_ok=True)

# Generated source files (update with actual timestamps found)
IMG_RED_ZEBU = "gir_cattle_authentic_1769488139856.png"
IMG_GREY_ZEBU = "grey_zebu_authentic_1769488215619.png"
IMG_SPOTTED_ZEBU = "spotted_zebu_authentic_1769488258817.png"
IMG_BUFFALO_WATER = "murrah_buffalo_authentic_1769488164408.png"
IMG_BUFFALO_FIELD = "buffalo_field_authentic_1769488279508.png"
IMG_BUFFALO_HEAD = "buffalo_headshot_authentic_1769488305384.png"

# Assignments
MAPPING = {
    # Red Zebu
    'gir.jpg': IMG_RED_ZEBU,
    'sahiwal.jpg': IMG_RED_ZEBU,
    'redSindhi.jpg': IMG_RED_ZEBU,
    'rathi.jpg': IMG_RED_ZEBU,
    'vechur.jpg': IMG_RED_ZEBU, # often black/red

    # Grey Zebu
    'tharparkar.jpg': IMG_GREY_ZEBU,
    'kankrej.jpg': IMG_GREY_ZEBU,
    'ongole.jpg': IMG_GREY_ZEBU,
    'hariana.jpg': IMG_GREY_ZEBU,
    'khillari.jpg': IMG_GREY_ZEBU,
    'kangayam.jpg': IMG_GREY_ZEBU,
    'hallikar.jpg': IMG_GREY_ZEBU,
    'amritmahal.jpg': IMG_GREY_ZEBU,
    'punganur.jpg': IMG_GREY_ZEBU, # light colored

    # Spotted Zebu
    'deoni.jpg': IMG_SPOTTED_ZEBU,

    # Buffalo Water
    'murrah.jpg': IMG_BUFFALO_WATER,
    'niliRavi.jpg': IMG_BUFFALO_WATER,
    'surti.jpg': IMG_BUFFALO_WATER,

    # Buffalo Field
    'mehsana.jpg': IMG_BUFFALO_FIELD,
    'bhadawari.jpg': IMG_BUFFALO_FIELD,
    'nagpuri.jpg': IMG_BUFFALO_FIELD,
    'pandharpuri.jpg': IMG_BUFFALO_FIELD,

    # Buffalo Headshot
    'jaffarabadi.jpg': IMG_BUFFALO_HEAD,
    'toda.jpg': IMG_BUFFALO_HEAD,
}

print(f"Distributing images from {ARTIFACTS_DIR} to {ASSETS_DIR}...")

for target_name, source_name in MAPPING.items():
    source_path = os.path.join(ARTIFACTS_DIR, source_name)
    target_path = os.path.join(ASSETS_DIR, target_name)
    
    try:
        shutil.copy2(source_path, target_path)
        print(f"Copied {source_name} -> {target_name}")
    except Exception as e:
        print(f"FAILED to copy {target_name}: {e}")

print("Distribution complete.")
