# Debugging Guide

## Overview

The Python Function node provides comprehensive debugging capabilities to help troubleshoot script execution, file processing, and workflow issues. This guide covers all debugging features and best practices.

## Debug Modes (v1.20.0+)

### Available Debug Modes

| Mode | Description | Use Case |
|------|-------------|----------|
| **Off** | Production mode - normal execution without debug overhead | Production workflows |
| **🔬 Full Debug+** | Developer mode - comprehensive diagnostics with system info, Python environment, and file export | Advanced troubleshooting, development, issue reporting |

**Note**: Debug modes were simplified from 5 modes to 2 modes in v1.20.0 for better clarity and reduced complexity.

### Debug Mode Configuration

1. Open the **Debug/Test Mode** section in node configuration
2. Select your preferred debug mode:
   - **Off**: For production use
   - **🔬 Full Debug+**: For development and troubleshooting
3. Configure additional options:
   - **Hide Variable Values**: Protect sensitive data in exported files

## Off Mode (Production)

### What It Includes

- Normal script execution
- Basic success/error routing
- No debug overhead
- Minimal output information

### Example Output

```json
{
  "exitCode": 0,
  "stdout": "Script executed successfully",
  "stderr": "",
  "success": true,
  "inputItemsCount": 1,
  "executedAt": "2025-01-17T12:00:00.000Z"
}
```

### When to Use

- Production workflows
- Performance-critical applications
- When debug information is not needed

## 🔬 Full Debug+ Mode (v1.19.0+)

### What It Includes

- **System Diagnostics**: OS, Node.js, n8n, Python environment details
- **Node Installation**: Package version, installation path, configuration
- **Data Sources**: Input variables, credentials, system environment status
- **Script Generation**: User code analysis, template info, assembled script
- **Execution Details**: Preparation, command, timing, results, cleanup
- **Resource Limits**: Memory and CPU limit information
- **Error Information**: Complete error details with troubleshooting hints
- **File Export**: Python script and diagnostics JSON as binary attachments

### Example Output

```json
{
  "exitCode": 0,
  "stdout": "Script executed successfully",
  "stderr": "",
  "success": true,
  "full_debug_plus": {
    "mode": "full_plus",
    "timestamp_start": "2025-10-17T17:00:31.481Z",
    "timestamp_end": "2025-10-17T17:00:43.700Z",
    "total_duration_ms": 12219,
    "system": {
      "os": {
        "platform": "linux",
        "release": "6.8.0-85-generic",
        "arch": "x64",
        "cpus_count": 30,
        "total_memory_mb": 29362
      },
      "python": {
        "version": "Python 3.12.11",
        "installed_packages": ["numpy==2.3.2", "pandas==2.3.2", "..."]
      }
    },
    "execution": {
      "resource_limits": {
        "memory_limit_mb": 512,
        "cpu_limit_percent": 50,
        "cpu_cores_total": 30
      },
      "timing": {
        "execution_duration_ms": 17590
      }
    },
    "troubleshooting_hints": [
      "✓ Script executed successfully",
      "✓ All temporary files cleaned up",
      "✓ Resource limits applied correctly"
    ]
  }
}
```

### When to Use

- **Troubleshooting**: When scripts fail unexpectedly
- **Development**: Testing new Python code
- **Issue Reporting**: Providing complete diagnostic information
- **Performance Analysis**: Understanding resource usage
- **System Analysis**: Understanding environment setup

### File Export

Full Debug+ automatically exports files as binary attachments:

- **Script File**: `full_debug_plus_script_TIMESTAMP.py` - Complete executable Python script
- **Diagnostics File**: `full_debug_plus_diagnostics_TIMESTAMP.json` - Complete diagnostic information

## Resource Limits Diagnostics (v1.24.0+)

### Memory Limit Information

```json
{
  "execution": {
    "resource_limits": {
      "memory_limit_mb": 512,
      "wrapper_script_used": true,
      "platform": "linux"
    },
    "result": {
      "exit_code": 137,
      "timed_out": false,
      "killed": false
    }
  }
}
```

**Exit Code 137**: Indicates script exceeded memory limit (MemoryError)

### CPU Limit Information

```json
{
  "execution": {
    "resource_limits": {
      "cpu_limit_percent": 50,
      "cpu_cores_total": 30,
      "cpu_time_multiplier": 15,
      "cpu_time_seconds": 9000
    }
  }
}
```

**CPU Calculation**: `cpuTimeSeconds = timeoutMinutes × 60 × (cpuCores × cpuLimitPercent / 100)`

## Exit Codes

| Exit Code | Meaning | Description |
|-----------|---------|-------------|
| 0 | Success | Script completed successfully |
| 1 | Error | Script failed with error |
| 137 | Memory Limit | Script exceeded memory limit (v1.24.0+) |
| -2 | Timeout | Script exceeded execution timeout |

## Troubleshooting Common Issues

### Script Execution Failures

#### NameError: name 'variable' is not defined
```python
# Problem: Variable not available
print(f"Value: {undefined_variable}")

# Solution: Check if variable exists
if 'undefined_variable' in globals():
    print(f"Value: {undefined_variable}")
else:
    print("Variable not defined")
```

#### ImportError: No module named 'module'
```python
# Problem: Module not installed
import non_existent_module

# Solution: Check module availability
try:
    import non_existent_module
except ImportError:
    print("Module not available, using alternative")
    # Alternative implementation
```

#### MemoryError
```python
# Problem: Script exceeds memory limit
big_data = bytearray(5 * 1024 * 1024 * 1024)  # 5 GB

# Solution: Process data in chunks
def process_large_data(data, chunk_size=1000):
    for i in range(0, len(data), chunk_size):
        chunk = data[i:i+chunk_size]
        # Process chunk
        yield process_chunk(chunk)
```

### Data Source Issues

#### Input Variables Not Available
```python
# Problem: input_items is empty
if not input_items:
    print("No input data received")
    print("Check 'Include Input Variables' setting")
```

#### Credentials Not Injected
```python
# Problem: env_vars is empty
if not env_vars:
    print("No credentials available")
    print("Check 'Include Credential Variables' setting")
    print("Verify credential is connected and filled")
```

#### System Environment Not Available
```python
# Problem: System environment variables not accessible
import os
if 'CUSTOM_ENV_VAR' not in os.environ:
    print("System environment variable not found")
    print("Check 'Include System Environment' setting")
```

### File Processing Issues

#### Output Files Not Detected
```python
# Problem: Files not included in output
import os

# Solution: Use correct path
if output_dir:
    file_path = os.path.join(output_dir, "output.txt")
    with open(file_path, 'w') as f:
        f.write("Content")
    print(f"File created: {file_path}")
else:
    print("Output directory not available")
    print("Enable 'Output File Processing'")
```

#### Input Files Not Accessible
```python
# Problem: input_files is empty
if not input_files:
    print("No input files available")
    print("Check 'File Processing' settings")
    print("Verify files are passed from previous node")
```

## Best Practices

### Security Considerations

#### Hide Sensitive Data
```python
# Safe way to log credentials
if env_vars:
    safe_vars = {k: "***" if "key" in k.lower() or "password" in k.lower() else v 
                 for k, v in env_vars.items()}
    print(f"Available variables: {safe_vars}")
```

#### Enable Hide Variable Values
- Always enable "Hide Variable Values" in production
- Prevents sensitive data from appearing in exported files
- Replaces sensitive values with `***hidden***`

### Performance Optimization

#### Use Appropriate Debug Mode
- **Off**: For production (no overhead)
- **Full Debug+**: For development (comprehensive info)

#### Monitor Resource Usage
```python
import sys
import resource

# Check memory usage
memory_usage = resource.getrusage(resource.RUSAGE_SELF).ru_maxrss
print(f"Memory usage: {memory_usage} KB")

# Check available memory
available_memory = psutil.virtual_memory().available
print(f"Available memory: {available_memory / 1024 / 1024:.1f} MB")
```

### Error Handling

#### Comprehensive Error Handling
```python
import sys
import traceback

try:
    # Your code here
    result = process_data()
    print(f"Result: {result}")
    
except MemoryError as e:
    print(f"Memory error: {e}")
    print("Consider increasing memory limit or optimizing code")
    sys.exit(137)
    
except Exception as e:
    print(f"Error: {e}")
    traceback.print_exc()
    sys.exit(1)
```

#### Graceful Degradation
```python
# Try multiple approaches
def safe_process_data():
    try:
        # Primary approach
        return process_with_pandas()
    except ImportError:
        try:
            # Fallback approach
            return process_with_builtin()
        except Exception as e:
            print(f"All approaches failed: {e}")
            return None
```

## Debugging Workflow

### Step-by-Step Debugging Process

1. **Enable Full Debug+**: Set debug mode to Full Debug+
2. **Reproduce Issue**: Run the failing workflow
3. **Analyze Output**: Review Full Debug+ diagnostics
4. **Check Exit Code**: Understand the failure type
5. **Review Script**: Examine the executed script
6. **Verify Environment**: Check Python and system environment
7. **Test Locally**: Run script outside n8n if needed
8. **Fix and Retest**: Apply fixes and verify resolution

### Common Debugging Scenarios

#### Script Syntax Errors
```python
# Problem: Syntax error
if condition:
print("This will fail")  # Missing indentation

# Solution: Check syntax
if condition:
    print("This will work")  # Proper indentation
```

#### Logic Errors
```python
# Problem: Logic error
if input_items:
    for item in input_items:
        process_item(item)
# Missing else clause

# Solution: Add proper error handling
if input_items:
    for item in input_items:
        process_item(item)
else:
    print("No input items to process")
```

#### Resource Issues
```python
# Problem: Resource exhaustion
def process_large_dataset():
    data = load_huge_dataset()  # May exceed memory limit
    return process_all_at_once(data)

# Solution: Process in chunks
def process_large_dataset():
    for chunk in load_dataset_chunks():
        yield process_chunk(chunk)
```

## Getting Help

### Information to Provide

When seeking help, provide:

1. **Full Debug+ Output**: Complete diagnostic information
2. **Script Code**: The Python code that's failing
3. **Input Data**: Sample input data (sanitized)
4. **Error Details**: Complete error messages and stack traces
5. **Environment**: n8n version, Python version, OS
6. **Configuration**: Node settings and parameters

### Resources

- **[Full Debug+ Guide](full-debug-plus.md)** - Detailed Full Debug+ documentation
- **[Resource Limits Guide](resource-limits.md)** - Memory and CPU limits
- **[Timeout and Cleanup Guide](timeout-and-cleanup.md)** - Execution timeout
- **[Migration Guide](migration.md)** - Upgrading between versions

## Related Documentation

- **[Full Debug+ Guide](full-debug-plus.md)** - Comprehensive developer diagnostics
- **[Resource Limits Guide](resource-limits.md)** - Memory and CPU limits configuration
- **[Timeout and Cleanup Guide](timeout-and-cleanup.md)** - Execution timeout and cleanup
- **[Migration Guide](migration.md)** - Upgrading to v1.20.0+ with simplified debug modes
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
