# n8n-nodes-python-raw

An n8n community node for executing Python scripts with raw output control and advanced parsing capabilities.

This is a **fork** of [naskio/n8n-nodes-python](https://github.com/naskio/n8n-nodes-python) with significant enhancements for raw Python script execution and structured output parsing.

## ✨ Key Features

- **Raw Python Script Execution**: Execute pure Python scripts without modifications
- **Flexible Output Parsing**: Parse stdout as JSON, CSV, lines, or smart auto-detection
- **Multiple Execution Modes**: Run once for all items or once per each item
- **Pass Through Data**: Preserve and combine input data with Python results
- **Variable Injection**: Optional injection of input items and environment variables
- **Comprehensive Error Handling**: Detailed error reporting with Python traceback analysis
- **Multiple Output Formats**: Support for single/multiple JSON objects, CSV data, and text lines
- **Smart Parsing**: Automatic detection and parsing of JSON, CSV, and structured data
- **Reliable Script Management**: Guaranteed script file overwriting for fresh execution

##  Installation

In n8n, go to **Settings** → **Community Nodes** and install:

```
n8n-nodes-python-raw
```

## 🚀 Configuration Options

### Basic Settings
- **Python Code**: Multi-line Python script to execute
- **Python Executable**: Path to Python executable (default: "python3")
- **Inject Variables**: Enable/disable automatic variable injection (default: true)
- **Return Error Details**: Return error info as data instead of throwing (default: true)

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

### 🔄 Variable Behavior in Different Execution Modes

#### "Once for All Items" Mode (Default)
```python
import json

# input_items contains ALL items from previous node
print(f"Total items received: {len(input_items)}")

# Process all items together
processed_items = []
for item in input_items:
    processed_items.append({
        "original_id": item["id"],
        "processed_name": item["name"].upper(),
        "status": "processed"
    })

# Return summary of batch processing
result = {
    "batch_size": len(input_items),
    "processed_count": len(processed_items),
    "first_item": input_items[0] if input_items else None,
    "last_item": input_items[-1] if input_items else None
}
print(json.dumps(result))
```

#### "Once per Item" Mode
```python
import json

# input_items contains only ONE item (current item being processed)
current_item = input_items[0]  # Always access first (and only) item

print(f"Processing single item: {current_item}")

# Transform the current item
result = {
    "original_data": current_item,
    "transformed_name": current_item["name"].lower().replace(" ", "_"),
    "processing_timestamp": "2024-01-01T12:00:00Z",
    "item_hash": hash(str(current_item))
}
print(json.dumps(result))
```

### 🌍 Working with Environment Variables

Environment variables are available through the `env_vars` dictionary:

```python
import json
import os

# Access environment variables
api_key = env_vars.get("API_KEY", "default_key")
environment = env_vars.get("NODE_ENV", "development")
debug_mode = env_vars.get("DEBUG", "false").lower() == "true"

print(f"Running in {environment} mode")
print(f"Debug enabled: {debug_mode}")

# Use environment variables in your logic
if debug_mode:
    print("Debug info:", json.dumps(input_items, indent=2))

# Make API calls with credentials
if api_key != "default_key":
    print(f"Using API key: {api_key[:8]}...")
    # Make authenticated API call here
```

### 📊 Data Analysis Examples

#### Statistical Analysis
```python
import json
from statistics import mean, median

# Analyze numerical data from input items
values = [item.get("score", 0) for item in input_items if "score" in item]

if values:
    analysis = {
        "total_items": len(input_items),
        "items_with_scores": len(values),
        "average_score": round(mean(values), 2),
        "median_score": median(values),
        "min_score": min(values),
        "max_score": max(values),
        "score_range": max(values) - min(values)
    }
else:
    analysis = {
        "total_items": len(input_items),
        "items_with_scores": 0,
        "message": "No score data found"
    }

print(json.dumps(analysis))
```

#### Data Filtering and Transformation
```python
import json
from datetime import datetime

# Filter and transform data
filtered_items = []
current_year = datetime.now().year

for item in input_items:
    # Skip items without required fields
    if not all(key in item for key in ["name", "email", "age"]):
        continue
    
    # Filter by age
    if item["age"] < 18:
        continue
    
    # Transform and enrich data
    transformed_item = {
        "full_name": item["name"].title(),
        "email_domain": item["email"].split("@")[1],
        "age_group": "young" if item["age"] < 30 else "mature",
        "birth_year": current_year - item["age"],
        "processed_at": datetime.now().isoformat()
    }
    filtered_items.append(transformed_item)

result = {
    "original_count": len(input_items),
    "filtered_count": len(filtered_items),
    "filtered_items": filtered_items
}
print(json.dumps(result))
```

### 🔍 Data Validation and Quality Checks

```python
import json
import re

# Validate email addresses
email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'

validation_results = []
for i, item in enumerate(input_items):
    validation = {
        "item_index": i,
        "item_id": item.get("id", f"item_{i}"),
        "validations": {}
    }
    
    # Check required fields
    required_fields = ["name", "email", "age"]
    for field in required_fields:
        validation["validations"][f"{field}_present"] = field in item
        if field in item:
            validation["validations"][f"{field}_not_empty"] = bool(str(item[field]).strip())
    
    # Validate email format
    if "email" in item:
        validation["validations"]["email_format_valid"] = bool(re.match(email_pattern, item["email"]))
    
    # Validate age range
    if "age" in item:
        try:
            age = int(item["age"])
            validation["validations"]["age_numeric"] = True
            validation["validations"]["age_reasonable"] = 0 <= age <= 150
        except (ValueError, TypeError):
            validation["validations"]["age_numeric"] = False
            validation["validations"]["age_reasonable"] = False
    
    validation_results.append(validation)

# Summary statistics
total_items = len(input_items)
valid_items = sum(1 for v in validation_results if all(v["validations"].values()))

summary = {
    "total_items": total_items,
    "valid_items": valid_items,
    "invalid_items": total_items - valid_items,
    "validation_rate": round(valid_items / total_items * 100, 2) if total_items > 0 else 0,
    "detailed_results": validation_results
}

print(json.dumps(summary))
```

### 🚨 Error Handling in Scripts

```python
import json
import sys

try:
    # Your main processing logic
    results = []
    
    for item in input_items:
        try:
            # Process individual item
            processed_item = {
                "id": item["id"],
                "processed_name": item["name"].upper(),
                "status": "success"
            }
            results.append(processed_item)
            
        except KeyError as e:
            # Handle missing required fields
            error_item = {
                "id": item.get("id", "unknown"),
                "error": f"Missing required field: {e}",
                "status": "error"
            }
            results.append(error_item)
            
        except Exception as e:
            # Handle other processing errors
            error_item = {
                "id": item.get("id", "unknown"),
                "error": str(e),
                "status": "error"
            }
            results.append(error_item)
    
    # Return results with error summary
    error_count = sum(1 for r in results if r.get("status") == "error")
    
    final_result = {
        "processed_items": results,
        "summary": {
            "total": len(input_items),
            "successful": len(results) - error_count,
            "errors": error_count
        }
    }
    
    print(json.dumps(final_result))
    
    # Exit with non-zero code if there were errors (optional)
    if error_count > 0:
        sys.exit(1)  # This will set exitCode to 1
        
except Exception as e:
    # Handle fatal errors
    error_result = {
        "error": "Fatal processing error",
        "message": str(e),
        "processed_count": 0
    }
    print(json.dumps(error_result))
    sys.exit(2)  # Critical error exit code
```

### 🎛️ Using Pure Python Mode (No Variables)

When "Inject Variables" is disabled, you can run pure Python scripts:

```python
import requests
import json

# Pure Python script without n8n variables
# Perfect for standalone operations, API calls, file processing

try:
    # Make an API call
    response = requests.get("https://api.github.com/users/octocat")
    response.raise_for_status()
    
    user_data = response.json()
    
    result = {
        "username": user_data["login"],
        "name": user_data["name"],
        "public_repos": user_data["public_repos"],
        "followers": user_data["followers"],
        "created_at": user_data["created_at"]
    }
    
    print(json.dumps(result))
    
except requests.RequestException as e:
    print(f"API Error: {e}")
    exit(1)  # Non-zero exit code indicates error
```

### 💡 Best Practices

1. **Always check if data exists before processing:**
   ```python
   if not input_items:
       print(json.dumps({"error": "No input data received"}))
       sys.exit(1)
   ```

2. **Use safe data access methods:**
   ```python
   # Good: Use .get() with defaults
   name = item.get("name", "Unknown")
   age = item.get("age", 0)
   
   # Avoid: Direct access that might fail
   # name = item["name"]  # Could raise KeyError
   ```

3. **Handle different data types gracefully:**
   ```python
   # Safe type conversion
   try:
       age = int(item.get("age", 0))
   except (ValueError, TypeError):
       age = 0
   ```

4. **Use environment variables for configuration:**
   ```python
   # Use env_vars for API keys, URLs, settings
   api_url = env_vars.get("API_URL", "https://api.default.com")
   batch_size = int(env_vars.get("BATCH_SIZE", "100"))
   ```

5. **Return structured output for easier downstream processing:**
   ```python
   # Good: Structured output
   result = {
       "data": processed_items,
       "metadata": {
           "processed_at": datetime.now().isoformat(),
           "item_count": len(processed_items)
       }
   }
   ```

## 🎯 Smart Parsing Features

The Smart Auto-detect mode intelligently handles:

1. **JSON Detection**: Automatically identifies and parses JSON objects/arrays
2. **CSV Recognition**: Detects comma/tab-separated data and converts to objects
3. **Multiple Formats**: Handles mixed output with JSON embedded in text
4. **Error Recovery**: Falls back to line splitting if specialized parsing fails

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

- **v1.4.0**: Added execution modes and data pass-through capabilities
- **v1.3.0**: Added comprehensive output parsing (JSON/CSV/Lines/Smart modes)
- **v1.2.0**: Enhanced error handling and user experience
- **v1.1.0**: Added variable injection control and improved error parsing  
- **v1.0.0**: Initial fork with raw execution functionality

## 🔗 Links

- [npm Package](https://www.npmjs.com/package/n8n-nodes-python-raw)
- [Original Package](https://github.com/naskio/n8n-nodes-python)
- [n8n Community Nodes](https://docs.n8n.io/integrations/community-nodes/)
