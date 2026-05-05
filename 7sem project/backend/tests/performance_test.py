import time
import requests
import os

def run_performance_test():
    print("=== MoodMuse AI Performance Test ===")
    print("Testing /emotion/detect-emotion endpoint latency...")
    
    url = "http://localhost:8000/emotion/detect-emotion"
    
    # Create a dummy image file (100x100 white square in memory)
    # Using a pre-existing 1px image or generating a valid JPEG is better
    # Here we just use a small valid blank JPEG hex string for speed
    dummy_jpeg = bytes.fromhex("ffd8ffe000104a46494600010101006000600000ffdb004300080606070605080707070909080a0c140d0c0b0b0c1912130f141d1a1f1e1d1a1c1c20242e2720222c231c1c2837292c30313434341f27393d38323c2e333432ffdb0043010909090c0b0c180d0d1832211c213232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232ffc00011080001000103012200021101031101ffc4001f0000010501010101010100000000000000000102030405060708090a0bffc400b5100002010303020403050504040000017d01020300041105122131410613516107227114328191a1082342b1c11552d1f02433627282090a161718191a25262728292a3435363738393a434445464748494a535455565758595a636465666768696a737475767778797a838485868788898a92939495969798999aa2a3a4a5a6a7a8a9aab2b3b4b5b6b7b8b9bac2c3c4c5c6c7c8c9cad2d3d4d5d6d7d8d9dae1e2e3e4e5e6e7e8e9eaf1f2f3f4f5f6f7f8f9faffc4001f0100030101010101010101010000000000000102030405060708090a0bffc400b51100020102040403040705040400010277000102031104052131061241510761711322328108144291a1b1c109233352f0156272d10a162434e125f11718191a262728292a35363738393a434445464748494a535455565758595a636465666768696a737475767778797a82838485868788898a92939495969798999aa2a3a4a5a6a7a8a9aab2b3b4b5b6b7b8b9bac2c3c4c5c6c7c8c9cad2d3d4d5d6d7d8d9dae2e3e4e5e6e7e8e9eaf2f3f4f5f6f7f8f9faffda000c03010002110311003f00f9ffe8")
    
    files = {"file": ("dummy.jpg", dummy_jpeg, "image/jpeg")}
    data = {"text": "I feel amazing today!"}

    # Warmup request
    try:
        requests.post(url, files={"file": ("dummy.jpg", dummy_jpeg, "image/jpeg")}, data=data)
    except:
        print("Backend is not running. Please start FastAPI server first.")
        return

    # Real test
    start_time = time.time()
    response = requests.post(url, files=files, data=data)
    end_time = time.time()
    
    latency = end_time - start_time
    
    print(f"Response Status: {response.status_code}")
    print(f"Latency: {latency:.4f} seconds")
    
    if latency < 2.0:
        print("✅ PERFORMANCE TEST PASSED: Response is under 2 seconds.")
    else:
        print("❌ PERFORMANCE TEST FAILED: Response took longer than 2 seconds.")

if __name__ == "__main__":
    run_performance_test()
