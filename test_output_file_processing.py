#!/usr/bin/env python3
"""
Test script for Output File Processing functionality v1.11.0
Demonstrates how Python scripts can generate files that are automatically 
detected and included in n8n output as binary data.
"""

import json
import os
import tempfile
import time
from datetime import datetime

def demonstrate_output_file_concept():
    """Demonstrate the concept of output file processing"""
    
    print("🎯 Output File Processing Concept Demo")
    print("=" * 50)
    
    # 1. Create a unique output directory (simulates what n8n would do)
    timestamp = int(time.time())
    unique_id = f"n8n_python_output_{timestamp}_{os.getpid()}"
    output_dir = os.path.join(tempfile.gettempdir(), unique_id)
    os.makedirs(output_dir, exist_ok=True)
    
    print(f"📁 Created output directory: {output_dir}")
    
    # 2. Simulate Python script that creates files
    created_files = []
    
    # Create a text file
    text_file = os.path.join(output_dir, "report.txt")
    with open(text_file, 'w') as f:
        f.write(f"Report generated at: {datetime.now()}\n")
        f.write("This is a generated text file from Python script.\n")
        f.write("It will be automatically detected by n8n.\n")
    created_files.append(text_file)
    
    # Create a JSON file
    json_file = os.path.join(output_dir, "data.json")
    data = {
        "timestamp": datetime.now().isoformat(),
        "status": "generated",
        "values": [1, 2, 3, 4, 5],
        "metadata": {
            "source": "python_script",
            "version": "1.11.0"
        }
    }
    with open(json_file, 'w') as f:
        json.dump(data, f, indent=2)
    created_files.append(json_file)
    
    # Create a CSV file
    csv_file = os.path.join(output_dir, "results.csv")
    with open(csv_file, 'w') as f:
        f.write("id,name,value\n")
        f.write("1,item1,100\n")
        f.write("2,item2,200\n")
        f.write("3,item3,300\n")
    created_files.append(csv_file)
    
    # Create a binary file (fake image)
    binary_file = os.path.join(output_dir, "chart.png")
    fake_png_data = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x01\x00\x00\x00\x007n\xf9$\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xdb\x00\x00\x00\x00IEND\xaeB`\x82'
    with open(binary_file, 'wb') as f:
        f.write(fake_png_data)
    created_files.append(binary_file)
    
    print(f"✅ Created {len(created_files)} files in output directory:")
    for file_path in created_files:
        size = os.path.getsize(file_path)
        filename = os.path.basename(file_path)
        print(f"   - {filename}: {size} bytes")
    
    # 3. Simulate file scanning and processing
    print("\n🔍 Scanning output directory for files...")
    detected_files = []
    
    for filename in os.listdir(output_dir):
        filepath = os.path.join(output_dir, filename)
        if os.path.isfile(filepath):
            # Get file info
            size = os.path.getsize(filepath)
            extension = os.path.splitext(filename)[1][1:].lower() if '.' in filename else ''
            
            # Read file content and convert to base64
            with open(filepath, 'rb') as f:
                content = f.read()
            
            import base64
            base64_data = base64.b64encode(content).decode('ascii')
            
            # Determine MIME type
            mime_types = {
                'txt': 'text/plain',
                'json': 'application/json',
                'csv': 'text/csv',
                'png': 'image/png',
                'jpg': 'image/jpeg',
                'pdf': 'application/pdf',
                'mp4': 'video/mp4',
                'mp3': 'audio/mpeg',
            }
            mimetype = mime_types.get(extension, 'application/octet-stream')
            
            detected_file = {
                'filename': filename,
                'size': size,
                'extension': extension,
                'mimetype': mimetype,
                'base64_data': base64_data,
                'binary_key': f"output_{filename}",  # How it would appear in n8n
            }
            
            detected_files.append(detected_file)
    
    print(f"📦 Detected {len(detected_files)} files for n8n output:")
    for file_info in detected_files:
        print(f"   - Binary key: '{file_info['binary_key']}'")
        print(f"     File: {file_info['filename']} ({file_info['size']} bytes, {file_info['mimetype']})")
    
    # 4. Simulate n8n output structure
    print("\n🎁 Generated n8n output structure:")
    n8n_result = {
        'json': {
            'script_result': 'success',
            'generated_files_count': len(detected_files),
            'generated_files_info': [
                {
                    'filename': f['filename'],
                    'size': f['size'],
                    'mimetype': f['mimetype'],
                    'binary_key': f['binary_key']
                } for f in detected_files
            ],
            'output_directory': output_dir,
            'execution_timestamp': datetime.now().isoformat()
        },
        'binary': {}
    }
    
    # Add binary data
    for file_info in detected_files:
        n8n_result['binary'][file_info['binary_key']] = {
            'data': file_info['base64_data'],
            'fileName': file_info['filename'],
            'mimeType': file_info['mimetype'],
            'fileExtension': file_info['extension']
        }
    
    print(json.dumps({
        'json_output': n8n_result['json'],
        'binary_keys': list(n8n_result['binary'].keys())
    }, indent=2))
    
    # 5. Cleanup (simulate auto-cleanup)
    print(f"\n🧹 Cleaning up output directory...")
    for file_path in created_files:
        try:
            os.unlink(file_path)
            print(f"   ✅ Deleted: {os.path.basename(file_path)}")
        except Exception as e:
            print(f"   ❌ Failed to delete {os.path.basename(file_path)}: {e}")
    
    try:
        os.rmdir(output_dir)
        print(f"   ✅ Removed directory: {output_dir}")
    except Exception as e:
        print(f"   ❌ Failed to remove directory: {e}")
    
    print("\n🎉 Output File Processing Demo Complete!")
    
    return {
        'concept': 'output_file_processing',
        'version': '1.11.0',
        'files_generated': len(detected_files),
        'workflow': [
            '1. Create unique output directory',
            '2. Python script saves files to output_dir',
            '3. n8n scans directory after script execution', 
            '4. Convert files to base64 and add to binary output',
            '5. Auto-cleanup temporary files'
        ],
        'benefits': [
            'Universal file support (any type)',
            'No file size accumulation', 
            'Unique per execution',
            'Automatic cleanup',
            'Works with parallel workflows'
        ]
    }

def simulate_user_script_examples():
    """Show examples of how users would use this feature"""
    
    print("\n📝 User Script Examples:")
    print("=" * 30)
    
    examples = [
        {
            'name': 'Image Generation',
            'script': '''
# Generate image with matplotlib
import matplotlib.pyplot as plt
import os

# output_dir is provided by n8n
fig, ax = plt.subplots()
ax.plot([1, 2, 3, 4], [1, 4, 2, 3])
ax.set_title('Generated Chart')

# Save to output directory
chart_path = os.path.join(output_dir, 'chart.png')
plt.savefig(chart_path, dpi=300, bbox_inches='tight')
plt.close()

print(f"Chart saved to: {chart_path}")
'''
        },
        {
            'name': 'PDF Report Generation',
            'script': '''
# Generate PDF report
from reportlab.pdfgen import canvas
import os

# Create PDF report
pdf_path = os.path.join(output_dir, 'report.pdf')
c = canvas.Canvas(pdf_path)
c.drawString(100, 750, f"Report generated at: {datetime.now()}")
c.drawString(100, 720, "Data processing completed successfully")
c.save()

print(f"PDF report saved to: {pdf_path}")
'''
        },
        {
            'name': 'Data Export',
            'script': '''
# Export processed data to multiple formats
import pandas as pd
import os

# Process data
df = pd.DataFrame(input_items)

# Export to different formats
csv_path = os.path.join(output_dir, 'data.csv')
excel_path = os.path.join(output_dir, 'data.xlsx')
json_path = os.path.join(output_dir, 'data.json')

df.to_csv(csv_path, index=False)
df.to_excel(excel_path, index=False)
df.to_json(json_path, orient='records', indent=2)

print(f"Data exported to: {csv_path}, {excel_path}, {json_path}")
'''
        },
        {
            'name': 'Video Processing',
            'script': '''
# Process video and create thumbnail
import cv2
import os

# Process video from input_files
for file_info in input_files:
    if file_info['mimetype'].startswith('video/'):
        video_path = file_info['temp_path']
        
        # Create thumbnail
        cap = cv2.VideoCapture(video_path)
        ret, frame = cap.read()
        
        if ret:
            thumbnail_path = os.path.join(output_dir, 'thumbnail.jpg')
            cv2.imwrite(thumbnail_path, frame)
            print(f"Thumbnail saved to: {thumbnail_path}")
        
        cap.release()
'''
        }
    ]
    
    for i, example in enumerate(examples, 1):
        print(f"\n{i}. {example['name']}:")
        print("```python")
        print(example['script'].strip())
        print("```")

if __name__ == '__main__':
    # Run the demonstration
    result = demonstrate_output_file_concept()
    
    # Show user examples
    simulate_user_script_examples()
    
    print(f"\n📊 Demo Result: {json.dumps(result, indent=2)}") 