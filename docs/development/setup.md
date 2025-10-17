# Development Environment Setup for n8n-nodes-python

## Requirements

- Conda (installed in `I:\ALL_PROG\conda`)
- Node.js and npm (globally installed)
- Git

## Quick Setup

### 1. Create conda environment

```bash
# Create environment from file
I:\ALL_PROG\conda\Scripts\conda.exe env create -f environment.yml

# Or create manually
I:\ALL_PROG\conda\Scripts\conda.exe create -n n8n-python-dev python=3.10 pip -y
```

### 2. Activate environment

```bash
# Initialize conda for PowerShell (if not done)
I:\ALL_PROG\conda\Scripts\conda.exe init powershell

# Activate environment
conda activate n8n-python-dev
```

### 3. Install Python dependencies

```bash
# If using ready-made environment
I:\ALL_PROG\conda\envs\n8n-python-dev\python.exe -m pip install fire

# Or if environment is activated
pip install fire
```

### 4. Install Node.js dependencies

```bash
npm install
```

### 5. Build project

```bash
npm run build
```

## Testing

```bash
# Run tests
npm test

# Test Python setup
I:\ALL_PROG\conda\envs\n8n-python-dev\python.exe test_python_setup.py
```

## Publishing

1. Update `package.json`:
   - Change `name` to a unique name
   - Update `version`
   - Change `author` and `repository`

2. Build project:
   ```bash
   npm run build
   ```

3. Publish to npm:
   ```bash
   npm publish
   ```

## Project Structure

- `nodes/PythonFunction/` - main node
- `credentials/` - environment variables settings
- `dist/` - built files (created after `npm run build`)
- `environment.yml` - conda environment configuration

## Useful Commands

```bash
# Development with auto-rebuild
npm run watch

# Code checking
npm run lint

# Fix linter errors
npm run lintfix
``` 