# Quick Reference

Fast lookup for parameters, exit codes, reserved variables, and common patterns.

## Key Parameters

### Data Sources
| Parameter | Default | Description |
|-----------|---------|-------------|
| Include Input Variables | true | Extract fields from input data as individual Python variables |
| Include Credential Variables | false | Inject credentials from "Python Environment Variables" |
| Include System Environment | false | Include system environment variables in env_vars |
| System Environment Variables | "" | Comma-separated list of system env vars to include |

### Resource Limits (v1.24.0+)
| Parameter | Default | Range | Description |
|-----------|---------|-------|-------------|
| Memory Limit (MB) | 512 | 64-102400 | Maximum memory usage (64 MB - 100 GB) |
| CPU Limit (%) | 50 | 1-100 | Maximum CPU usage across all cores |

### Execution Settings
| Parameter | Default | Range | Description |
|-----------|---------|-------|-------------|
| Python Executable | python3 | - | Path to Python executable |
| Execution Timeout (minutes) | 10 | 1-1440 | Maximum execution time |
| Error Handling | Return Error Details | - | How to handle script errors |

### Debug/Test Mode (v1.20.0+)
| Mode | When to Use | Output |
|------|-------------|--------|
| Off | Production | Normal execution, no debug overhead |
| 🔬 Full Debug+ | Development | Complete diagnostics + file export |

### File Processing
| Parameter | Default | Description |
|-----------|---------|-------------|
| Enable File Processing | false | Process input files from previous nodes |
| Enable Output File Processing | false | Generate files and include in n8n output |
| Expected Output Filename | "" | Filename the script will create |
| Max File Size (MB) | 100 | Maximum file size for processing |

### Output Settings
| Parameter | Default | Description |
|-----------|---------|-------------|
| Parse Output | none | How to parse stdout (JSON, CSV, lines, smart) |
| Pass Through Input Data | true | Include input data in output |
| Hide Variable Values | false | Hide sensitive values in exported files |

## Exit Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 0 | Success | Script completed successfully |
| 1 | Error | Script failed with error |
| 137 | Memory Limit | Script exceeded memory limit (v1.24.0+) |
| -2 | Timeout | Script exceeded execution timeout |

## Reserved Variables

| Variable | Type | Description |
|----------|------|-------------|
| `input_items` | list | All input data items from previous node |
| `env_vars` | dict | Environment variables from credentials |
| `input_files` | list | Input files from previous node (if enabled) |
| `output_dir` | str | Directory for output files (if enabled) |

### Individual Variables
When "Include Input Variables" is enabled, fields from the first input item are available as individual variables:

```python
# Input: [{"title": "My Video", "duration": 120, "author": "John"}]
# Available variables:
title = "My Video"        # str
duration = 120            # number  
author = "John"           # str
```

## Common Patterns

### Basic Script Template
```python
# Check if input data is available
if input_items:
    print(f"Processing {len(input_items)} items")
    for i, item in enumerate(input_items):
        print(f"Item {i+1}: {item}")
else:
    print("No input data")

# Check if credentials are available
if env_vars:
    print(f"Available credentials: {list(env_vars.keys())}")
    # Use credentials safely
    if 'API_KEY' in env_vars:
        api_key = env_vars['API_KEY']
        print(f"Using API key: {api_key[:5]}...")
else:
    print("No credentials available")

# Your code here
print("✅ Script completed successfully!")
```

### File Processing
```python
import os

# Process input files
if input_files:
    for file_info in input_files:
        file_path = file_info['path']
        print(f"Processing file: {file_info['filename']}")
        # Process file...

# Create output files
if output_dir:
    output_file = os.path.join(output_dir, "result.txt")
    with open(output_file, 'w') as f:
        f.write("Processing completed!")
    print(f"Created: {output_file}")
```

### Error Handling
```python
import sys
import traceback

try:
    # Your code here
    result = process_data()
    print(f"Result: {result}")
    
except MemoryError as e:
    print(f"Memory error: {e}")
    print("Consider increasing memory limit")
    sys.exit(137)
    
except Exception as e:
    print(f"Error: {e}")
    traceback.print_exc()
    sys.exit(1)
```

### Resource Monitoring
```python
import sys
import resource

# Check memory usage
memory_usage = resource.getrusage(resource.RUSAGE_SELF).ru_maxrss
print(f"Memory usage: {memory_usage} KB")

# Process data in chunks to avoid memory issues
def process_large_data(data, chunk_size=1000):
    for i in range(0, len(data), chunk_size):
        chunk = data[i:i+chunk_size]
        yield process_chunk(chunk)
```

## Resource Limit Examples

### Memory Limits by Workload
| Workload Type | Recommended Memory | Use Case |
|---------------|-------------------|----------|
| Light | 512 MB - 2 GB | Simple data processing, API calls |
| Medium | 2 GB - 8 GB | Large datasets, complex transformations |
| Heavy | 8 GB - 32 GB | ML/AI workloads, large computations |
| Extreme | 32 GB - 100 GB | Big data, deep learning |

### CPU Limits by Server
| Server Type | Recommended CPU | Equivalent Cores |
|-------------|----------------|------------------|
| Small (2-4 cores) | 50-100% | 1-4 cores |
| Medium (8-16 cores) | 25-75% | 2-12 cores |
| Large (32+ cores) | 25-50% | 8+ cores |

## Debug Mode Comparison

### Off Mode
- ✅ Production ready
- ✅ No performance overhead
- ✅ Basic success/error routing
- ❌ No diagnostic information

### Full Debug+ Mode
- ✅ Complete diagnostics
- ✅ System information
- ✅ File export
- ✅ Resource monitoring
- ❌ Performance overhead
- ❌ Large output files

## Troubleshooting Quick Fixes

### Common Issues

| Problem | Quick Fix |
|---------|-----------|
| `NameError: name 'variable' is not defined` | Check if variable exists: `if 'variable' in globals()` |
| `ImportError: No module named 'module'` | Use try/except: `try: import module; except ImportError: ...` |
| `MemoryError` | Increase memory limit or process data in chunks |
| Script timeout | Increase execution timeout or optimize code |
| Files not detected | Check "Enable Output File Processing" and use `output_dir` |
| Credentials not available | Check "Include Credential Variables" and credential connection |

### Exit Code Meanings

| Exit Code | Action |
|-----------|--------|
| 0 | ✅ Success - continue workflow |
| 1 | ❌ Script error - check code |
| 137 | 💾 Memory limit - increase limit or optimize |
| -2 | ⏰ Timeout - increase timeout or optimize |

## Security Best Practices

### Hide Sensitive Data
```python
# Safe credential logging
if env_vars:
    safe_vars = {k: "***" if "key" in k.lower() or "password" in k.lower() else v 
                 for k, v in env_vars.items()}
    print(f"Variables: {safe_vars}")
```

### Enable Security Features
- ✅ Enable "Hide Variable Values" in production
- ✅ Use appropriate resource limits
- ✅ Enable execution timeout
- ✅ Use Full Debug+ only for development

## Version Information

| Feature | Version | Description |
|---------|---------|-------------|
| Resource Limits | v1.24.0+ | Memory and CPU limits |
| Full Debug+ | v1.19.0+ | Comprehensive diagnostics |
| Debug Simplification | v1.20.0+ | 2 modes instead of 5 |
| Dual Outputs | v1.16.0+ | Success/error routing |
| Execution Timeout | v1.17.0+ | Configurable timeout |

## Related Documentation

- **[Resource Limits Guide](guides/resource-limits.md)** - Detailed memory and CPU limits
- **[Full Debug+ Guide](guides/full-debug-plus.md)** - Comprehensive diagnostics
- **[Debugging Guide](guides/debugging.md)** - General debugging and troubleshooting
- **[Migration Guide](guides/migration.md)** - Upgrading between versions
