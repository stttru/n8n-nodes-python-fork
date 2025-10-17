# Dual Outputs Architecture Guide

## Overview

Starting with v1.16.0, the Python Function node features a **dual output architecture** that automatically routes execution results based on the Python script's exit code. This eliminates the need for conditional logic in your workflows.

## How It Works

### Output Routing Logic

- **Output 1 (Success)**: Routes data when `exitCode = 0` (successful execution)
- **Output 2 (Error)**: Routes data when `exitCode ≠ 0` (errors or failures)

### Exit Code Meanings

| Exit Code | Meaning | Routes To |
|-----------|---------|-----------|
| `0` | Success | Output 1 (Success) |
| `1` | General error | Output 2 (Error) |
| `2` | Syntax error | Output 2 (Error) |
| `-2` | Timeout (v1.17.0+) | Output 2 (Error) |
| Any non-zero | Error | Output 2 (Error) |

## Workflow Design Patterns

### Pattern 1: Success/Error Handling

```
Python Function → Output 1 (Success) → Continue Processing
                → Output 2 (Error)   → Error Notification
```

**Benefits:**
- No need to check `exitCode` in subsequent nodes
- Clean separation of success and error flows
- Automatic error routing

### Pattern 2: Conditional Processing

```
Python Function → Output 1 (Success) → Process Results
                → Output 2 (Error)   → Log Error & Continue
```

### Pattern 3: Error Recovery

```
Python Function → Output 1 (Success) → Final Output
                → Output 2 (Error)   → Retry Logic → Python Function
```

## Migration from Single Output

### Before v1.16.0 (Single Output)

```javascript
// In subsequent node, you had to check exitCode
if ($json.exitCode === 0) {
    // Handle success
} else {
    // Handle error
}
```

### After v1.16.0 (Dual Outputs)

```javascript
// No conditional logic needed!
// Success data automatically goes to Output 1
// Error data automatically goes to Output 2
```

## Examples

### Example 1: Data Processing with Error Handling

**Python Script:**
```python
import sys
import json

try:
    # Process data
    result = {"processed": True, "count": len(input_data)}
    print(json.dumps(result))
    sys.exit(0)  # Success
except Exception as e:
    print(f"Error: {str(e)}")
    sys.exit(1)  # Error
```

**Workflow:**
- Output 1: Receives processed data when script succeeds
- Output 2: Receives error message when script fails

### Example 2: File Processing with Validation

**Python Script:**
```python
import os
import sys

if not os.path.exists(input_file):
    print("File not found")
    sys.exit(1)  # Error

# Process file
print("File processed successfully")
sys.exit(0)  # Success
```

**Workflow:**
- Output 1: Continues with processed file
- Output 2: Handles "file not found" error

## Best Practices

### 1. Explicit Exit Codes

Always use explicit exit codes in your Python scripts:

```python
import sys

# Good: Explicit success
if process_successful:
    sys.exit(0)
else:
    sys.exit(1)

# Avoid: Implicit exit (relies on Python's default)
# Python will exit with 0 by default, even if errors occurred
```

### 2. Error Messages

Include meaningful error messages in your output:

```python
import sys

try:
    # Your processing logic
    result = process_data()
    print(json.dumps(result))
    sys.exit(0)
except ValueError as e:
    print(f"Validation error: {str(e)}")
    sys.exit(1)
except Exception as e:
    print(f"Unexpected error: {str(e)}")
    sys.exit(2)
```

### 3. Workflow Design

Design your workflows to leverage automatic routing:

- **Success Path**: Place business logic after Output 1
- **Error Path**: Place error handling after Output 2
- **Avoid**: Checking `exitCode` in subsequent nodes

## Troubleshooting

### Common Issues

1. **Script exits with 0 but contains errors**
   - Solution: Add explicit error checking and `sys.exit(1)` for errors

2. **Unexpected routing to Error output**
   - Check: Python script's exit code
   - Verify: Error handling in your script

3. **Both outputs receive data**
   - This shouldn't happen with proper implementation
   - Check: Node configuration and execution mode

### Debug Tips

1. **Use Debug Mode**: Enable debug mode to see detailed execution information
2. **Check Logs**: Review n8n execution logs for detailed error information
3. **Test Scripts**: Use "Test Only" mode to validate script syntax

## Advanced Usage

### Custom Error Codes

You can use custom exit codes for different error types:

```python
import sys

if validation_failed:
    print("Validation failed")
    sys.exit(10)  # Custom error code

if processing_failed:
    print("Processing failed")
    sys.exit(20)  # Another custom error code

# Success
print("All good")
sys.exit(0)
```

All non-zero exit codes route to Output 2, but you can access the specific code via `$json.exitCode` in your error handling workflow.

### Timeout Handling (v1.17.0+)

When scripts timeout, they receive `exitCode = -2`:

```python
# This script might timeout if it runs too long
import time
time.sleep(600)  # 10 minutes - might exceed timeout
```

**Workflow Response:**
- Output 2 receives timeout error with `exitCode = -2`
- Error message includes timeout information

## Related Documentation

- [Timeout and Cleanup Guide](timeout-and-cleanup.md)
- [Debugging Guide](debugging.md)
- [Main README](../../README.md)
