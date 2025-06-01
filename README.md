# n8n-nodes-python-raw

![n8n.io - Workflow Automation](https://raw.githubusercontent.com/n8n-io/n8n/master/assets/n8n-logo.png)

**Fork of [naskio/n8n-nodes-python](https://github.com/naskio/n8n-nodes-python)** - Python Function node for n8n with raw script execution and output.

> Execute pure Python scripts in n8n and get raw execution results

## Key Differences from Original

This fork provides a fundamentally different approach to Python execution in n8n:

| Original Node | This Fork (Raw) |
|--------------|-----------------|
| Item-by-item processing | Single script execution |
| Returns transformed items | Returns execution metadata |
| Uses python-fire wrapper | Direct Python execution |
| Hidden stdout/stderr | Full stdout/stderr capture |
| Fire-based argument passing | Direct variable injection |

## Features

✅ **Single Execution**: Script runs once regardless of input item count  
✅ **Raw Output**: Access to stdout, stderr, and exit codes  
✅ **Direct Input**: All input items available as `input_items` variable  
✅ **Environment Variables**: Access to custom environment variables  
✅ **Configurable Python**: Choose Python executable path  
✅ **Execution Metadata**: Timestamps, success status, error details  

## Output Format

The node returns a single item with execution results:

```json
{
  "exitCode": 0,
  "stdout": "Output from print() statements",
  "stderr": "Error messages and warnings",
  "success": true,
  "error": null,
  "inputItemsCount": 3,
  "executedAt": "2024-01-01T12:00:00.000Z"
}
```

## Usage Example

```python
# Available variables:
# - input_items: list of all input data
# - env_vars: dict of environment variables

import json
import sys

# Process input data
print(f"Processing {len(input_items)} items")

results = []
for item in input_items:
    # Your processing logic here
    processed = {"original": item, "processed": True}
    results.append(processed)

# Output results (will appear in stdout)
print(json.dumps(results, indent=2))

# Exit with success
sys.exit(0)
```

# Installation

## Using npm

```bash
npm install @zgxsuerwtmrhjzt/n8n-nodes-python-raw
```

## Using Docker

Add to your n8n Dockerfile:

```dockerfile
RUN cd /usr/local/lib/node_modules/n8n && npm install @zgxsuerwtmrhjzt/n8n-nodes-python-raw
```

## Local Development

See [DEVELOPMENT_SETUP.md](DEVELOPMENT_SETUP.md) for development environment setup.

# Requirements

- **Python 3.6+** installed and accessible
- **n8n** running environment

# Node Configuration

## Python Code
Write your Python script directly. Available variables:
- `input_items`: List of input data from previous nodes
- `env_vars`: Dictionary of environment variables

## Python Executable
Specify the Python executable:
- `python3` (default)
- `python`
- `/usr/bin/python3`
- `/path/to/conda/envs/myenv/bin/python`

## Environment Variables (Optional)
Use the PythonEnvVars credential to provide environment variables to your script.

# Use Cases

## Data Analysis
```python
import json
import statistics

# Analyze input data
numbers = [item.get('value', 0) for item in input_items]
result = {
    "count": len(numbers),
    "mean": statistics.mean(numbers) if numbers else 0,
    "median": statistics.median(numbers) if numbers else 0
}

print(json.dumps(result))
```

## External API Integration
```python
import requests
import json

# Call external API
response = requests.get("https://api.example.com/data")
if response.status_code == 200:
    print(json.dumps(response.json()))
    sys.exit(0)
else:
    print(f"API call failed: {response.status_code}", file=sys.stderr)
    sys.exit(1)
```

## File Processing
```python
import os
import json

# Process files
processed_files = []
for item in input_items:
    if 'filename' in item:
        if os.path.exists(item['filename']):
            processed_files.append(item['filename'])

result = {"processed_files": processed_files}
print(json.dumps(result))
```

# Original Project Credits

This fork is based on [n8n-nodes-python](https://github.com/naskio/n8n-nodes-python) by Mehdi Nassim KHODJA.

## License

Apache 2.0 with Commons Clause - see [LICENSE.md](LICENSE.md)

## Contributing

1. Fork this repository
2. Make your changes
3. Update package.json with your npm username
4. Test your changes
5. Submit a pull request

## Support

For issues specific to this fork, please create an issue in this repository.
For general n8n questions, refer to the [n8n documentation](https://docs.n8n.io/).

---

**Note**: This is a fork with significant modifications. For the original item-processing behavior, use the [original package](https://www.npmjs.com/package/n8n-nodes-python).
