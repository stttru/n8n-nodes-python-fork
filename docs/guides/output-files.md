# Output Files Guide

## Overview

The **Output File Processing** feature (v1.11.0+) allows Python scripts to generate files that are automatically detected and included in n8n workflow output as binary data. This enables powerful file generation workflows including reports, charts, processed data exports, and more.

## How It Works

1. **Execution Isolation**: Each script runs in a dedicated temporary directory (v1.17.0+)
2. **Python Script Access**: The directory path is available as `output_dir` variable
3. **Automatic Detection**: After script execution, n8n scans the output directory for files
4. **Binary Conversion**: Files are converted to base64 and added to workflow output
5. **Auto-cleanup**: Temporary files and directories are automatically cleaned up

## Resource Limits Integration (v1.24.0+)

### Memory Limits and File Processing
When processing large files, consider memory limits:

- **Memory Limit**: 64 MB - 100 GB (default: 512 MB)
- **File Processing**: Large files may exceed memory limits
- **Recommendation**: Process files in chunks or increase memory limit

### CPU Limits and File Generation
CPU-intensive file operations are controlled by CPU limits:

- **CPU Limit**: 1-100% of all cores (default: 50%)
- **File Generation**: Complex file operations may require more CPU
- **Recommendation**: Adjust CPU limit based on file processing complexity

### Resource-Aware File Processing
```python
import os
import sys

# Check available resources
if output_dir:
    # Process files with resource awareness
    try:
        # Large file processing
        process_large_file()
    except MemoryError:
        print("Memory limit exceeded, processing in chunks")
        process_in_chunks()
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)
```

## Configuration Options

### Enable Output File Processing
- **Default**: `false`
- **Description**: Automatically detect and process files created by Python script

### Expected Output Filename
- **Description**: Filename you expect the script to create (e.g., "report.pdf", "data.csv")
- **Purpose**: Helps with file detection and validation

### File Detection Mode
- **Ready Variable Path**: Provides `output_file_path` variable with complete file path (recommended)
- **Auto Search by Name**: Automatically finds files by filename after script execution

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

### Using Ready Variable Path Mode (Recommended)

```python
import json

# Use the provided output_file_path variable
with open(output_file_path, 'w') as f:
    json.dump({"results": "processed_data"}, f)

print("File created using ready path!")
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
c.drawString(100, 750, "Generated Report")
c.drawString(100, 700, f"Date: {datetime.now().strftime('%Y-%m-%d')}")
c.drawString(100, 650, f"Processed Items: {len(input_items)}")

# Save PDF
c.save()
print(f"PDF report created: {pdf_path}")
```

#### 3. Excel Report with Pandas

```python
import pandas as pd
import os

# Create DataFrame
data = {
    'Name': ['Alice', 'Bob', 'Charlie'],
    'Age': [25, 30, 35],
    'City': ['New York', 'London', 'Tokyo']
}
df = pd.DataFrame(data)

# Save to Excel file
output_file = os.path.join(output_dir, "report.xlsx")
df.to_excel(output_file, index=False)

print(f"Excel report created: {output_file}")
```

#### 4. Multiple Files Generation

```python
import os
import json
import csv

# Create multiple files
files_created = []

# Text report
text_file = os.path.join(output_dir, 'summary.txt')
with open(text_file, 'w') as f:
    f.write("Processing Summary\n")
    f.write("==================\n")
    f.write(f"Items processed: {len(input_items)}\n")
files_created.append(text_file)

# JSON data
json_file = os.path.join(output_dir, 'data.json')
with open(json_file, 'w') as f:
    json.dump({"processed": True, "count": len(input_items)}, f)
files_created.append(json_file)

# CSV export
csv_file = os.path.join(output_dir, 'export.csv')
with open(csv_file, 'w', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(['Item', 'Status'])
    for i, item in enumerate(input_items):
        writer.writerow([f"Item {i}", "Processed"])
files_created.append(csv_file)

print(f"Created {len(files_created)} files: {files_created}")
```

## Output Structure

When files are generated, they appear in the n8n output as binary data:

```json
{
  "exitCode": 0,
  "stdout": "Files created successfully!",
  "stderr": "",
  "success": true,
  "outputFiles": [
    {
      "filename": "report.txt",
      "mimeType": "text/plain",
      "fileExtension": ".txt",
      "data": "base64-encoded-content",
      "size": 1024
    },
    {
      "filename": "data.json",
      "mimeType": "application/json",
      "fileExtension": ".json",
      "data": "base64-encoded-content",
      "size": 512
    }
  ]
}
```

## Execution Directory Context (v1.17.0+)

With the enhanced cleanup architecture, file operations are completely isolated:

### Directory Structure
```
/tmp/n8n_python_exec_1697123456789_abc123/
├── script.py                    # Generated Python script
├── report.txt                   # Files created by script
├── data.json
├── charts/
│   └── chart.png
└── ...                         # All script-generated content
```

### Benefits
- **Complete Isolation**: Files cannot escape the execution directory
- **Automatic Cleanup**: Entire directory is removed after execution
- **Security**: No access to system files outside execution directory
- **Parallel Safety**: Multiple executions don't interfere

## Timeout Considerations

When using output file processing with long-running scripts:

### Progress Reporting
```python
import time
import sys

def generate_large_report():
    for i in range(1000):
        # Generate report section
        process_section(i)
        
        # Report progress to avoid timeout
        if i % 100 == 0:
            print(f"Report generation: {i}% complete")
            sys.stdout.flush()
        
        time.sleep(0.1)

# Generate files
generate_large_report()

# Create final files
with open(os.path.join(output_dir, 'final_report.pdf'), 'w') as f:
    f.write("Report content...")

print("Large report generation completed!")
```

### File Size Management
```python
import os

# Check available space before creating large files
def create_file_with_size_check(filename, content):
    file_path = os.path.join(output_dir, filename)
    
    # Estimate file size
    estimated_size = len(content.encode('utf-8'))
    
    if estimated_size > 50 * 1024 * 1024:  # 50MB limit
        print(f"Warning: File {filename} would be {estimated_size} bytes")
        return False
    
    with open(file_path, 'w') as f:
        f.write(content)
    
    return True

# Use size checking
if create_file_with_size_check('large_report.txt', large_content):
    print("Large file created successfully")
else:
    print("File too large, skipping creation")
```

## Best Practices

### 1. File Naming
- Use descriptive filenames
- Include timestamps for uniqueness
- Use appropriate file extensions

### 2. Error Handling
```python
import os
import sys

try:
    # Create files
    with open(os.path.join(output_dir, 'report.txt'), 'w') as f:
        f.write("Report content")
    
    print("Files created successfully")
    sys.exit(0)
    
except Exception as e:
    print(f"Error creating files: {str(e)}")
    sys.exit(1)
```

### 3. Resource Management
- Monitor file sizes
- Use progress reporting for long operations
- Handle errors gracefully

### 4. File Types
- Use appropriate MIME types
- Include file metadata when possible
- Consider file size limits

## Troubleshooting

### Common Issues

1. **Files not detected**
   - Check: Files are created in `output_dir`
   - Verify: Output File Processing is enabled
   - Debug: Use debug mode to see file detection

2. **Files too large**
   - Check: Max Output File Size setting
   - Solution: Increase limit or optimize file size
   - Alternative: Split into multiple smaller files

3. **Files not cleaned up**
   - This shouldn't happen with v1.17.0+
   - Check: Auto-cleanup setting is enabled
   - Note: Cleanup is automatic and cannot be disabled

### Debug Tips

1. **Enable Debug Mode**: See detailed file processing information
2. **Check Logs**: Review n8n execution logs
3. **Test with Small Files**: Start with simple text files
4. **Monitor Progress**: Use progress reporting for long operations

## Related Documentation

- [Timeout and Cleanup Guide](timeout-and-cleanup.md)
- [Dual Outputs Guide](dual-outputs.md)
- [Debugging Guide](debugging.md)
- [Main README](../../README.md)
