# 📁 File Processing Guide - n8n Python Function (Raw) v1.10.0

## 🎯 Overview

The Python Function (Raw) node now supports **automatic processing of binary files** from previous nodes. This allows your Python scripts to directly access and process files like images, videos, audio, documents, and any other binary data.

## 🚀 Key Features

### ✅ Universal File Support
- **Any file type**: Images (PNG, JPG, GIF), Videos (MP4, AVI), Audio (MP3, WAV), Documents (PDF, DOCX), Archives (ZIP, RAR), etc.
- **No file type restrictions**: Process any binary data that n8n can handle

### ✅ Flexible Access Methods
- **Temporary Files** (recommended): Files saved to disk with full file paths
- **Base64 Content**: Direct access to base64-encoded file data
- **Both Methods**: Get both file paths and base64 data

### ✅ Smart File Management
- **Automatic cleanup**: Temporary files deleted after script execution
- **Size validation**: Configurable file size limits (1-1000 MB)
- **Metadata included**: File size, MIME type, extension, source information

## 🔧 Configuration

### Enable File Processing
1. Open the **File Processing** section in the node configuration
2. Enable **"Enable File Processing"**
3. Choose your preferred **File Access Method**:
   - **Temporary Files**: Best for large files and complex processing
   - **Base64 Content**: Good for small files and simple operations
   - **Both Methods**: Maximum flexibility

### Advanced Options
- **Max File Size**: Set limit from 1-1000 MB (default: 100 MB)
- **Include File Metadata**: Add file information to script variables
- **Auto-cleanup**: Automatically delete temporary files (recommended)

## 📝 Python Script Usage

### Basic File Access
```python
# Check if files are available
if 'input_files' in globals() and input_files:
    print(f"Found {len(input_files)} files:")
    
    for file_info in input_files:
        filename = file_info['filename']
        size_mb = file_info['size'] / (1024 * 1024)
        file_type = file_info['extension']
        
        print(f"Processing: {filename} ({size_mb:.2f}MB, type: {file_type})")
```

### Reading Files via Temporary Path (Recommended)
```python
for file_info in input_files:
    if 'temp_path' in file_info:
        file_path = file_info['temp_path']
        
        # Read binary data
        with open(file_path, 'rb') as f:
            content = f.read()
            print(f"Read {len(content)} bytes from {filename}")
        
        # For text files
        if file_info['mimetype'].startswith('text/'):
            with open(file_path, 'r', encoding='utf-8') as f:
                text_content = f.read()
                print(f"Text content: {text_content[:100]}...")
```

### Reading Files via Base64
```python
import base64

for file_info in input_files:
    if 'base64_data' in file_info:
        # Decode base64 to binary
        content = base64.b64decode(file_info['base64_data'])
        print(f"Decoded {len(content)} bytes from base64")
        
        # Save to custom location if needed
        with open(f"/custom/path/{file_info['filename']}", 'wb') as f:
            f.write(content)
```

## 🎨 Real-World Examples

### Image Processing
```python
from PIL import Image
import io

for file_info in input_files:
    if file_info['mimetype'].startswith('image/'):
        # Method 1: From temporary file
        if 'temp_path' in file_info:
            img = Image.open(file_info['temp_path'])
            width, height = img.size
            print(f"Image {file_info['filename']}: {width}x{height}")
        
        # Method 2: From base64
        elif 'base64_data' in file_info:
            import base64
            img_data = base64.b64decode(file_info['base64_data'])
            img = Image.open(io.BytesIO(img_data))
            print(f"Processed image from base64: {img.format}")
```

### Video Processing
```python
import cv2

for file_info in input_files:
    if file_info['mimetype'].startswith('video/'):
        if 'temp_path' in file_info:
            cap = cv2.VideoCapture(file_info['temp_path'])
            frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            fps = cap.get(cv2.CAP_PROP_FPS)
            duration = frame_count / fps
            
            print(f"Video {file_info['filename']}: {duration:.2f}s, {frame_count} frames")
            cap.release()
```

### Audio Processing
```python
import librosa

for file_info in input_files:
    if file_info['mimetype'].startswith('audio/'):
        if 'temp_path' in file_info:
            # Load audio file
            y, sr = librosa.load(file_info['temp_path'])
            duration = librosa.get_duration(y=y, sr=sr)
            
            print(f"Audio {file_info['filename']}: {duration:.2f}s, {sr}Hz")
```

### Document Processing
```python
import PyPDF2

for file_info in input_files:
    if file_info['mimetype'] == 'application/pdf':
        if 'temp_path' in file_info:
            with open(file_info['temp_path'], 'rb') as pdf_file:
                pdf_reader = PyPDF2.PdfReader(pdf_file)
                num_pages = len(pdf_reader.pages)
                
                # Extract text from first page
                first_page = pdf_reader.pages[0]
                text = first_page.extract_text()
                
                print(f"PDF {file_info['filename']}: {num_pages} pages")
                print(f"First page text: {text[:200]}...")
```

## 📊 File Information Structure

Each file in the `input_files` array contains:

```python
{
    "filename": "example.jpg",           # Original filename
    "mimetype": "image/jpeg",            # MIME type
    "size": 1048576,                     # File size in bytes
    "extension": "jpg",                  # File extension
    "binary_key": "attachment",          # n8n binary key
    "item_index": 0,                     # Source item index
    "temp_path": "/tmp/file123.jpg",     # Temporary file path (if enabled)
    "base64_data": "iVBORw0KGgo..."      # Base64 content (if enabled)
}
```

## ⚠️ Important Notes

### File Size Limits
- Default limit: 100 MB per file
- Maximum limit: 1000 MB per file
- Large files may impact n8n performance

### Temporary File Cleanup
- Files are automatically deleted after script execution
- Disable auto-cleanup only if you need files to persist
- Manual cleanup required if auto-cleanup is disabled

### Memory Considerations
- Base64 method loads entire file into memory
- Temporary files method is more memory-efficient for large files
- Consider your system's available RAM when processing multiple large files

## 🔧 Troubleshooting

### No Files Detected
- Ensure previous node outputs binary data
- Check that binary data has `fileName` property
- Verify "Enable File Processing" is turned on

### File Size Errors
- Increase "Max File Size" limit
- Check actual file sizes in previous node output
- Consider processing files in smaller batches

### Permission Errors
- Ensure n8n has write access to temp directory
- Check system disk space availability
- Verify file paths are accessible

## 🎉 Complete Example

```python
import json
import os
from pathlib import Path

# Process all input files
results = []

if 'input_files' in globals() and input_files:
    for file_info in input_files:
        result = {
            "filename": file_info['filename'],
            "size_mb": round(file_info['size'] / (1024 * 1024), 2),
            "type": file_info['mimetype'],
            "extension": file_info['extension']
        }
        
        # Process based on file type
        if file_info['mimetype'].startswith('image/'):
            result["category"] = "image"
            # Add image-specific processing here
            
        elif file_info['mimetype'].startswith('video/'):
            result["category"] = "video"
            # Add video-specific processing here
            
        elif file_info['mimetype'].startswith('audio/'):
            result["category"] = "audio"
            # Add audio-specific processing here
            
        else:
            result["category"] = "document"
            # Add document-specific processing here
        
        # Read file content if needed
        if 'temp_path' in file_info:
            with open(file_info['temp_path'], 'rb') as f:
                content = f.read()
                result["content_length"] = len(content)
                result["processed"] = True
        
        results.append(result)

# Output results
output = {
    "total_files": len(input_files) if 'input_files' in globals() else 0,
    "processed_files": len(results),
    "files": results
}

print(json.dumps(output, indent=2))
```

---

**🎯 Ready to process any file type in your n8n workflows!** 