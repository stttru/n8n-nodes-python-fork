# Output File Processing - Usage Guide

## 📋 Overview

Output File Processing is a functionality of the n8n Python Function (Raw) node that automatically detects and processes files created by Python scripts, converting them into n8n binary data for further use in workflows.

## ✨ Features

- 🔍 **Automatic detection** of files in the output directory
- 📁 **Multiple file support** for any file types
- 🔄 **Automatic conversion** to n8n binary data
- 🧹 **Automatic cleanup** of temporary files
- 📊 **File metadata** (size, MIME type, extension)
- ⚙️ **Flexible settings** for size and processing

## 🚀 Quick Start

### 1. Enable the functionality

In the n8n Python Function (Raw) node settings:

1. Open the **"Output File Processing"** section
2. Enable **"Enable Output File Processing"**
3. Configure parameters as needed

### 2. Basic example

```python
import os
import json

# Output directory is automatically available as the output_dir variable
# when Output File Processing is enabled

# Create a text file
with open(os.path.join(output_dir, "result.txt"), "w") as f:
    f.write("Data processing result")

# Create a JSON file
data = {"status": "success", "count": 42}
with open(os.path.join(output_dir, "data.json"), "w") as f:
    json.dump(data, f)

print(f"Files created in: {output_dir}")
```

## ⚙️ Settings

### Main parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| **Enable Output File Processing** | Enables/disables the functionality | `false` |
| **Max Output File Size (MB)** | Maximum file size for processing | `100` |
| **Auto-cleanup Output Directory** | Automatic file deletion after processing | `true` |
| **Include File Metadata in Output** | Include file metadata in the result | `true` |

### Configuration example

```json
{
  "outputFileProcessing": {
    "enabled": true,
    "maxOutputFileSize": 50,
    "autoCleanupOutput": true,
    "includeOutputMetadata": true
  }
}
```

## 📝 Usage Examples

### Creating an Excel report

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

### Generating an image

```python
import matplotlib.pyplot as plt
import os

# Create chart
plt.figure(figsize=(10, 6))
plt.plot([1, 2, 3, 4], [1, 4, 2, 3])
plt.title('Sample Chart')
plt.xlabel('X axis')
plt.ylabel('Y axis')

# Save image
chart_file = os.path.join(output_dir, "chart.png")
plt.savefig(chart_file, dpi=300, bbox_inches='tight')
plt.close()

print(f"Chart saved: {chart_file}")
```

### Creating an archive

```python
import zipfile
import os
import json

# Create several files
files_to_archive = []

# Text file
txt_file = os.path.join(output_dir, "readme.txt")
with open(txt_file, "w") as f:
    f.write("This is an archive with processing results")
files_to_archive.append(txt_file)

# JSON file
json_file = os.path.join(output_dir, "metadata.json")
with open(json_file, "w") as f:
    json.dump({"created": "2024-01-15", "version": "1.0"}, f)
files_to_archive.append(json_file)

# Create ZIP archive
zip_file = os.path.join(output_dir, "results.zip")
with zipfile.ZipFile(zip_file, 'w') as zipf:
    for file_path in files_to_archive:
        zipf.write(file_path, os.path.basename(file_path))

print(f"Archive created: {zip_file}")
```

## 📊 Result Structure

When Output File Processing is enabled, the execution result will contain:

### JSON result
```json
{
  "exitCode": 0,
  "stdout": "Files created successfully",
  "stderr": "",
  "success": true,
  "outputFiles": [
    {
      "filename": "result.txt",
      "size": 1024,
      "mimetype": "text/plain",
      "extension": "txt",
      "binaryKey": "output_result.txt"
    }
  ],
  "outputFilesCount": 1
}
```

### Binary data
```json
{
  "output_result.txt": {
    "data": "base64_encoded_content",
    "mimeType": "text/plain",
    "fileExtension": "txt",
    "fileName": "result.txt"
  }
}
```

## 🔧 Supported File Types

| Extension | MIME Type | Description |
|-----------|-----------|-------------|
| `.txt` | `text/plain` | Text files |
| `.json` | `application/json` | JSON data |
| `.csv` | `text/csv` | CSV tables |
| `.xlsx` | `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` | Excel files |
| `.pdf` | `application/pdf` | PDF documents |
| `.png` | `image/png` | PNG images |
| `.jpg` | `image/jpeg` | JPEG images |
| `.zip` | `application/zip` | ZIP archives |
| Others | `application/octet-stream` | Binary files |

## ⚠️ Limitations and Recommendations

### File size limits
- Maximum file size configurable from 1MB to 1000MB
- Default limit: 100MB
- Large files may cause memory issues in n8n

### Performance considerations
- Multiple large files can slow down workflow execution
- Consider enabling auto-cleanup to free disk space
- Monitor output directory size for long-running workflows

### Security notes
- Files are processed in temporary directories with restricted access
- Auto-cleanup is recommended for sensitive data
- Binary data is base64 encoded for safe transfer

## 🐛 Troubleshooting

### Files not detected
1. Check that Output File Processing is enabled
2. Verify files are created in the `output_dir` directory
3. Ensure file permissions allow reading
4. Check file size doesn't exceed the limit

### Memory issues
1. Reduce maximum file size limit
2. Enable auto-cleanup
3. Process fewer files at once
4. Use streaming for very large files

### Python script errors
```python
import os

# Always check if output_dir exists
if 'output_dir' not in globals():
    print("Output File Processing not enabled or output_dir not available")
else:
    print(f"Output directory: {output_dir}")
    
    # Create directory if needed (usually not necessary)
    os.makedirs(output_dir, exist_ok=True)
    
    # Your file creation code here
    pass
```

## 📚 Advanced Examples

### Processing with error handling

```python
import os
import json
import logging

try:
    # Setup logging
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger(__name__)
    
    # Process data and create files
    results = {"processed": [], "errors": []}
    
    for i, item in enumerate(input_items):
        try:
            # Process each item
            processed_data = {"id": i, "data": item}
            
            # Save individual result
            result_file = os.path.join(output_dir, f"result_{i}.json")
            with open(result_file, "w") as f:
                json.dump(processed_data, f, indent=2)
                
            results["processed"].append(f"result_{i}.json")
            logger.info(f"Processed item {i}")
            
        except Exception as e:
            error_info = {"item": i, "error": str(e)}
            results["errors"].append(error_info)
            logger.error(f"Error processing item {i}: {e}")
    
    # Save summary
    summary_file = os.path.join(output_dir, "summary.json")
    with open(summary_file, "w") as f:
        json.dump(results, f, indent=2)
    
    print(f"Processing complete. Check {summary_file} for details.")
    
except Exception as e:
    print(f"Fatal error: {e}")
    # Still try to create error report
    try:
        error_file = os.path.join(output_dir, "error_report.txt")
        with open(error_file, "w") as f:
            f.write(f"Error occurred: {e}")
    except:
        pass
```

### Batch file processing

```python
import os
import json
from datetime import datetime

# Create batch processing directory structure
batch_id = datetime.now().strftime("%Y%m%d_%H%M%S")
batch_dir = os.path.join(output_dir, f"batch_{batch_id}")
os.makedirs(batch_dir, exist_ok=True)

# Process items in batches
batch_size = 10
total_items = len(input_items)
batch_count = (total_items + batch_size - 1) // batch_size

for batch_num in range(batch_count):
    start_idx = batch_num * batch_size
    end_idx = min(start_idx + batch_size, total_items)
    batch_items = input_items[start_idx:end_idx]
    
    # Process batch
    batch_results = []
    for item in batch_items:
        # Your processing logic here
        result = {"original": item, "processed": True}
        batch_results.append(result)
    
    # Save batch results
    batch_file = os.path.join(batch_dir, f"batch_{batch_num:03d}.json")
    with open(batch_file, "w") as f:
        json.dump(batch_results, f, indent=2)

# Create batch summary
summary = {
    "batch_id": batch_id,
    "total_items": total_items,
    "batch_size": batch_size,
    "batch_count": batch_count,
    "created_at": datetime.now().isoformat()
}

summary_file = os.path.join(output_dir, "batch_summary.json")
with open(summary_file, "w") as f:
    json.dump(summary, f, indent=2)

print(f"Batch processing complete: {batch_count} batches, {total_items} items")
```

## 🎯 Best Practices

### 1. File naming
- Use descriptive, unique filenames
- Include timestamps for time-series data
- Use proper file extensions for MIME type detection

### 2. Error handling
- Always wrap file operations in try-catch blocks
- Create error reports for failed operations
- Log processing steps for debugging

### 3. Resource management
- Enable auto-cleanup for temporary files
- Monitor file sizes and counts
- Use compression for large datasets

### 4. Workflow integration
- Test file processing with small datasets first
- Use file metadata for conditional workflow logic
- Consider downstream node requirements

**Version:** 1.11.0
**Last Updated:** January 2025 