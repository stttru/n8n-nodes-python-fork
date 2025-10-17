# Resource Limits Guide

Complete guide for Memory and CPU limits (v1.24.0+)

## Overview

Resource limits protect your n8n server from Python script overload by enforcing memory and CPU restrictions. This feature prevents runaway scripts from consuming excessive resources and potentially crashing your n8n instance.

### What are Resource Limits?

- **Memory Limit**: Maximum RAM usage allowed for the Python script
- **CPU Limit**: Maximum CPU usage as percentage of all available cores
- **Automatic Enforcement**: Limits are enforced via Python's `resource` module
- **Cross-platform**: Full support on Linux/macOS, graceful fallback on Windows

### Why Resource Limits Matter

- **Server Protection**: Prevents scripts from consuming all available RAM
- **CPU Control**: Limits CPU usage to prevent system overload
- **Stability**: Ensures n8n remains responsive even with resource-intensive scripts
- **Security**: Reduces attack surface for malicious scripts
- **Scalability**: Better resource allocation for multiple concurrent workflows

## Memory Limit

### Configuration

- **Parameter**: Memory Limit (MB)
- **Default**: 512 MB
- **Range**: 64 MB - 102,400 MB (100 GB)
- **Purpose**: Prevent scripts from consuming excessive RAM

### How It Works

The memory limit uses Python's `resource.RLIMIT_AS` to limit the address space (virtual memory) available to the script:

```python
# Auto-generated wrapper script sets the limit
resource.setrlimit(resource.RLIMIT_AS, (memory_bytes, memory_bytes))
```

### Examples by Workload Type

#### Light Workloads (512 MB - 2 GB)
- **Simple data processing**: JSON parsing, CSV manipulation
- **API calls**: HTTP requests, data fetching
- **Text processing**: String manipulation, regex operations
- **Basic calculations**: Math operations, simple algorithms

```python
# Example: Light workload
import json
import requests

# Process small datasets
data = json.loads(input_data)
results = []
for item in data:
    # Simple processing
    processed = {"id": item["id"], "processed": True}
    results.append(processed)

print(f"Processed {len(results)} items")
```

#### Data Processing (2 GB - 8 GB)
- **Large datasets**: Processing thousands of records
- **Data transformation**: Complex data manipulation
- **File processing**: Large file operations
- **Database operations**: Bulk data operations

```python
# Example: Data processing workload
import pandas as pd
import numpy as np

# Load large dataset
df = pd.read_csv("large_dataset.csv")
print(f"Dataset size: {len(df)} rows")

# Complex transformations
df['processed'] = df.apply(lambda row: complex_calculation(row), axis=1)
df['normalized'] = (df['value'] - df['value'].mean()) / df['value'].std()

# Export results
df.to_csv("processed_data.csv", index=False)
print("Data processing completed")
```

#### ML/AI Workloads (8 GB - 32 GB)
- **Machine Learning**: Model training, inference
- **Data Science**: Large-scale analysis
- **Image Processing**: Computer vision tasks
- **Natural Language Processing**: Text analysis

```python
# Example: ML workload
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split

# Load large dataset
X = np.random.rand(100000, 100)  # 100k samples, 100 features
y = np.random.randint(0, 2, 100000)

# Train model
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)
model = RandomForestClassifier(n_estimators=100)
model.fit(X_train, y_train)

# Evaluate
accuracy = model.score(X_test, y_test)
print(f"Model accuracy: {accuracy:.3f}")
```

#### Heavy Processing (32 GB - 100 GB)
- **Big Data**: Massive dataset processing
- **Deep Learning**: Large neural networks
- **Scientific Computing**: Complex simulations
- **Video Processing**: Large video files

```python
# Example: Heavy processing workload
import numpy as np
import torch

# Large tensor operations
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
large_tensor = torch.randn(10000, 10000, device=device)

# Complex computations
result = torch.matmul(large_tensor, large_tensor.T)
eigenvalues = torch.linalg.eigvals(result)

print(f"Computed eigenvalues for {large_tensor.shape} tensor")
```

### Exit Code 137

When a script exceeds the memory limit, it receives a `MemoryError` and exits with code 137:

```python
# This will trigger MemoryError if limit is too low
big_data = bytearray(5 * 1024 * 1024 * 1024)  # 5 GB
```

**Exit Code 137** indicates:
- Script exceeded memory limit
- Process was killed due to memory constraint
- Increase memory limit or optimize script

### Troubleshooting Memory Issues

#### Common Problems

1. **MemoryError with small datasets**
   - **Cause**: Memory limit too low for Python overhead
   - **Solution**: Increase limit to 1-2 GB minimum

2. **MemoryError with large datasets**
   - **Cause**: Dataset too large for available memory
   - **Solution**: Process data in chunks or increase limit

3. **MemoryError with libraries**
   - **Cause**: Libraries (pandas, numpy) require significant memory
   - **Solution**: Increase limit or use memory-efficient alternatives

#### Memory Optimization Tips

```python
# Process data in chunks instead of loading all at once
def process_large_file(filename, chunk_size=1000):
    results = []
    for chunk in pd.read_csv(filename, chunksize=chunk_size):
        # Process chunk
        processed_chunk = chunk.apply(process_function, axis=1)
        results.append(processed_chunk)
    return pd.concat(results, ignore_index=True)

# Use generators for large datasets
def process_items(items):
    for item in items:
        yield process_item(item)

# Clear variables when done
large_data = load_large_dataset()
result = process_data(large_data)
del large_data  # Free memory
```

## CPU Limit

### Configuration

- **Parameter**: CPU Limit (%)
- **Default**: 50%
- **Range**: 1% - 100%
- **Purpose**: Control CPU usage across all available cores

### Multi-core Calculation

The CPU limit applies to **ALL available cores**, not just one:

```python
# CPU time calculation
cpu_time_seconds = timeout_minutes × 60 × (cpu_cores × cpu_limit_percent / 100)
```

### Examples by Server Configuration

#### Small Server (2-4 cores)
- **25% limit**: Equivalent to 0.5-1 core available
- **50% limit**: Equivalent to 1-2 cores available
- **100% limit**: All cores available

#### Medium Server (8-16 cores)
- **25% limit**: Equivalent to 2-4 cores available
- **50% limit**: Equivalent to 4-8 cores available
- **75% limit**: Equivalent to 6-12 cores available

#### Large Server (32+ cores)
- **25% limit**: Equivalent to 8+ cores available
- **50% limit**: Equivalent to 16+ cores available
- **100% limit**: All cores available

### How It Works

The CPU limit uses Python's `resource.RLIMIT_CPU` to limit total CPU time:

```python
# Auto-generated wrapper script sets the limit
resource.setrlimit(resource.RLIMIT_CPU, (cpu_time_seconds, cpu_time_seconds))
```

### CPU-Intensive Examples

#### Light CPU Usage (25-50%)
```python
# Simple calculations
import math

def calculate_primes(limit):
    primes = []
    for num in range(2, limit):
        if all(num % i != 0 for i in range(2, int(math.sqrt(num)) + 1)):
            primes.append(num)
    return primes

primes = calculate_primes(10000)
print(f"Found {len(primes)} primes")
```

#### Medium CPU Usage (50-75%)
```python
# Data processing with calculations
import numpy as np

def process_matrix(size):
    # Create large matrix
    matrix = np.random.rand(size, size)
    
    # Perform calculations
    result = np.linalg.inv(matrix)
    eigenvalues = np.linalg.eigvals(result)
    
    return eigenvalues

eigenvalues = process_matrix(1000)
print(f"Computed eigenvalues for 1000x1000 matrix")
```

#### High CPU Usage (75-100%)
```python
# Intensive computations
import numpy as np
from multiprocessing import Pool

def intensive_calculation(data):
    # CPU-intensive operation
    result = np.fft.fft(data)
    return np.abs(result)

# Process multiple datasets in parallel
datasets = [np.random.rand(10000) for _ in range(8)]
with Pool() as pool:
    results = pool.map(intensive_calculation, datasets)

print(f"Processed {len(results)} datasets")
```

## Best Practices

### Recommendations by Use Case

#### Development/Testing
- **Memory**: 1-2 GB
- **CPU**: 25-50%
- **Reason**: Sufficient for testing without impacting system

#### Production Light Workloads
- **Memory**: 512 MB - 2 GB
- **CPU**: 25-50%
- **Reason**: API calls, simple data processing

#### Production Data Processing
- **Memory**: 2-8 GB
- **CPU**: 50-75%
- **Reason**: Large datasets, complex transformations

#### Production ML/AI
- **Memory**: 8-32 GB
- **CPU**: 75-100%
- **Reason**: Model training, inference, large computations

#### Production Heavy Processing
- **Memory**: 32-100 GB
- **CPU**: 100%
- **Reason**: Big data, deep learning, scientific computing

### Security Considerations

1. **Start Conservative**: Begin with lower limits and increase as needed
2. **Monitor Usage**: Use Full Debug+ to monitor actual resource usage
3. **Test Limits**: Verify limits work as expected with test scripts
4. **Document Settings**: Keep track of optimal settings for different workloads

### Production Settings

#### Shared Server Environment
```yaml
# Conservative settings for shared server
memory_limit_mb: 1024      # 1 GB
cpu_limit_percent: 25       # 25% of all cores
execution_timeout: 5        # 5 minutes
```

#### Dedicated Server Environment
```yaml
# More generous settings for dedicated server
memory_limit_mb: 8192       # 8 GB
cpu_limit_percent: 75       # 75% of all cores
execution_timeout: 30       # 30 minutes
```

#### High-Performance Environment
```yaml
# Maximum settings for high-performance server
memory_limit_mb: 32768      # 32 GB
cpu_limit_percent: 100      # All cores
execution_timeout: 60       # 60 minutes
```

## Testing Resource Limits

### Test Scripts

#### Memory Limit Test
```python
# Test script to verify memory limit
import sys

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

if __name__ == "__main__":
    test_memory_limit()
```

#### CPU Limit Test
```python
# Test script to verify CPU limit
import time
import sys

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

if __name__ == "__main__":
    test_cpu_limit()
```

### How to Verify Limits

1. **Run Test Scripts**: Use the test scripts above
2. **Check Exit Codes**: Verify correct exit codes (137 for memory, etc.)
3. **Monitor System**: Use system monitoring tools
4. **Full Debug+**: Use Full Debug+ mode to see resource usage details

### Expected Behavior

#### Memory Limit Working
- Script receives `MemoryError`
- Exit code 137
- Process terminated cleanly
- No system impact

#### CPU Limit Working
- Script receives timeout
- Process terminated after CPU time limit
- Clean termination
- No system overload

## Troubleshooting

### Common Issues

#### Script Runs Despite Limits
- **Cause**: Limits not properly set or platform not supported
- **Solution**: Check platform support, verify wrapper script generation

#### Limits Too Restrictive
- **Cause**: Limits set too low for workload
- **Solution**: Increase limits gradually, monitor actual usage

#### Limits Not Enforced
- **Cause**: Windows platform or resource module unavailable
- **Solution**: Use timeout as fallback, consider Linux/macOS for full support

#### Unexpected Terminations
- **Cause**: Script hitting limits unexpectedly
- **Solution**: Use Full Debug+ to analyze resource usage, adjust limits

### Exit Codes

| Exit Code | Meaning | Description |
|-----------|---------|-------------|
| 0 | Success | Script completed successfully |
| 1 | Error | Script failed with error |
| 137 | Memory Limit | Script exceeded memory limit |
| -2 | Timeout | Script exceeded execution timeout |

### Logs and Diagnostics

#### Full Debug+ Information
```json
{
  "execution": {
    "resource_limits": {
      "memory_limit_mb": 512,
      "cpu_limit_percent": 50,
      "cpu_cores_total": 8,
      "cpu_time_multiplier": 4.0,
      "cpu_time_seconds": 2400,
      "wrapper_script_used": true,
      "platform": "linux"
    }
  }
}
```

#### System Monitoring
- Use `htop` or `top` to monitor CPU usage
- Use `free -h` to monitor memory usage
- Check n8n logs for resource limit messages

### Getting Help

1. **Enable Full Debug+**: Get complete diagnostic information
2. **Check Logs**: Review n8n and system logs
3. **Test Limits**: Use test scripts to verify behavior
4. **Documentation**: Refer to other guides for related issues
5. **Community**: Check GitHub issues for similar problems

## Related Documentation

- **[Full Debug+ Guide](full-debug-plus.md)** - Comprehensive diagnostics including resource usage
- **[Timeout and Cleanup Guide](timeout-and-cleanup.md)** - Execution timeout and cleanup
- **[Debugging Guide](debugging.md)** - General debugging and troubleshooting
- **[Migration Guide](migration.md)** - Upgrading to v1.24.0+ with resource limits
