# Debugging Guide

## Overview

The Python Function node provides comprehensive debugging capabilities to help troubleshoot script execution, file processing, and workflow issues. This guide covers all debugging features and best practices.

## Debug Modes

### Available Debug Modes

| Mode | Description | Use Case |
|------|-------------|----------|
| **Off** | Normal execution without debug overhead | Production workflows |
| **Basic Debug** | Add script content and basic execution info | General debugging |
| **Full Debug** | Complete debugging with timing and environment info | Detailed troubleshooting |
| **Test Only** | Safe validation without execution | Script validation |
| **Export Script** | Full debug plus downloadable script files | Advanced debugging |

### Debug Mode Configuration

1. Open the **Debug/Test Mode** section in node configuration
2. Select your preferred debug mode
3. Configure additional debug options as needed

## Basic Debug Mode

### What It Includes

- Script content that was executed
- Basic execution information
- Input/output data structure

### Example Output

```json
{
  "exitCode": 0,
  "stdout": "Script executed successfully",
  "stderr": "",
  "success": true,
  "debug": {
    "scriptContent": "print('Hello World')",
    "executionMode": "once",
    "inputItemsCount": 1,
    "executedAt": "2025-01-17T12:00:00.000Z"
  }
}
```

### When to Use

- General script debugging
- Verifying script content
- Basic execution monitoring

## Full Debug Mode

### What It Includes

- All Basic Debug information
- Detailed timing information
- Environment variables
- Python executable path
- Execution directory information
- Variable injection details

### Example Output

```json
{
  "exitCode": 0,
  "stdout": "Script executed successfully",
  "stderr": "",
  "success": true,
  "debug": {
    "scriptContent": "print('Hello World')",
    "executionMode": "once",
    "inputItemsCount": 1,
    "executedAt": "2025-01-17T12:00:00.000Z",
    "executionTimeMs": 150,
    "pythonExecutable": "/usr/bin/python3",
    "executionDirectory": "/tmp/n8n_python_exec_1697123456789_abc123",
    "environmentVariables": {
      "PATH": "/usr/bin:/bin",
      "PYTHONPATH": ""
    },
    "injectedVariables": {
      "input_data": "sample data",
      "user_id": 123
    },
    "timeoutMinutes": 10
  }
}
```

### When to Use

- Detailed troubleshooting
- Performance analysis
- Environment issues
- Variable injection problems

## Test Only Mode

### What It Does

- Validates script syntax
- Checks variable injection
- No actual execution
- Safe for testing

### Example Output

```json
{
  "exitCode": 0,
  "stdout": "",
  "stderr": "",
  "success": true,
  "debug": {
    "scriptContent": "print('Hello World')",
    "executionMode": "once",
    "inputItemsCount": 1,
    "executedAt": "2025-01-17T12:00:00.000Z",
    "testMode": true,
    "syntaxValid": true,
    "variablesInjected": true
  }
}
```

### When to Use

- Script validation
- Syntax checking
- Safe testing
- Pre-deployment validation

## Export Script Mode

### What It Includes

- All Full Debug information
- Downloadable Python script file
- Downloadable output results file
- Complete execution package

### Generated Files

#### 1. Python Script File
- **Format**: `.py` or `.txt` (configurable)
- **Content**: Complete executable Python script
- **Filename**: `python_script_TIMESTAMP.py`

#### 2. Output Results File
- **Format**: `output_TIMESTAMP.json`
- **Content**: Complete execution results in structured JSON

### Example Output Structure

```json
{
  "exitCode": 0,
  "stdout": "Script executed successfully",
  "stderr": "",
  "success": true,
  "debug": {
    "scriptContent": "print('Hello World')",
    "executionMode": "once",
    "inputItemsCount": 1,
    "executedAt": "2025-01-17T12:00:00.000Z",
    "executionTimeMs": 150,
    "pythonExecutable": "/usr/bin/python3",
    "executionDirectory": "/tmp/n8n_python_exec_1697123456789_abc123",
    "environmentVariables": {
      "PATH": "/usr/bin:/bin"
    },
    "injectedVariables": {
      "input_data": "sample data"
    },
    "timeoutMinutes": 10,
    "exportMode": true,
    "downloadableFiles": [
      {
        "filename": "python_script_1697123456789.py",
        "type": "script",
        "size": 1024
      },
      {
        "filename": "output_1697123456789.json",
        "type": "results",
        "size": 2048
      }
    ]
  }
}
```

### When to Use

- Advanced debugging
- Sharing scripts with team
- Offline analysis
- Documentation purposes

## File Debugging Options

### Enable File Debugging

When **Enable File Debugging** is enabled, additional file processing information is included:

### Debug Input Files
- Input file processing information
- File metadata and paths
- Processing status

### Debug Output Files
- Output directory information
- File scanning details
- Detection results

### Include System Information
- System permissions
- Environment data
- Directory listings

### Include Directory Listings
- Complete directory contents
- File sizes and timestamps
- Permission information

### Example File Debug Output

```json
{
  "debug": {
    "fileDebugging": {
      "inputFiles": [
        {
          "filename": "input.txt",
          "size": 1024,
          "mimeType": "text/plain",
          "path": "/tmp/input.txt",
          "processed": true
        }
      ],
      "outputDirectory": "/tmp/n8n_python_exec_1697123456789_abc123",
      "outputFiles": [
        {
          "filename": "report.txt",
          "size": 512,
          "mimeType": "text/plain",
          "detected": true,
          "processed": true
        }
      ],
      "systemInfo": {
        "permissions": "755",
        "availableSpace": "10GB",
        "directoryListing": [
          "script.py",
          "report.txt",
          "data.json"
        ]
      }
    }
  }
}
```

## Common Debugging Scenarios

### 1. Script Execution Errors

**Problem**: Script fails with exit code 1
**Debug Steps**:
1. Enable Full Debug mode
2. Check `stderr` for error messages
3. Verify script syntax
4. Check variable injection

**Example Debug Output**:
```json
{
  "exitCode": 1,
  "stdout": "",
  "stderr": "NameError: name 'undefined_variable' is not defined",
  "success": false,
  "debug": {
    "scriptContent": "print(undefined_variable)",
    "executionTimeMs": 50,
    "error": "Script execution failed"
  }
}
```

### 2. Timeout Issues

**Problem**: Script times out
**Debug Steps**:
1. Check execution time in debug output
2. Verify timeout configuration
3. Add progress reporting to script
4. Consider script optimization

**Example Debug Output**:
```json
{
  "exitCode": -2,
  "stdout": "Processing started...",
  "stderr": "[Timeout] Process killed after 10 minutes",
  "success": false,
  "debug": {
    "executionTimeMs": 600000,
    "timeoutMinutes": 10,
    "timeoutOccurred": true
  }
}
```

### 3. File Processing Issues

**Problem**: Files not detected
**Debug Steps**:
1. Enable File Debugging
2. Check output directory path
3. Verify file creation in script
4. Check file size limits

**Example Debug Output**:
```json
{
  "debug": {
    "fileDebugging": {
      "outputDirectory": "/tmp/n8n_python_exec_1697123456789_abc123",
      "outputFiles": [],
      "directoryListing": [
        "script.py"
      ],
      "fileDetectionFailed": true,
      "reason": "No files found in output directory"
    }
  }
}
```

### 4. Variable Injection Problems

**Problem**: Variables not available in script
**Debug Steps**:
1. Enable Full Debug mode
2. Check `injectedVariables` in debug output
3. Verify variable names
4. Check input data structure

**Example Debug Output**:
```json
{
  "debug": {
    "injectedVariables": {
      "input_data": "sample data",
      "user_id": 123
    },
    "variableInjectionSuccess": true,
    "variablesCount": 2
  }
}
```

## Performance Debugging

### Execution Time Analysis

```python
import time
import sys

start_time = time.time()

# Your processing logic
for i in range(1000):
    process_item(i)
    
    # Report progress every 100 items
    if i % 100 == 0:
        elapsed = time.time() - start_time
        print(f"Processed {i} items in {elapsed:.2f} seconds")
        sys.stdout.flush()

total_time = time.time() - start_time
print(f"Total execution time: {total_time:.2f} seconds")
```

### Memory Usage Monitoring

```python
import psutil
import os

# Get current process
process = psutil.Process(os.getpid())

# Monitor memory usage
memory_info = process.memory_info()
print(f"Memory usage: {memory_info.rss / 1024 / 1024:.2f} MB")

# Your processing logic
process_data()

# Check memory after processing
memory_info = process.memory_info()
print(f"Memory usage after processing: {memory_info.rss / 1024 / 1024:.2f} MB")
```

## Best Practices

### 1. Debug Mode Selection

- **Production**: Use "Off" mode
- **Development**: Use "Basic Debug" mode
- **Troubleshooting**: Use "Full Debug" mode
- **Validation**: Use "Test Only" mode
- **Advanced**: Use "Export Script" mode

### 2. Progress Reporting

Always include progress reporting in long-running scripts:

```python
import time
import sys

def long_running_task():
    for i in range(1000):
        # Do work
        process_item(i)
        
        # Report progress
        if i % 100 == 0:
            print(f"Progress: {i}% complete")
            sys.stdout.flush()
        
        time.sleep(0.1)

long_running_task()
print("Task completed successfully")
```

### 3. Error Handling

Include comprehensive error handling:

```python
import sys
import traceback

try:
    # Your main processing logic
    result = process_data()
    print(json.dumps(result))
    sys.exit(0)
    
except Exception as e:
    # Log error details
    print(f"Error: {str(e)}")
    print(f"Traceback: {traceback.format_exc()}")
    sys.exit(1)
```

### 4. Debug Information

Include useful debug information in your output:

```python
import os
import sys
import time

# Debug information
print(f"Python version: {sys.version}")
print(f"Working directory: {os.getcwd()}")
print(f"Execution directory: {output_dir}")
print(f"Input items count: {len(input_items)}")

# Your processing logic
result = process_data()
print(f"Processing completed at: {time.strftime('%Y-%m-%d %H:%M:%S')}")
```

## Troubleshooting Checklist

### Script Execution Issues

- [ ] Check script syntax
- [ ] Verify Python executable path
- [ ] Check variable injection
- [ ] Review error messages in stderr
- [ ] Enable debug mode for details

### File Processing Issues

- [ ] Enable File Debugging
- [ ] Check output directory path
- [ ] Verify file creation
- [ ] Check file size limits
- [ ] Review directory listings

### Performance Issues

- [ ] Monitor execution time
- [ ] Check memory usage
- [ ] Add progress reporting
- [ ] Consider timeout settings
- [ ] Optimize script performance

### Environment Issues

- [ ] Check Python executable
- [ ] Verify environment variables
- [ ] Review system permissions
- [ ] Check available disk space
- [ ] Validate execution directory

## Related Documentation

- [Dual Outputs Guide](dual-outputs.md)
- [Timeout and Cleanup Guide](timeout-and-cleanup.md)
- [Output Files Guide](output-files.md)
- [Main README](../../README.md)
