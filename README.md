# n8n-nodes-python-raw

An n8n community node for executing Python scripts with raw output control and advanced parsing capabilities.

This is a **fork** of [naskio/n8n-nodes-python](https://github.com/naskio/n8n-nodes-python) with significant enhancements for raw Python script execution and structured output parsing.

## ✨ Key Features

- **Raw Python Script Execution**: Execute pure Python scripts without modifications
- **Auto-Variable Extraction**: Fields from input data automatically available as individual Python variables
- **Flexible Output Parsing**: Parse stdout as JSON, CSV, lines, or smart auto-detection
- **Multiple Execution Modes**: Run once for all items or once per each item
- **Pass Through Data**: Preserve and combine input data with Python results
- **Variable Injection**: Optional injection of input items and environment variables
- **Comprehensive Error Handling**: Detailed error reporting with Python traceback analysis
- **Debug/Test System**: 5 debug modes including safe testing and script export
- **Multiple Output Formats**: Support for single/multiple JSON objects, CSV data, and text lines
- **Smart Parsing**: Automatic detection and parsing of JSON, CSV, and structured data
- **Reliable Script Management**: Guaranteed script file overwriting for fresh execution

## 📦 Installation

In n8n, go to **Settings** → **Community Nodes** and install:

```
n8n-nodes-python-raw
```

## 🚀 Quick Start Example

**Input data from previous node:**
```json
[{"title": "My Video", "duration": 120, "author": "John"}]
```

**Your Python code:**
```python
# Variables automatically extracted from input:
print(f"Processing: {title}")        # "My Video"
print(f"Duration: {duration} sec")   # 120 sec  
print(f"Author: {author}")           # "John"

# Original data still available:
print(f"Items count: {len(input_items)}")  # 1
```

**Result:** Direct access to your data without complex indexing!

## 🚀 Configuration Options

### Basic Settings
- **Python Code**: Multi-line Python script to execute
- **Python Executable**: Path to Python executable (default: "python3")
- **Inject Variables**: Enable/disable automatic variable injection (default: true)
- **Return Error Details**: Return error info as data instead of throwing (default: true)

### Error Handling (New in v1.5.0)
- **Return Error Details** (default): Continue execution and return error information as output data
- **Throw Error on Non-Zero Exit**: Stop workflow execution if script exits with non-zero code
- **Ignore Exit Code**: Continue execution regardless of exit code, only throw on system errors

### Debug/Test Mode (New in v1.6.0)
- **Off** (default): Normal execution without debug information
- **Basic Debug**: Add script content and basic execution info to output
- **Full Debug**: Add script content, metadata, timing, and detailed execution info
- **Test Only**: Validate script and show preview without executing (safe testing)
- **Export Script**: Full debug information plus script file as binary attachment

### Execution Control (New in v1.4.0)
- **Execution Mode**: Choose how to run the script:
  - **Once for All Items**: Execute script once with all input items (faster, default)
  - **Once per Item**: Execute script separately for each input item (more flexible)

### Data Management (New in v1.4.0)
- **Pass Through Input Data**: Include original input data in output (default: false)
- **Pass Through Mode**: How to combine input with results:
  - **Merge with Result**: Add input fields directly to result object
  - **Separate Field**: Add input data as "inputData" field
  - **Multiple Outputs**: Return separate items for input and result

### Output Parsing (v1.3.0)
- **Parse Output**: Choose how to parse stdout:
  - **None (Raw String)**: Return stdout as plain text
  - **JSON**: Parse as JSON object(s)
  - **Lines**: Split into array of lines
  - **Smart Auto-detect**: Automatically detect and parse JSON/CSV/text

### Parse Options (Advanced)
- **Handle Multiple JSON Objects**: Parse multiple JSON objects separated by newlines
- **Strip Non-JSON Text**: Remove text before/after JSON content
- **Fallback on Parse Error**: Keep original stdout if parsing fails

## 📊 Output Structure

The node returns a comprehensive result object:

```json
{
  "exitCode": 0,
  "stdout": "raw output string",
  "stderr": "error messages",
  "success": true,
  "error": null,
  "inputItemsCount": 1,
  "executedAt": "2024-01-01T12:00:00.000Z",
  "injectVariables": true,
  "parseOutput": "json",
  
  // Parsing results (when enabled)
  "parsed_stdout": {"key": "value"}, 
  "parsing_success": true,
  "parsing_error": null,
  "output_format": "json",
  "parsing_method": "json",
  
  // Error details (on failure)
  "pythonError": {
    "errorType": "ImportError",
    "errorMessage": "No module named 'requests'",
    "missingModules": ["requests"],
    "traceback": "full traceback",
    "lineNumber": 5
  },
  "detailedError": "comprehensive error description"
}
```

## 💡 Usage Examples

### JSON Output with Parsing
```python
import json

data = {
    "users": 150,
    "active": 42,
    "metrics": [
        {"cpu": 45.2},
        {"memory": 68.1}
    ]
}
print(json.dumps(data))
```

**Configuration**: Parse Output = "JSON"
**Result**: Access structured data via `parsed_stdout` field

### Per-Item Processing (New in v1.4.0)
```python
import json

# This script runs once for each input item
# input_items will contain only the current item

current_item = input_items[0]  # Always one item in per-item mode
result = {
    "original_id": current_item.get("id"),
    "processed": True,
    "timestamp": "2024-01-01T12:00:00Z"
}
print(json.dumps(result))
```

**Configuration**: 
- Execution Mode = "Once per Item"
- Parse Output = "JSON"
- Pass Through Input Data = true

**Result**: Each input item gets processed separately with its own result

### Data Pass-Through with Merge (New in v1.4.0)
```python
import json

# Process all items and return summary
summary = {
    "total_processed": len(input_items),
    "status": "completed",
    "processing_time": 0.5
}
print(json.dumps(summary))
```

**Configuration**:
- Pass Through Input Data = true
- Pass Through Mode = "Merge with Result"

**Result**: Original input fields are merged directly into the result object

### Multiple Outputs Mode (New in v1.4.0)
```python
import json

analysis = {
    "trend": "increasing",
    "confidence": 0.95,
    "recommendations": ["action1", "action2"]
}
print(json.dumps(analysis))
```

**Configuration**:
- Pass Through Input Data = true
- Pass Through Mode = "Multiple Outputs"

**Result**: Returns both the Python analysis result AND the original input items as separate output items

### CSV Data Generation
```python
print("Name,Age,City,Score")
print("Alice,25,New York,95.5")
print("Bob,30,London,87.2")
print("Charlie,35,Tokyo,92.0")
```

**Configuration**: Parse Output = "Smart Auto-detect"
**Result**: Automatically parsed as array of objects with headers as keys

### Multiple JSON Objects
```python
objects = [
    {"id": 1, "name": "Item 1"},
    {"id": 2, "name": "Item 2"},
    {"id": 3, "name": "Item 3"}
]
for obj in objects:
    print(json.dumps(obj))
```

**Configuration**: Parse Output = "JSON", Handle Multiple JSON Objects = true
**Result**: Array of parsed objects in `parsed_stdout`

### Mixed Output with Smart Parsing
```python
print("Processing started...")
print("Status: OK")

result = {"processed": 500, "errors": 0}
print(json.dumps(result))

print("Done!")
```

**Configuration**: Parse Output = "Smart Auto-detect", Strip Non-JSON Text = true
**Result**: Only the JSON object is parsed, other text is filtered out

## 🔧 Working with Input Variables

### Variable Injection Overview

When "Inject Variables" is enabled (default), the node automatically injects two powerful variables into your Python script:

- **`input_items`**: Array containing input data from previous n8n nodes
- **`env_vars`**: Dictionary of environment variables (from credentials or system)

### 📋 Understanding input_items Structure

The `input_items` variable contains an array of data objects from the previous node in your workflow:

```python
# input_items structure:
[
  {"id": 1, "name": "John", "email": "john@example.com"},
  {"id": 2, "name": "Jane", "email": "jane@example.com"},
  {"id": 3, "name": "Bob", "email": "bob@example.com"}
]
```

### 🔄 Execution Mode Behavior

The content of `input_items` depends on your execution mode:

#### **Variable Auto-Extraction (New in v1.6.1)**

For convenience, fields from the **first input item** are automatically extracted as individual variables:

```python
# Your input data:
[{"title": "My Video", "path": "/videos/video1.mp4", "duration": 120}]

# Automatically available variables:
title = "My Video"
path = "/videos/video1.mp4" 
duration = 120

# Original data still available:
input_items = [{"title": "My Video", "path": "/videos/video1.mp4", "duration": 120}]
```

**Benefits:**
- **Direct access**: Use `title` instead of `input_items[0]['title']`
- **Cleaner code**: More readable Python scripts
- **Backward compatible**: `input_items` still works as before
- **Safe naming**: Invalid Python identifiers are converted (e.g., `video-name` → `video_name`)

#### **Once for All Items** (Default - Faster)
- `input_items` contains **all** input data as an array
- Script runs **once** with access to all items
- Ideal for: aggregations, batch processing, summary reports

```python
import json

print(f"Processing {len(input_items)} items total")

# Example: Count by category
categories = {}
for item in input_items:
    category = item.get('category', 'unknown')
    categories[category] = categories.get(category, 0) + 1

result = {
    "total_items": len(input_items),
    "categories": categories,
    "processed_at": "2024-01-01T12:00:00Z"
}
print(json.dumps(result))
```

#### **Once per Item** (More Flexible)
- `input_items` contains **only one item** as an array `[current_item]`
- Script runs **separately** for each input item
- Ideal for: individual processing, API calls per item, complex transformations

```python
import json

# input_items always has exactly one item in per-item mode
current_item = input_items[0]

print(f"Processing individual item: {current_item.get('id')}")

# Example: Enrich individual item
enriched_item = {
    "original_id": current_item.get("id"),
    "processed_name": current_item.get("name", "").upper(),
    "status": "processed",
    "timestamp": "2024-01-01T12:00:00Z"
}
print(json.dumps(enriched_item))
```

### 🌍 Working with env_vars

The `env_vars` variable provides access to environment variables:

```python
import json

# Access environment variables
api_key = env_vars.get('API_KEY', 'default_key')
environment = env_vars.get('NODE_ENV', 'development')
debug_mode = env_vars.get('DEBUG', 'false').lower() == 'true'

print(f"Running in {environment} mode")
if debug_mode:
    print(f"Available env vars: {list(env_vars.keys())}")

# Use in API calls
config = {
    "api_endpoint": env_vars.get('API_URL', 'https://api.example.com'),
    "timeout": int(env_vars.get('TIMEOUT', '30')),
    "retries": int(env_vars.get('RETRIES', '3'))
}
print(json.dumps(config))
```

### 🔍 Data Inspection Examples

#### Basic Data Exploration
```python
import json

print("=== INPUT DATA ANALYSIS ===")
print(f"Total items: {len(input_items)}")
print(f"Environment variables: {len(env_vars)}")

if input_items:
    first_item = input_items[0]
    print(f"First item keys: {list(first_item.keys())}")
    print(f"Sample item: {json.dumps(first_item, indent=2)}")

print(f"Environment keys: {list(env_vars.keys())}")
```

#### Advanced Data Processing
```python
import json
from collections import Counter

# Analyze data structure
all_keys = set()
data_types = {}

for item in input_items:
    all_keys.update(item.keys())
    for key, value in item.items():
        if key not in data_types:
            data_types[key] = set()
        data_types[key].add(type(value).__name__)

# Generate report
report = {
    "summary": {
        "total_items": len(input_items),
        "unique_fields": len(all_keys),
        "execution_mode": "once" if len(input_items) > 1 else "per_item"
    },
    "schema": {
        field: list(types) for field, types in data_types.items()
    },
    "sample_data": input_items[:3] if input_items else []
}

print(json.dumps(report, indent=2))
```

#### Using Auto-Extracted Variables (New in v1.6.1)
```python
import json

# Direct access to fields from first input item
# No need for input_items[0]['field_name'] anymore!

print(f"Processing: {title}")
print(f"File path: {sftp_path_episode_completed}")
print(f"Description length: {len(description)} characters")

# Clean and process the data
processed_data = {
    "video_title": title.strip(),
    "file_location": sftp_path_episode_completed,
    "short_description": description[:100] + "..." if len(description) > 100 else description,
    "tag_list": tags.split(",") if isinstance(tags, str) else tags,
    "processing_timestamp": "2024-01-01T12:00:00Z"
}

print(json.dumps(processed_data, indent=2, ensure_ascii=False))
```

### 🚀 Real-World Use Cases

#### 1. API Integration with Error Handling
```python
import json
import urllib.request
import urllib.error

api_key = env_vars.get('API_KEY')
if not api_key:
    print(json.dumps({"error": "API_KEY not found in environment"}))
    exit(1)

results = []
for item in input_items:
    try:
        # Make API call
        url = f"https://api.example.com/users/{item.get('id')}"
        headers = {'Authorization': f'Bearer {api_key}'}
        
        # Simulate API call result
        enriched_data = {
            "original": item,
            "api_status": "success",
            "enriched_at": "2024-01-01T12:00:00Z"
        }
        results.append(enriched_data)
        
    except Exception as e:
        results.append({
            "original": item,
            "api_status": "error",
            "error": str(e)
        })

print(json.dumps({"processed": len(results), "results": results}))
```

#### 2. Data Validation and Cleaning
```python
import json
import re

email_pattern = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
required_fields = ['name', 'email']

valid_items = []
invalid_items = []

for item in input_items:
    errors = []
    
    # Check required fields
    for field in required_fields:
        if not item.get(field):
            errors.append(f"Missing required field: {field}")
    
    # Validate email format
    email = item.get('email', '')
    if email and not email_pattern.match(email):
        errors.append("Invalid email format")
    
    if errors:
        invalid_items.append({"item": item, "errors": errors})
    else:
        # Clean and normalize data
        cleaned_item = {
            "id": item.get('id'),
            "name": item.get('name', '').strip().title(),
            "email": item.get('email', '').strip().lower(),
            "validated_at": "2024-01-01T12:00:00Z"
        }
        valid_items.append(cleaned_item)

result = {
    "validation_summary": {
        "total_processed": len(input_items),
        "valid_count": len(valid_items),
        "invalid_count": len(invalid_items)
    },
    "valid_items": valid_items,
    "invalid_items": invalid_items
}

print(json.dumps(result))
```

#### 3. Conditional Processing Based on Environment
```python
import json

environment = env_vars.get('NODE_ENV', 'development')
debug_enabled = env_vars.get('DEBUG', 'false').lower() == 'true'

if debug_enabled:
    print(f"Debug: Processing {len(input_items)} items in {environment} mode")

# Different processing based on environment
if environment == 'production':
    # Production: process all items
    processed_items = []
    for item in input_items:
        processed_items.append({
            "id": item.get('id'),
            "status": "processed",
            "environment": "production"
        })
    print(json.dumps({"items": processed_items}))
    
elif environment == 'development':
    # Development: process only first 5 items
    limited_items = input_items[:5]
    if debug_enabled:
        print(f"Debug: Limited to {len(limited_items)} items for development")
    
    print(json.dumps({
        "message": "Development mode - limited processing",
        "processed_count": len(limited_items),
        "total_available": len(input_items)
    }))
    
else:
    print(json.dumps({"error": f"Unknown environment: {environment}"}))
```

### 💡 Best Practices

1. **Always check data availability**:
   ```python
   if not input_items:
       print(json.dumps({"warning": "No input data received"}))
       exit(0)
   ```

2. **Handle missing fields gracefully**:
   ```python
   name = item.get('name', 'Unknown')
   email = item.get('email', '')
   ```

3. **Use environment variables for configuration**:
   ```python
   batch_size = int(env_vars.get('BATCH_SIZE', '100'))
   timeout = int(env_vars.get('TIMEOUT', '30'))
   ```

4. **Always output valid JSON for parsing**:
   ```python
   import json
   result = {"status": "success", "data": processed_data}
   print(json.dumps(result))
   ```

5. **Log important information for debugging**:
   ```python
   if env_vars.get('DEBUG', '').lower() == 'true':
       print(f"Debug: Processing item {item.get('id')}", file=sys.stderr)
   ```

## 🎯 Smart Parsing Features

The Smart Auto-detect mode intelligently handles:

1. **JSON Detection**: Automatically identifies and parses JSON objects/arrays
2. **CSV Recognition**: Detects comma/tab-separated data and converts to objects
3. **Multiple Formats**: Handles mixed output with JSON embedded in text
4. **Error Recovery**: Falls back to line splitting if specialized parsing fails

## 🔧 Debug and Testing Features (New in v1.6.0)

### Debug Modes Overview

The Debug/Test Mode option provides comprehensive debugging and testing capabilities for Python script development:

#### **Off** (Default)
- Normal execution without additional debug overhead
- Minimal output for production workflows
- Best performance

#### **Basic Debug**
```json
{
  "exitCode": 0,
  "stdout": "Hello World",
  "stderr": "",
  "success": true,
  "script_content": "print('Hello World')",
  "execution_command": "python3 /tmp/script_abc123.py"
}
```

#### **Full Debug**
```json
{
  "exitCode": 0,
  "stdout": "Hello World", 
  "stderr": "",
  "success": true,
  "script_content": "print('Hello World')",
  "execution_command": "python3 /tmp/script_abc123.py",
  "debug_info": {
    "script_path": "/tmp/script_abc123.py",
    "timing": {
      "script_created_at": "2024-01-01T12:00:00.000Z",
      "execution_started_at": "2024-01-01T12:00:00.100Z", 
      "execution_finished_at": "2024-01-01T12:00:00.250Z",
      "total_duration_ms": 150
    },
    "environment_check": {
      "python_executable_found": true,
      "python_version_output": "3.11.2 (main, Mar 13 2023...)",
      "python_path_resolved": "python3"
    },
    "syntax_validation": {
      "is_valid": true
    },
    "injected_data": {
      "input_items": [...],
      "env_vars": {...}
    }
  }
}
```

#### **Test Only**
- **Safe validation** without script execution
- **Syntax checking** using Python AST parser
- **Environment verification** (Python executable, version)
- **Data preview** showing what would be injected
- **No side effects** - perfect for testing in production environments

```json
{
  "exitCode": null,
  "stdout": "",
  "stderr": "",
  "success": null,
  "test_mode": true,
  "execution_skipped": true,
  "validation_only": true,
  "script_content": "print('Hello World')",
  "debug_info": {
    "syntax_validation": {
      "is_valid": true
    },
    "environment_check": {
      "python_executable_found": true,
      "python_version_output": "3.11.2..."
    }
  }
}
```

#### **Export Script** 
- **All Full Debug information** 
- **Plus binary script file** as downloadable attachment
- **Timestamped filenames** for easy identification
- **Error-specific naming** (e.g., `python_script_error_2024-01-01T12-00-00.py`)

### Debug Features in Detail

#### **Script Content Access**
- **Exact script source** that was executed
- **With or without** variable injection
- **Helpful for troubleshooting** unexpected behavior

#### **Execution Timing**
- **Script creation time**
- **Execution start/finish timestamps** 
- **Total duration in milliseconds**
- **Performance profiling** for optimization

#### **Environment Validation**
- **Python executable detection**
- **Version information** 
- **Path resolution verification**
- **Dependency checking** capabilities

#### **Syntax Validation** 
- **Pre-execution syntax checking** using Python AST
- **Line number reporting** for syntax errors
- **Error type identification**
- **Safe validation** without code execution

#### **Binary Script Export**
- **Download .py files** directly from n8n interface
- **Inspect generated scripts** in your IDE
- **Share scripts** with team members
- **Archive successful scripts** for reuse

### Use Cases for Debug Modes

#### **Development Workflow**
```javascript
1. Start with "Test Only" - validate syntax and environment
2. Switch to "Basic Debug" - check script content and commands  
3. Use "Full Debug" - analyze timing and detailed execution info
4. Export scripts with "Export Script" - save working versions
5. Deploy with "Off" - optimal production performance
```

#### **Troubleshooting Problems**
```javascript
// Problem: Script works locally but fails in n8n
✅ Use "Full Debug" to compare:
   - Environment differences (Python version, paths)
   - Input data structure (injected_data field)
   - Execution timing and performance

// Problem: Syntax errors in generated scripts  
✅ Use "Test Only" to validate:
   - Python syntax without execution
   - Environment setup
   - Variable injection preview

// Problem: Need to inspect exact executed script
✅ Use "Export Script" to:
   - Download actual .py file
   - Debug in external Python IDE
   - Share with team for review
```

#### **Performance Analysis**
```javascript
// Analyze execution performance
✅ Use "Full Debug" timing info:
   - Script creation overhead
   - Execution duration
   - Total processing time
   - Compare "Once" vs "Per Item" modes
```

### Debug Mode Examples

#### Testing Script Syntax
```python
# Enable "Test Only" mode to safely validate:
import json
import requests  # Will be validated for syntax

data = {"test": True}
print(json.dumps(data))

# Result: Shows syntax validation without execution
# Safe to test in production workflows
```

#### Performance Profiling
```python
# Enable "Full Debug" to measure performance:
import time

start_time = time.time()
# Your processing logic here
for item in input_items:
    time.sleep(0.1)  # Simulate processing
    
print(f"Processed {len(input_items)} items")

# Result: Get exact timing metrics in debug_info
```

#### Script Inspection
```python
# Enable "Export Script" to download and inspect:
complex_logic = """
def process_data(items):
    return [item for item in items if item.get('active')]

result = process_data(input_items)
print(len(result))
"""

exec(complex_logic)

# Result: Download exact executed script with all injected variables
```

## 🆚 Differences from Original Package

This fork provides several enhancements over the original `n8n-nodes-python`:

| Feature | Original | This Fork (Raw) |
|---------|----------|-----------------|
| Execution Model | Item-by-item processing | Single script execution |
| Output Control | Transformed items only | Full stdout/stderr/exitCode |
| Output Parsing | None | JSON/CSV/Lines/Smart modes |
| Error Handling | Basic error throwing | Detailed error analysis |
| Variable Injection | Always enabled | Optional configuration |
| Python Dependencies | Required python-fire | No external dependencies |
| Multiple JSON | Not supported | Full support with options |
| CSV Parsing | Not supported | Automatic detection & parsing |

## 📄 License

Apache License 2.0 with Commons Clause - see [LICENSE](LICENSE.md)

## 🤝 Contributing

This is a community-maintained fork. Contributions welcome!

## 📝 Version History

- **v1.6.2**: Documentation update with complete Auto-Variable Extraction examples
- **v1.6.1**: Fixed `from __future__` imports + Auto-Variable Extraction feature
- **v1.6.0**: Added comprehensive Debug/Test system with script export and syntax validation
- **v1.5.0**: Enhanced error handling and comprehensive variable documentation
- **v1.4.0**: Added execution modes and data pass-through capabilities
- **v1.3.0**: Added comprehensive output parsing (JSON/CSV/Lines/Smart modes)
- **v1.2.0**: Enhanced error handling and user experience
- **v1.1.0**: Added variable injection control and improved error parsing  
- **v1.0.0**: Initial fork with raw execution functionality

## 🔗 Links

- [npm Package](https://www.npmjs.com/package/n8n-nodes-python-raw)
- [Original Package](https://github.com/naskio/n8n-nodes-python)
- [n8n Community Nodes](https://docs.n8n.io/integrations/community-nodes/)

## 🎯 Smart Parsing Features
