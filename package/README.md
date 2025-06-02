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

## 🔧 Variable Injection (Optional)

When enabled, two variables are automatically injected:

```python
# Available variables:
# input_items - Array of input data from previous nodes
# env_vars - Dictionary of environment variables

print(f"Received {len(input_items)} items")
print(f"Environment: {env_vars.get('NODE_ENV', 'development')}")

# Process input data
for item in input_items:
    print(f"Processing: {item}")
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
