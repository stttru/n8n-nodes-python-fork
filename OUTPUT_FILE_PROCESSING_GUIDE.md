# Output File Processing Guide v1.11.0

## Overview

The **Output File Processing** feature allows Python scripts to generate files that are automatically detected and included in n8n workflow output as binary data. This enables powerful file generation workflows including reports, charts, processed data exports, and more.

## How It Works

1. **Unique Output Directory**: n8n creates a unique temporary directory for each script execution
2. **Python Script Access**: The directory path is available as `output_dir` variable in your Python script
3. **Automatic Detection**: After script execution, n8n scans the output directory for files
4. **Binary Conversion**: Files are converted to base64 and added to the workflow output as binary data
5. **Auto-cleanup**: Temporary files and directories are automatically cleaned up

## Configuration Options

### Enable Output File Processing
- **Default**: `false`
- **Description**: Automatically detect and process files created by Python script

### Max Output File Size (MB)
- **Default**: `100`
- **Range**: 1-1000 MB
- **Description**: Maximum file size to process

### Auto-cleanup Output Directory
- **Default**: `true`
- **Description**: Automatically delete output directory and files after processing

### Include File Metadata in Output
- **Default**: `true`
- **Description**: Include file metadata (size, mimetype, etc.) in output JSON

## Python Script Usage

### Basic Example

```python
import os
import json
from datetime import datetime

# output_dir is automatically provided by n8n
print(f"Output directory: {output_dir}")

# Create a simple text report
report_path = os.path.join(output_dir, 'report.txt')
with open(report_path, 'w') as f:
    f.write(f"Report generated at: {datetime.now()}\n")
    f.write("Processing completed successfully!\n")

# Create JSON data export
data_path = os.path.join(output_dir, 'data.json')
result_data = {
    "timestamp": datetime.now().isoformat(),
    "processed_items": len(input_items),
    "status": "success"
}
with open(data_path, 'w') as f:
    json.dump(result_data, f, indent=2)

print("Files created successfully!")
```

### Advanced Examples

#### 1. Image Generation with Matplotlib

```python
import matplotlib.pyplot as plt
import os
import numpy as np

# Generate sample data
x = np.linspace(0, 10, 100)
y = np.sin(x)

# Create plot
fig, ax = plt.subplots(figsize=(10, 6))
ax.plot(x, y, 'b-', linewidth=2, label='sin(x)')
ax.set_title('Generated Chart')
ax.set_xlabel('X values')
ax.set_ylabel('Y values')
ax.legend()
ax.grid(True)

# Save to output directory
chart_path = os.path.join(output_dir, 'chart.png')
plt.savefig(chart_path, dpi=300, bbox_inches='tight')
plt.close()

print(f"Chart saved to: {chart_path}")
```

#### 2. PDF Report Generation

```python
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
import os

# Create PDF report
pdf_path = os.path.join(output_dir, 'report.pdf')
c = canvas.Canvas(pdf_path, pagesize=letter)

# Add content
c.drawString(100, 750, f"Report Generated: {datetime.now()}")
c.drawString(100, 720, f"Total Items Processed: {len(input_items)}")
c.drawString(100, 690, "Status: Processing Complete")

# Add data table
y_position = 650
for i, item in enumerate(input_items[:10]):  # First 10 items
    c.drawString(100, y_position, f"Item {i+1}: {item}")
    y_position -= 20

c.save()
print(f"PDF report saved to: {pdf_path}")
```

#### 3. Data Export to Multiple Formats

```python
import pandas as pd
import os

# Process input data
df = pd.DataFrame(input_items)

# Export to different formats
csv_path = os.path.join(output_dir, 'data.csv')
excel_path = os.path.join(output_dir, 'data.xlsx')
json_path = os.path.join(output_dir, 'data.json')

df.to_csv(csv_path, index=False)
df.to_excel(excel_path, index=False)
df.to_json(json_path, orient='records', indent=2)

print(f"Data exported to: {csv_path}, {excel_path}, {json_path}")
```

#### 4. Video Processing and Thumbnail Generation

```python
import cv2
import os

# Process video from input files
for file_info in input_files:
    if file_info['mimetype'].startswith('video/'):
        video_path = file_info['temp_path']
        
        # Create thumbnail
        cap = cv2.VideoCapture(video_path)
        ret, frame = cap.read()
        
        if ret:
            # Save thumbnail
            thumbnail_path = os.path.join(output_dir, f"thumbnail_{file_info['filename']}.jpg")
            cv2.imwrite(thumbnail_path, frame)
            print(f"Thumbnail saved: {thumbnail_path}")
            
            # Create video info file
            info_path = os.path.join(output_dir, f"info_{file_info['filename']}.txt")
            with open(info_path, 'w') as f:
                f.write(f"Original file: {file_info['filename']}\n")
                f.write(f"Size: {file_info['size']} bytes\n")
                f.write(f"Type: {file_info['mimetype']}\n")
        
        cap.release()
```

## Output Structure

When files are generated, they appear in the n8n output as:

### JSON Output
```json
{
  "script_result": "success",
  "generated_files_count": 3,
  "generated_files_info": [
    {
      "filename": "report.txt",
      "size": 143,
      "mimetype": "text/plain",
      "binary_key": "output_report.txt"
    },
    {
      "filename": "chart.png", 
      "size": 15420,
      "mimetype": "image/png",
      "binary_key": "output_chart.png"
    },
    {
      "filename": "data.json",
      "size": 215,
      "mimetype": "application/json", 
      "binary_key": "output_data.json"
    }
  ]
}
```

### Binary Data
Files are available as binary data with keys like:
- `output_report.txt`
- `output_chart.png`
- `output_data.json`

## Supported File Types

The system automatically detects MIME types for common file extensions:

| Extension | MIME Type |
|-----------|-----------|
| `.txt` | `text/plain` |
| `.json` | `application/json` |
| `.csv` | `text/csv` |
| `.html` | `text/html` |
| `.pdf` | `application/pdf` |
| `.png` | `image/png` |
| `.jpg`, `.jpeg` | `image/jpeg` |
| `.mp4` | `video/mp4` |
| `.mp3` | `audio/mpeg` |
| `.zip` | `application/zip` |
| Others | `application/octet-stream` |

## Best Practices

### 1. File Naming
- Use descriptive filenames
- Avoid special characters
- Include appropriate file extensions

### 2. File Size Management
- Monitor file sizes (default limit: 100MB)
- Compress large files when possible
- Use appropriate formats for data type

### 3. Error Handling
```python
import os

try:
    # Create output file
    output_path = os.path.join(output_dir, 'result.txt')
    with open(output_path, 'w') as f:
        f.write("Success!")
    print(f"File created: {output_path}")
except Exception as e:
    print(f"Error creating file: {e}")
```

### 4. Multiple File Generation
```python
import os

# Generate multiple related files
base_name = "analysis"
formats = ['.txt', '.json', '.csv']

for fmt in formats:
    filename = f"{base_name}{fmt}"
    filepath = os.path.join(output_dir, filename)
    
    # Create file based on format
    if fmt == '.txt':
        with open(filepath, 'w') as f:
            f.write("Text analysis results...")
    elif fmt == '.json':
        with open(filepath, 'w') as f:
            json.dump({"results": "data"}, f)
    elif fmt == '.csv':
        with open(filepath, 'w') as f:
            f.write("col1,col2\nval1,val2\n")
```

## Integration with Other Features

### Combined with Input File Processing
```python
# Process input files and generate output files
for file_info in input_files:
    # Read input file
    with open(file_info['temp_path'], 'rb') as f:
        content = f.read()
    
    # Process and save result
    processed_filename = f"processed_{file_info['filename']}"
    output_path = os.path.join(output_dir, processed_filename)
    
    # Your processing logic here
    with open(output_path, 'wb') as f:
        f.write(processed_content)
```

### With Environment Variables
```python
# Use credentials for external services
import requests

# API_KEY is available from credentials
response = requests.get(f"https://api.example.com/data?key={API_KEY}")

# Save API response
api_data_path = os.path.join(output_dir, 'api_response.json')
with open(api_data_path, 'w') as f:
    json.dump(response.json(), f, indent=2)
```

## Troubleshooting

### Common Issues

1. **Files not appearing in output**
   - Check that `output_dir` variable is used correctly
   - Verify files are created in the correct directory
   - Ensure file sizes are within limits

2. **Permission errors**
   - Make sure the output directory is writable
   - Check file permissions

3. **Large file handling**
   - Increase max file size limit if needed
   - Consider file compression
   - Split large files into smaller chunks

### Debug Example
```python
import os

print(f"Output directory: {output_dir}")
print(f"Directory exists: {os.path.exists(output_dir)}")
print(f"Directory writable: {os.access(output_dir, os.W_OK)}")

# Create test file
test_path = os.path.join(output_dir, 'test.txt')
try:
    with open(test_path, 'w') as f:
        f.write("Test file")
    print(f"Test file created successfully: {test_path}")
    print(f"File size: {os.path.getsize(test_path)} bytes")
except Exception as e:
    print(f"Error creating test file: {e}")
```

## Version History

- **v1.11.0**: Initial release of Output File Processing
  - Automatic file detection and processing
  - Support for all file types
  - Configurable size limits and cleanup options
  - Integration with existing file processing features 