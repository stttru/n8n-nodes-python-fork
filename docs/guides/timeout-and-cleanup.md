# Timeout and Cleanup Architecture Guide

## Overview

Starting with v1.17.0, the Python Function node includes comprehensive execution timeout protection and complete execution isolation with automatic cleanup. This ensures reliable script execution and prevents resource leaks.

## Execution Timeout

### Configuration

- **Field**: "Execution Timeout (minutes)"
- **Default**: 10 minutes
- **Range**: 1-1440 minutes (1 minute to 24 hours)
- **Required**: Yes (always enabled)

### How Timeout Works

1. **Timer Setup**: When script execution starts, a timeout timer is set
2. **Process Monitoring**: The Python process is monitored for completion
3. **Timeout Action**: If timeout is reached, the process is forcefully terminated with `SIGKILL`
4. **Error Code**: Timeout results in `exitCode = -2`

### Timeout Behavior

```python
# Example: Script that might timeout
import time

# This will timeout if execution timeout < 5 minutes
time.sleep(300)  # 5 minutes
print("This might not execute if timeout is < 5 minutes")
```

**Result when timeout occurs:**
- Process is killed with `SIGKILL`
- `exitCode = -2`
- Error message includes timeout information
- Routes to Output 2 (Error)

### Timeout Configuration Examples

| Use Case | Recommended Timeout | Reason |
|----------|-------------------|---------|
| Quick data processing | 1-5 minutes | Fast operations |
| File processing | 10-30 minutes | Medium complexity |
| Data analysis | 30-60 minutes | Complex calculations |
| Machine learning | 60-240 minutes | Training models |
| Long-running tasks | 240-1440 minutes | Extended processing |

## Execution Isolation Architecture

### Complete Isolation System

Each script execution runs in a **dedicated temporary directory** with complete isolation:

1. **Unique Directory**: `n8n_python_exec_{timestamp}_{randomId}`
2. **Isolated Environment**: Script runs with `cwd` set to this directory
3. **File Containment**: All file operations are contained within this directory
4. **Automatic Cleanup**: Directory is completely removed after execution

### Directory Structure

```
/tmp/n8n_python_exec_1697123456789_abc123/
├── script.py                    # Generated Python script
├── output_file.txt             # Any files created by script
├── subdirectory/               # Any subdirectories created
│   └── nested_file.txt
└── ...                         # All script-generated content
```

**After execution**: Entire directory is deleted, leaving zero traces.

### Isolation Benefits

✅ **Security**: Scripts cannot access files outside their directory  
✅ **Cleanup**: No leftover files or directories  
✅ **Parallel Safety**: Multiple executions don't interfere  
✅ **Resource Management**: Prevents disk space issues  
✅ **Debugging**: Clear separation of execution artifacts  

## Cleanup Mechanisms

### Automatic Cleanup Process

1. **Pre-execution**: Create unique temporary directory
2. **During execution**: All operations contained within directory
3. **Post-execution**: Recursive deletion of entire directory
4. **Error handling**: Cleanup occurs even if script fails

### Cleanup Scenarios

| Scenario | Cleanup Behavior |
|----------|------------------|
| Successful execution | Complete directory removal |
| Script error (exitCode ≠ 0) | Complete directory removal |
| Timeout (exitCode = -2) | Complete directory removal |
| System error | Complete directory removal |
| Node execution failure | Complete directory removal |

### Manual Cleanup Prevention

The cleanup is **automatic and cannot be disabled**. This ensures:

- No manual intervention required
- Consistent behavior across all executions
- Prevention of resource leaks
- Security compliance

## Best Practices

### 1. Timeout Configuration

**For Quick Scripts (1-5 minutes):**
```python
# Data validation, simple calculations
result = validate_data(input_data)
print(json.dumps(result))
```

**For Medium Scripts (10-30 minutes):**
```python
# File processing, API calls
process_large_file(input_file)
generate_report()
```

**For Long Scripts (30+ minutes):**
```python
# Machine learning, complex analysis
model = train_model(training_data)
predictions = model.predict(test_data)
```

### 2. File Handling

**Good Practice - Use Relative Paths:**
```python
# Files are created in execution directory
with open('output.txt', 'w') as f:
    f.write('Results')

# Subdirectories work fine
os.makedirs('reports', exist_ok=True)
with open('reports/summary.txt', 'w') as f:
    f.write('Summary')
```

**Avoid - Absolute Paths:**
```python
# Don't do this - files outside execution directory
with open('/tmp/myfile.txt', 'w') as f:  # Might fail
    f.write('Data')
```

### 3. Progress Reporting

For long-running scripts, report progress to avoid timeout:

```python
import time
import sys

def long_running_task():
    for i in range(100):
        # Do work
        process_item(i)
        
        # Report progress every 10 items
        if i % 10 == 0:
            print(f"Progress: {i}% complete")
            sys.stdout.flush()  # Ensure output is sent
        
        time.sleep(0.1)  # Small delay

long_running_task()
print("Task completed successfully")
```

### 4. Error Handling

Always handle errors gracefully to ensure proper cleanup:

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
    sys.exit(1)  # Proper error exit
```

## Troubleshooting

### Common Timeout Issues

1. **Script times out unexpectedly**
   - **Check**: Current timeout setting
   - **Solution**: Increase timeout or optimize script performance
   - **Debug**: Use debug mode to see execution timing

2. **Script hangs indefinitely**
   - **Cause**: Infinite loops or blocking operations
   - **Solution**: Add progress reporting or break conditions
   - **Prevention**: Test scripts with shorter timeouts first

3. **Files not found after execution**
   - **Cause**: Files created outside execution directory
   - **Solution**: Use relative paths within execution directory
   - **Note**: This is expected behavior for security

### Debugging Timeout Issues

1. **Enable Debug Mode**: See detailed execution information
2. **Check Logs**: Review n8n execution logs for timeout messages
3. **Test with Short Timeout**: Use 1-minute timeout to test script behavior
4. **Monitor Progress**: Add progress reporting to long-running scripts

### Performance Optimization

1. **Profile Scripts**: Identify bottlenecks in long-running scripts
2. **Batch Processing**: Process data in chunks to avoid timeouts
3. **Progress Reporting**: Regular output prevents timeout detection issues
4. **Resource Management**: Monitor memory usage in long-running scripts

## Advanced Configuration

### Custom Timeout Values

Different timeout values for different use cases:

| Script Type | Timeout | Configuration |
|-------------|---------|---------------|
| Quick validation | 1 minute | `executionTimeout: 1` |
| Standard processing | 10 minutes | `executionTimeout: 10` (default) |
| Complex analysis | 60 minutes | `executionTimeout: 60` |
| Machine learning | 240 minutes | `executionTimeout: 240` |

### Monitoring Execution

Use debug mode to monitor execution:

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

## Security Considerations

### File System Isolation

- **Complete Isolation**: Scripts cannot access files outside execution directory
- **Automatic Cleanup**: No files persist after execution
- **No Cross-Execution Access**: Each execution is completely isolated

### Resource Protection

- **Memory**: Process is terminated on timeout
- **CPU**: Long-running processes are killed
- **Disk**: Temporary files are automatically cleaned
- **Network**: Scripts can still make network calls (if needed)

## Related Documentation

- [Dual Outputs Guide](dual-outputs.md)
- [Debugging Guide](debugging.md)
- [Main README](../../README.md)
