import requests
import os

def test_prediction(image_path, label="Test"):
    url = "http://127.0.0.1:8000/api/v1/predict/"
    
    if not os.path.exists(image_path):
        print(f"❌ Image not found: {image_path}")
        return
        
    with open(image_path, 'rb') as img:
        files = {'image': img}
        response = requests.post(url, files=files)
    
    print(f"\n{'='*50}")
    print(f"Test: {label}")
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Animal : {data.get('animal_type')}")
        print(f"✅ Breed  : {data.get('breed')}")
        print(f"   Conf   : {data.get('breed_confidence')*100:.1f}%")
        print(f"   Time   : {data.get('processing_time_ms')}ms")
    else:
        print(f"❌ Error: {response.text}")

if __name__ == "__main__":
    test_prediction(
        "dataset/cattle/Gir/Gir_1.JPG",
        "Cattle - Gir"
    )
    test_prediction(
        "dataset/buffalo/murrah/130_Murrah_Buffalo_Stock_Photos_.jpg",
        "Buffalo - Murrah"
    )