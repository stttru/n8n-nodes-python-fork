# Development Environment Setup for n8n-nodes-python

## Testing Resource Limits (v1.24.0+)

### Memory Limit Testing
```python
# Test script for memory limits
def test_memory_limit():
    try:
        # Try to allocate large amount of memory
        size_gb = 5  # Adjust based on your limit
        size_bytes = size_gb * 1024 * 1024 * 1024
        
        print(f"Attempting to allocate {size_gb} GB...")
        big_data = bytearray(size_bytes)
        
        # Fill with data to ensure allocation
        for i in range(0, len(big_data), 1024*1024):
            big_data[i:i+1024] = b'A' * 1024
        
        print(f"✅ Successfully allocated {size_gb} GB!")
        return True
        
    except MemoryError as e:
        print(f"❌ MemoryError: {e}")
        print("✅ Memory limit is working correctly!")
        return False
```

### CPU Limit Testing
```python
# Test script for CPU limits
def test_cpu_limit():
    try:
        print("Starting CPU-intensive task...")
        start_time = time.time()
        
        # CPU-intensive loop
        result = 0
        for i in range(100000000):  # Adjust based on your limit
            result += i * i
            if i % 10000000 == 0:
                elapsed = time.time() - start_time
                print(f"Progress: {i/1000000:.1f}M iterations, {elapsed:.1f}s elapsed")
        
        print(f"✅ CPU test completed: {result}")
        return True
        
    except Exception as e:
        print(f"❌ CPU test failed: {e}")
        return False
```

### Full Debug+ Testing
Enable Full Debug+ mode to verify resource limit information:
- Check `execution.resource_limits` section
- Verify memory and CPU limit settings
- Monitor actual resource usage

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