# Full Debug+ Developer Mode Guide

Complete guide for Full Debug+ diagnostics (v1.19.0+)

## What is Full Debug+

Full Debug+ is a comprehensive developer diagnostics mode that provides maximum diagnostic information for the entire n8n Python Raw node. It's designed for troubleshooting, development, and issue reporting.

### Purpose

- **Developer Mode**: Maximum diagnostic information for entire node
- **Troubleshooting**: Complete system and execution details
- **Issue Reporting**: Comprehensive information for bug reports
- **Performance Analysis**: Detailed resource usage and timing information

### When to Use

- **Script Failures**: When Python scripts fail unexpectedly
- **Development**: Testing new Python code and debugging issues
- **Performance Issues**: Understanding resource usage and bottlenecks
- **Issue Reporting**: Providing complete diagnostic information to developers
- **System Analysis**: Understanding how the node interacts with your environment

### What Information Provided

Full Debug+ provides comprehensive information across multiple categories:

- **System Diagnostics**: OS, Node.js, n8n, Python environment details
- **Node Installation**: Package version, installation path, configuration
- **Data Sources**: Input variables, credentials, system environment status
- **Script Generation**: User code analysis, template info, assembled script
- **Execution Details**: Preparation, command, timing, results, cleanup
- **Resource Limits**: Memory and CPU limit information
- **Error Information**: Complete error details with troubleshooting hints

## Enabling Full Debug+

### Configuration

1. **Set Debug Mode**: Change "Debug/Test Mode" to "🔬 Full Debug+ (Developer Mode)"
2. **Optional Settings**:
   - **Hide Variable Values**: Enable to hide sensitive data in exported files
   - **Resource Limits**: Configure memory and CPU limits as needed

### Output Structure

Full Debug+ adds a `full_debug_plus` object to the node's output containing all diagnostic information:

```json
{
  "full_debug_plus": {
    "mode": "full_plus",
    "timestamp_start": "2025-10-17T17:00:31.481Z",
    "timestamp_end": "2025-10-17T17:00:43.700Z",
    "total_duration_ms": 12219,
    "system": { ... },
    "node_installation": { ... },
    "data_sources": { ... },
    "script_generation": { ... },
    "execution": { ... },
    "errors_and_warnings": { ... },
    "troubleshooting_hints": [ ... ]
  }
}
```

## Diagnostics Information

### System Diagnostics

Provides comprehensive system information:

```json
{
  "system": {
    "os": {
      "platform": "linux",
      "release": "6.8.0-85-generic",
      "arch": "x64",
      "type": "Linux",
      "hostname": "c3f26b0dbe25",
      "uptime_seconds": 40574.7,
      "total_memory_mb": 29362,
      "free_memory_mb": 26491,
      "cpus_count": 30,
      "cpus_model": "Intel(R) Core(TM) i9-14900K"
    },
    "nodejs": {
      "version": "v22.17.0",
      "v8_version": "12.4.254.21-node.26",
      "arch": "x64",
      "platform": "linux",
      "process_id": 7,
      "parent_process_id": 1,
      "executable_path": "/usr/local/bin/node",
      "cwd": "/home/node",
      "uptime_seconds": 40569,
      "memory_usage_mb": {
        "rss": 440,
        "heap_total": 298,
        "heap_used": 280,
        "external": 55
      }
    },
    "n8n": {
      "version": "unknown",
      "execution_mode": "regular",
      "workflow_id": "DBfmP7SkTGH8AjP5",
      "execution_id": "unknown",
      "node_env": "production",
      "config_dir": "default"
    },
    "python": {
      "executable": "python3",
      "version_command": "python3 --version",
      "version_output": "Python 3.12.11",
      "path_resolved": "python3",
      "is_found": true,
      "version_details": {
        "full_version": "Python 3.12.11",
        "major": 3,
        "minor": 12,
        "micro": 11
      },
      "installed_packages": {
        "package_count": 46,
        "packages_list": [
          "numpy==2.3.2",
          "pandas==2.3.2",
          "requests==2.32.5",
          "..."
        ],
        "pip_freeze_command": "python3 -m pip freeze",
        "pip_freeze_successful": true,
        "pip_freeze_error": null
      }
    }
  }
}
```

**Use Cases**:
- **Environment Issues**: Verify Python version and installed packages
- **System Resources**: Check available memory and CPU cores
- **Platform Compatibility**: Confirm OS and architecture support

### Node Installation

Information about the node package and installation:

```json
{
  "node_installation": {
    "package": {
      "name": "n8n-nodes-python-raw",
      "version": "1.24.1",
      "description": "Python execution for n8n with comprehensive diagnostics"
    },
    "node": {
      "type": "n8n-nodes-python-raw.pythonFunctionRaw",
      "name": "Python Raw",
      "version": 24,
      "subtitle": "Run custom Python script once and return raw output",
      "credentials_available": ["pythonEnvVars"],
      "parameters_count": 15,
      "outputs_count": 2
    },
    "installation": {
      "loaded_from": "",
      "file_path": ""
    }
  }
}
```

**Use Cases**:
- **Version Issues**: Verify correct package version
- **Installation Problems**: Check if node is properly installed
- **Feature Availability**: Confirm which features are available

### Data Sources

Status of all data source configurations:

```json
{
  "data_sources": {
    "input_variables": {
      "enabled": true,
      "items_received": 1,
      "items_have_data": true,
      "first_item_keys": ["title", "duration", "author"],
      "first_item_structure": {
        "title": "string",
        "duration": "number",
        "author": "string"
      },
      "all_items_sizes": [64],
      "total_data_kb": 0
    },
    "credentials": {
      "enabled": true,
      "credential_type": "pythonEnvVars",
      "credential_connected": true,
      "credential_id": "cred_123",
      "credential_name": "My API Credentials",
      "raw_credential_data_keys": ["API_KEY", "DB_HOST", "DB_PASSWORD"],
      "envFileContent_exists": true,
      "envFileContent_length": 156,
      "envFileContent_lines_count": 3,
      "envFileContent_preview_first_3_lines": [
        "API_KEY=sk-1234567890abcdef",
        "DB_HOST=localhost",
        "DB_PASSWORD=***hidden***"
      ],
      "parsing_attempted": true,
      "parsing_successful": true,
      "parse_error": null,
      "variables_parsed": 3,
      "variable_names": ["API_KEY", "DB_HOST", "DB_PASSWORD"],
      "variable_types": {
        "API_KEY": "string",
        "DB_HOST": "string",
        "DB_PASSWORD": "string"
      }
    },
    "system_environment": {
      "enabled": false,
      "total_env_vars_available": 37,
      "requested_vars": [],
      "found_vars": [],
      "missing_vars": [],
      "found_values_preview": {},
      "all_process_env_keys": ["PATH", "HOME", "NODE_ENV", "..."]
    }
  }
}
```

**Use Cases**:
- **Data Issues**: Verify input data is received correctly
- **Credential Problems**: Check if credentials are connected and parsed
- **Environment Variables**: Confirm system environment access

### Script Generation

Analysis of user code and script assembly:

```json
{
  "script_generation": {
    "user_code": {
      "provided": true,
      "length_chars": 2105,
      "lines_count": 70,
      "has_imports": true,
      "has_future_imports": false
    },
    "template": {
      "sections_generated": [
        "header",
        "individual_variables",
        "env_variables",
        "reserved_variables",
        "user_code"
      ],
      "individual_vars_count": 3,
      "env_vars_count": 3,
      "reserved_vars_defined": [
        "input_items",
        "env_vars",
        "input_files",
        "output_dir"
      ],
      "input_files_count": 0,
      "output_dir_provided": false
    },
    "final_script": {
      "total_length_chars": 2337,
      "total_lines_count": 86,
      "header_length": 207,
      "user_code_length": 2105,
      "estimated_size_kb": 2
    },
    "full_assembled_script": "#!/usr/bin/env python3\n# Auto-generated script for n8n Python Function (Raw)\n\nimport json\nimport sys\n\n# Reserved variables (always defined)\ninput_items = [...]\nenv_vars = {...}\ninput_files = []\noutput_dir = \"\"\n\n# Individual variables from first input item\ntitle = \"My Video\"\nduration = 120\nauthor = \"John\"\n\n# Environment variables from credentials\nAPI_KEY = \"sk-1234567890abcdef\"\nDB_HOST = \"localhost\"\nDB_PASSWORD = \"***hidden***\"\n\n# User code starts here\n# ..."
  }
}
```

**Use Cases**:
- **Code Analysis**: Understand how user code is processed
- **Variable Injection**: Verify variables are injected correctly
- **Script Assembly**: See the complete assembled script
- **Template Issues**: Debug template generation problems

### Execution Details

Complete execution timeline and results:

```json
{
  "execution": {
    "preparation": {
      "temp_dir_created": "/tmp/n8n_python_exec_1760720487357_ylibui",
      "script_file_path": "/tmp/n8n_python_exec_1760720487357_ylibui/2824b3737c38dd72d83290acf639a758.py",
      "script_file_size_bytes": 2361,
      "script_written_successfully": true
    },
    "command": {
      "executable": "python3",
      "full_command": "python3 /tmp/n8n_python_exec_1760720487357_ylibui/2824b3737c38dd72d83290acf639a758.py",
      "arguments": ["/tmp/n8n_python_exec_1760720487357_ylibui/2824b3737c38dd72d83290acf639a758.py"],
      "working_directory": "/tmp/n8n_python_exec_1760720487357_ylibui",
      "timeout_minutes": 10
    },
    "timing": {
      "preparation_started": "2025-10-17T17:01:27.357Z",
      "script_created": "2025-10-17T17:01:27.357Z",
      "execution_started": "2025-10-17T17:01:27.406Z",
      "execution_finished": "2025-10-17T17:01:44.996Z",
      "preparation_duration_ms": 0,
      "execution_duration_ms": 17590,
      "total_duration_ms": 17590
    },
    "result": {
      "exit_code": 0,
      "stdout_length": 1758,
      "stderr_length": 83,
      "timed_out": false,
      "killed": false,
      "signal": null
    },
    "cleanup": {
      "attempted": true,
      "successful": true,
      "files_removed": [
        "/tmp/n8n_python_exec_1760720487357_ylibui/2824b3737c38dd72d83290acf639a758.py",
        "/tmp/n8n_python_exec_1760720487357_ylibui"
      ],
      "error": null
    },
    "resource_limits": {
      "memory_limit_mb": 15000,
      "cpu_limit_percent": 50,
      "cpu_cores_total": 30,
      "cpu_time_multiplier": 15,
      "cpu_time_seconds": 9000,
      "wrapper_script_used": true,
      "platform": "linux"
    }
  }
}
```

**Use Cases**:
- **Performance Analysis**: Understand execution timing
- **Resource Usage**: Monitor memory and CPU limits
- **Cleanup Issues**: Verify temporary files are cleaned up
- **Command Problems**: Debug Python execution issues

## File Export

Full Debug+ automatically exports files as binary attachments to the node's output.

### Exported Files

#### Python Script File
- **Filename**: `full_debug_plus_script_TIMESTAMP.py` (success) or `full_debug_plus_script_error_TIMESTAMP.py` (error)
- **Content**: Complete executable Python script with all injected variables
- **Use Case**: Share scripts, debug issues, run scripts outside n8n

#### Diagnostics JSON File
- **Filename**: `full_debug_plus_diagnostics_TIMESTAMP.json` (success) or `full_debug_plus_diagnostics_error_TIMESTAMP.json` (error)
- **Content**: Complete diagnostic information in structured JSON format
- **Use Case**: Share diagnostics, analyze issues, provide to developers

### How to Use Exported Files

1. **Download Files**: Click on binary attachments in n8n output
2. **Script File**: Run the Python script locally for testing
3. **Diagnostics File**: Share with developers for issue analysis
4. **Analysis**: Use JSON file to understand system state and execution details

### File Content Examples

#### Script File Content
```python
#!/usr/bin/env python3
# Auto-generated script for n8n Python Function (Raw)

import json
import sys

# Reserved variables (always defined)
input_items = [{"title": "My Video", "duration": 120, "author": "John"}]
env_vars = {"API_KEY": "sk-1234567890abcdef", "DB_HOST": "localhost"}
input_files = []
output_dir = ""

# Individual variables from first input item
title = "My Video"
duration = 120
author = "John"

# Environment variables from credentials
API_KEY = "sk-1234567890abcdef"
DB_HOST = "localhost"
DB_PASSWORD = "***hidden***"

# User code starts here
print(f"Processing: {title}")
print(f"Duration: {duration} sec")
print(f"Author: {author}")

if env_vars and 'API_KEY' in env_vars:
    api_key = env_vars['API_KEY']
    print(f"Using API key: {api_key[:5]}...")

print("\n✅ Script completed successfully!")
```

#### Diagnostics JSON File Content
```json
{
  "mode": "full_plus",
  "timestamp_start": "2025-10-17T17:00:31.481Z",
  "timestamp_end": "2025-10-17T17:00:43.700Z",
  "total_duration_ms": 12219,
  "system": { ... },
  "node_installation": { ... },
  "data_sources": { ... },
  "script_generation": { ... },
  "execution": { ... },
  "errors_and_warnings": [],
  "troubleshooting_hints": [
    "✓ Script executed successfully",
    "✓ All temporary files cleaned up",
    "✓ Resource limits applied correctly"
  ]
}
```

## Best Practices

### Security Considerations

#### Hide Variable Values
- **Enable**: Always enable "Hide Variable Values" in production
- **Purpose**: Prevents sensitive data from appearing in exported files
- **Effect**: Replaces sensitive values with `***hidden***` in script and diagnostics files

#### Sensitive Data Handling
```python
# Example of sensitive data handling
if env_vars:
    # Safe way to log credentials
    safe_vars = {k: "***" if "key" in k.lower() or "password" in k.lower() else v 
                 for k, v in env_vars.items()}
    print(f"Available variables: {safe_vars}")
```

### When to Use Full Debug+

#### ✅ Good Use Cases
- **Development**: Testing new Python code
- **Troubleshooting**: Debugging script failures
- **Issue Reporting**: Providing complete diagnostic information
- **Performance Analysis**: Understanding resource usage
- **System Verification**: Confirming environment setup

#### ❌ Avoid Using In Production
- **Performance Impact**: Full Debug+ adds overhead
- **Security Risk**: May expose sensitive information
- **Resource Usage**: Generates large diagnostic files
- **Log Pollution**: Creates verbose output

### Sharing Diagnostics

#### For Issue Reports
1. **Enable Full Debug+**: Set debug mode to Full Debug+
2. **Enable Hide Values**: Protect sensitive information
3. **Reproduce Issue**: Run the failing workflow
4. **Export Files**: Download script and diagnostics files
5. **Share Information**: Provide files and description to developers

#### For Development Teams
1. **Document Settings**: Include Full Debug+ configuration
2. **Share Examples**: Provide working and failing examples
3. **Include Environment**: Share system and Python environment details
4. **Version Information**: Include package and n8n versions

## Examples

### Success Case

#### Input Data
```json
[{"title": "My Video", "duration": 120, "author": "John"}]
```

#### Python Code
```python
print(f"Processing: {title}")
print(f"Duration: {duration} sec")
print(f"Author: {author}")

if env_vars:
    print(f"Available environment variables: {len(env_vars)}")

print("✅ Script completed successfully!")
```

#### Full Debug+ Output
```json
{
  "exitCode": 0,
  "stdout": "Processing: My Video\nDuration: 120 sec\nAuthor: John\nAvailable environment variables: 3\n✅ Script completed successfully!",
  "stderr": "",
  "success": true,
  "full_debug_plus": {
    "mode": "full_plus",
    "system": { ... },
    "execution": {
      "result": {
        "exit_code": 0,
        "stdout_length": 89,
        "stderr_length": 0,
        "timed_out": false,
        "killed": false
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

### Error Case

#### Python Code with Error
```python
print(f"Processing: {title}")
print(f"Duration: {duration} sec")
print(f"Author: {author}")

# This will cause an error
undefined_variable = non_existent_function()
```

#### Full Debug+ Output
```json
{
  "exitCode": 1,
  "stdout": "Processing: My Video\nDuration: 120 sec\nAuthor: John",
  "stderr": "Traceback (most recent call last):\n  File \"/tmp/n8n_python_exec_.../script.py\", line 6, in <module>\n    undefined_variable = non_existent_function()\nNameError: name 'non_existent_function' is not defined",
  "success": false,
  "full_debug_plus": {
    "mode": "full_plus",
    "system": { ... },
    "execution": {
      "result": {
        "exit_code": 1,
        "stdout_length": 45,
        "stderr_length": 156,
        "timed_out": false,
        "killed": false
      }
    },
    "errors_and_warnings": [
      {
        "type": "script_error",
        "message": "NameError: name 'non_existent_function' is not defined",
        "line_number": 6
      }
    ],
    "troubleshooting_hints": [
      "❌ Script failed with exit code 1",
      "💡 Check Python syntax and variable names",
      "💡 Verify all functions and modules are imported",
      "💡 Use Full Debug+ to see complete error details"
    ]
  }
}
```

## Troubleshooting

### Common Issues

#### Full Debug+ Not Working
- **Cause**: Debug mode not set to Full Debug+
- **Solution**: Verify "Debug/Test Mode" is set to "🔬 Full Debug+ (Developer Mode)"

#### Missing Diagnostic Information
- **Cause**: Node version too old
- **Solution**: Update to v1.19.0+ for Full Debug+ support

#### Large File Exports
- **Cause**: Complex scripts or large datasets
- **Solution**: Use "Hide Variable Values" to reduce file size

#### Performance Impact
- **Cause**: Full Debug+ adds overhead
- **Solution**: Use only for development and troubleshooting

### Getting Help

1. **Enable Full Debug+**: Get complete diagnostic information
2. **Check Logs**: Review n8n and system logs
3. **Export Files**: Download script and diagnostics files
4. **Documentation**: Refer to other guides for related issues
5. **Community**: Check GitHub issues for similar problems

## Related Documentation

- **[Resource Limits Guide](resource-limits.md)** - Memory and CPU limits configuration
- **[Debugging Guide](debugging.md)** - General debugging and troubleshooting
- **[Timeout and Cleanup Guide](timeout-and-cleanup.md)** - Execution timeout and cleanup
- **[Migration Guide](migration.md)** - Upgrading to v1.19.0+ with Full Debug+
