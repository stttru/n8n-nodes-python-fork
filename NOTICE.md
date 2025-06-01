# NOTICE - Fork Modifications

This is a fork of [naskio/n8n-nodes-python](https://github.com/naskio/n8n-nodes-python) version 0.1.4.

## Original Project
- **Author**: Mehdi Nassim KHODJA <contact@nask.io>
- **License**: Apache 2.0 with Commons Clause
- **Repository**: https://github.com/naskio/n8n-nodes-python

## Modifications Made

### Major Changes
1. **Complete rewrite of execution logic**: Changed from item-by-item processing to single script execution
2. **New return format**: Returns raw execution results (exitCode, stdout, stderr) instead of transformed items
3. **Node name changed**: From `pythonFunction` to `pythonFunctionRaw`
4. **Direct Python execution**: Removed the python-fire wrapper, executes pure Python scripts

### Technical Details
- **File modified**: `nodes/PythonFunction/PythonFunction.node.ts`
- **Template removed**: No longer uses `script.template.py`
- **Input handling**: All input items are passed as `input_items` variable to the script
- **Output format**: Single result item with execution metadata

### New Features
- Configurable Python executable path
- Raw stdout/stderr capture
- Exit code reporting
- Execution timestamp
- Input items count

### Purpose
This fork is designed for users who need:
- Direct Python script execution
- Full control over script output
- Access to execution metadata
- Single-execution workflow (not item-by-item processing)

## License Compliance
This fork maintains the original Apache 2.0 with Commons Clause license.
All original copyright notices are preserved.
This work is derived from the original project under the terms of the Apache License 2.0. 