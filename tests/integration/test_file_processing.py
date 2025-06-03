#!/usr/bin/env python3
"""
Test script for file processing functionality
"""

import json
import os
import tempfile
import base64

def create_test_binary_data():
    """Create test binary data for different file types"""
    
    # Create test files
    test_files = {}
    
    # Text file
    text_content = "Hello, this is a test text file!\nLine 2\nLine 3"
    test_files['test.txt'] = {
        'data': base64.b64encode(text_content.encode('utf-8')).decode('ascii'),
        'fileName': 'test.txt',
        'mimeType': 'text/plain'
    }
    
    # JSON file
    json_content = {"message": "test", "number": 42, "array": [1, 2, 3]}
    json_str = json.dumps(json_content, indent=2)
    test_files['data.json'] = {
        'data': base64.b64encode(json_str.encode('utf-8')).decode('ascii'),
        'fileName': 'data.json',
        'mimeType': 'application/json'
    }
    
    # Binary file (fake image)
    binary_content = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01'
    test_files['test.png'] = {
        'data': base64.b64encode(binary_content).decode('ascii'),
        'fileName': 'test.png',
        'mimeType': 'image/png'
    }
    
    return test_files

def simulate_n8n_items_with_files():
    """Simulate n8n input items with binary files"""
    test_files = create_test_binary_data()
    
    items = [
        {
            'json': {'id': 1, 'name': 'First item'},
            'binary': {
                'data': test_files['test.txt']
            }
        },
        {
            'json': {'id': 2, 'name': 'Second item'},
            'binary': {
                'attachment': test_files['data.json'],
                'image': test_files['test.png']
            }
        }
    ]
    
    return items

def test_file_detection():
    """Test detectBinaryFiles function"""
    print("=== Testing File Detection ===")
    
    items = simulate_n8n_items_with_files()
    
    # Simulate the detection logic
    binary_files = []
    for item_index, item in enumerate(items):
        if 'binary' in item:
            for key, binary_data in item['binary'].items():
                if binary_data and 'data' in binary_data and 'fileName' in binary_data:
                    binary_files.append({
                        'key': key,
                        'data': binary_data,
                        'itemIndex': item_index
                    })
    
    print(f"Found {len(binary_files)} binary files:")
    for bf in binary_files:
        print(f"  - {bf['data']['fileName']} (key: {bf['key']}, item: {bf['itemIndex']})")
    
    return binary_files

def test_file_processing():
    """Test complete file processing"""
    print("\n=== Testing File Processing ===")
    
    binary_files = test_file_detection()
    
    # Simulate file mapping creation
    file_mappings = []
    for bf in binary_files:
        # Decode base64 to get file size
        content = base64.b64decode(bf['data']['data'])
        
        mapping = {
            'filename': bf['data']['fileName'],
            'mimetype': bf['data']['mimeType'],
            'size': len(content),
            'binaryKey': bf['key'],
            'itemIndex': bf['itemIndex'],
            'extension': os.path.splitext(bf['data']['fileName'])[1][1:] if '.' in bf['data']['fileName'] else '',
        }
        
        # Create temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=f".{mapping['extension']}") as tmp:
            tmp.write(content)
            mapping['tempPath'] = tmp.name
        
        # Also add base64 data
        mapping['base64Data'] = bf['data']['data']
        
        file_mappings.append(mapping)
    
    print(f"Created {len(file_mappings)} file mappings:")
    for fm in file_mappings:
        print(f"  - {fm['filename']}: {fm['size']} bytes at {fm['tempPath']}")
    
    return file_mappings

def test_python_script_generation():
    """Test Python script generation with files"""
    print("\n=== Testing Python Script Generation ===")
    
    file_mappings = test_file_processing()
    
    # Generate input_files array like in the real function
    files_array = []
    for file in file_mappings:
        file_info = {
            'filename': file['filename'],
            'mimetype': file['mimetype'],
            'size': file['size'],
            'extension': file['extension'],
            'binary_key': file['binaryKey'],
            'item_index': file['itemIndex'],
        }
        
        if file.get('tempPath'):
            file_info['temp_path'] = file['tempPath']
        
        if file.get('base64Data'):
            file_info['base64_data'] = file['base64Data']
        
        files_array.append(file_info)
    
    # Generate script section
    input_files_section = f"""
# Binary files from previous nodes
input_files = {json.dumps(files_array, indent=2)}"""
    
    print("Generated input_files section:")
    print(input_files_section)
    
    # Test file access
    print("\n=== Testing File Access ===")
    for file_info in files_array:
        print(f"\nProcessing {file_info['filename']}:")
        
        if 'temp_path' in file_info:
            try:
                with open(file_info['temp_path'], 'rb') as f:
                    content = f.read()
                print(f"  ✅ Read {len(content)} bytes from temp file")
                
                # Try to read as text if it's a text file
                if file_info['mimetype'].startswith('text/') or file_info['extension'] == 'json':
                    try:
                        text_content = content.decode('utf-8')
                        print(f"  ✅ Decoded as text: {text_content[:50]}...")
                    except:
                        print("  ⚠️ Could not decode as text")
                        
            except Exception as e:
                print(f"  ❌ Error reading temp file: {e}")
        
        if 'base64_data' in file_info:
            try:
                content = base64.b64decode(file_info['base64_data'])
                print(f"  ✅ Decoded {len(content)} bytes from base64")
            except Exception as e:
                print(f"  ❌ Error decoding base64: {e}")
    
    # Cleanup temp files
    print("\n=== Cleanup ===")
    for file_info in files_array:
        if 'temp_path' in file_info:
            try:
                os.unlink(file_info['temp_path'])
                print(f"  ✅ Cleaned up {file_info['temp_path']}")
            except Exception as e:
                print(f"  ❌ Error cleaning up {file_info['temp_path']}: {e}")

if __name__ == '__main__':
    print("File Processing Test Script")
    print("=" * 50)
    
    try:
        test_python_script_generation()
        print("\n🎉 All tests completed successfully!")
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        import traceback
        traceback.print_exc() 