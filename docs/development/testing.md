# Test Suite for n8n-nodes-python

Comprehensive test suite for the Python Function node with organized structure and automated test runner.

## 📁 Structure

```
tests/
├── README.md                    # This documentation
├── run_all.py                   # Main test runner
├── config.json                  # Test configuration
│
├── unit/                        # Unit tests (fast, isolated)
│   ├── test_credentials.py      # Credentials functionality
│   ├── test_environment_vars.py # Environment variables
│   ├── test_script_generation.py # Script generation
│   ├── test_extract_code_template.py # Extract Code Template
│   ├── test_variable_injection.py # Variable injection
│   └── test_new_credentials.py  # New credentials features
│
├── integration/                 # Integration tests (slower, e2e)
│   ├── test_complete_workflow.py # Full workflow testing
│   ├── test_file_processing.py  # File processing integration
│   ├── test_output_processing.py # Output file processing
│   ├── test_multiple_credentials.py # Multiple credentials
│   ├── test_backward_compatibility.py # Backward compatibility
│   ├── test_compatibility_check.py # Compatibility verification
│   ├── test_integration_status.py # Integration status
│   ├── test_output_file_final.py # Final output file tests
│   └── test_output_file_integration.py # Output file integration
│
├── functional/                  # Functional tests (user features)
│   ├── test_python_execution.py # Basic Python execution
│   └── test_configuration_options.py # Configuration options
│
├── performance/                 # Performance tests
│   ├── test_resource_limits.py  # Resource limits testing (v1.24.0+)
│   ├── test_memory_limits.py   # Memory limit enforcement
│   └── test_cpu_limits.py      # CPU limit enforcement
│
├── typescript/                  # TypeScript/Jest tests
│   └── node.test.ts            # Node implementation tests
│
├── fixtures/                    # Test data and mocks
│   ├── sample_files/           # Sample files for testing
│   └── (mock data files)
│
├── examples/                    # Usage examples and demos
│   └── video_generation_demo.py # Video generation example
│
└── utils/                       # Test utilities
    └── (test helpers and utilities)
```

## 🚀 Running Tests

### Quick Start

```bash
# Run all tests
python tests/run_all.py

# Run specific category
python tests/run_all.py --category unit
python tests/run_all.py --category integration
python tests/run_all.py --category functional

# Verbose output
python tests/run_all.py --verbose

# List all available tests
python tests/run_all.py --list
```

### NPM Scripts

```bash
# Run all tests
npm test

# Run specific categories
npm run test:unit
npm run test:integration
npm run test:functional

# Run TypeScript tests only
npm run test:js
```

## 🧪 Resource Limits Testing (v1.24.0+)

### Memory Limit Tests
Test memory limit enforcement with various scenarios:

```python
# tests/performance/test_memory_limits.py
def test_memory_limit_enforcement():
    """Test that memory limits are properly enforced"""
    # Test with different memory limits
    limits = [64, 512, 1024, 8192]  # MB
    
    for limit in limits:
        # Create script that tries to allocate more than limit
        script = f"""
import sys
try:
    # Try to allocate more than limit
    size_bytes = {limit * 1024 * 1024 + 1024 * 1024}  # limit + 1MB
    big_data = bytearray(size_bytes)
    print("Memory allocation succeeded")
    sys.exit(0)
except MemoryError:
    print("MemoryError caught - limit working")
    sys.exit(137)
"""
        # Run test and verify exit code 137
        result = run_python_script(script, memory_limit=limit)
        assert result.exit_code == 137, f"Memory limit {limit}MB not enforced"
```

### CPU Limit Tests
Test CPU limit enforcement:

```python
# tests/performance/test_cpu_limits.py
def test_cpu_limit_enforcement():
    """Test that CPU limits are properly enforced"""
    # Test with different CPU limits
    cpu_limits = [25, 50, 75, 100]  # percentage
    
    for limit in cpu_limits:
        # Create CPU-intensive script
        script = f"""
import time
start_time = time.time()
result = 0
for i in range(100000000):  # CPU-intensive loop
    result += i * i
    if i % 10000000 == 0:
        elapsed = time.time() - start_time
        print(f"Progress: {{i/1000000:.1f}}M iterations, {{elapsed:.1f}}s")
print(f"Completed: {{result}}")
"""
        # Run test and verify completion within limits
        result = run_python_script(script, cpu_limit=limit)
        assert result.exit_code == 0, f"CPU limit {limit}% caused failure"
```

### Full Debug+ Resource Tests
Test Full Debug+ diagnostics for resource limits:

```python
# tests/performance/test_resource_limits.py
def test_full_debug_plus_resource_info():
    """Test that Full Debug+ includes resource limit information"""
    script = "print('Hello World')"
    
    result = run_python_script(
        script, 
        debug_mode='full_plus',
        memory_limit=1024,
        cpu_limit=50
    )
    
    # Verify resource limit info in diagnostics
    debug_info = result.full_debug_plus
    assert 'execution' in debug_info
    assert 'resource_limits' in debug_info['execution']
    
    resource_info = debug_info['execution']['resource_limits']
    assert resource_info['memory_limit_mb'] == 1024
    assert resource_info['cpu_limit_percent'] == 50
    assert resource_info['wrapper_script_used'] == True
```

## 📋 Test Categories

### 🔧 Unit Tests
- **Purpose**: Test individual functions and components in isolation
- **Speed**: Fast (< 30 seconds each)
- **Scope**: Single function or class method
- **Examples**: Credentials loading, script generation, variable injection

### 🔗 Integration Tests  
- **Purpose**: Test complete workflows and feature interactions
- **Speed**: Slower (up to 2 minutes each)
- **Scope**: Multiple components working together
- **Examples**: File processing pipeline, output file generation, backward compatibility

### 👤 Functional Tests
- **Purpose**: Test main user-facing features
- **Speed**: Medium (< 1 minute each)  
- **Scope**: User perspective functionality
- **Examples**: Python code execution, configuration options

### ⚡ Performance Tests
- **Purpose**: Test performance and resource usage
- **Speed**: Slow (up to 5 minutes each)
- **Scope**: Load testing, memory usage, large files
- **Examples**: Large file processing, memory leaks

### 📝 TypeScript Tests
- **Purpose**: Test TypeScript/JavaScript node implementation
- **Speed**: Fast (< 1 minute total)
- **Scope**: Node class methods, interfaces, type checking
- **Examples**: Node configuration, method signatures

## 🛠️ Writing New Tests

### Unit Test Template

```python
#!/usr/bin/env python3
"""
Test for [functionality name]
Tests: [list what is tested]
"""

import unittest
import json
import sys
from pathlib import Path

class Test[FunctionalityName](unittest.TestCase):
    
    def setUp(self):
        """Set up test fixtures before each test method."""
        pass
    
    def tearDown(self):
        """Clean up after each test method."""
        pass
    
    def test_[specific_functionality](self):
        """Test [specific functionality] with clear assertions."""
        # Arrange
        input_data = {"test": "data"}
        
        # Act
        result = function_to_test(input_data)
        
        # Assert
        self.assertEqual(result["status"], "success")
        self.assertIn("expected_key", result)

if __name__ == '__main__':
    unittest.main()
```

### Integration Test Template

```python
#!/usr/bin/env python3
"""
Integration test for [feature name]
Tests complete [feature] workflow end-to-end
"""

import json
import tempfile
import os
from pathlib import Path

def test_[feature]_integration():
    """Test complete [feature] integration"""
    print("🧪 Testing [Feature] Integration")
    print("=" * 50)
    
    # Setup test environment
    test_dir = tempfile.mkdtemp(prefix="n8n_test_")
    
    try:
        # Test steps
        print("📋 Step 1: [Description]")
        # Implementation
        
        print("📋 Step 2: [Description]")  
        # Implementation
        
        print("✅ Integration test passed!")
        return True
        
    except Exception as e:
        print(f"❌ Integration test failed: {e}")
        return False
        
    finally:
        # Cleanup
        import shutil
        if os.path.exists(test_dir):
            shutil.rmtree(test_dir)

if __name__ == '__main__':
    success = test_[feature]_integration()
    sys.exit(0 if success else 1)
```

## 📊 Test Results

Test results are automatically saved to `tests/results.json` with detailed information:

```json
{
  "timestamp": "2024-01-01T12:00:00Z",
  "total_tests": 15,
  "passed": 14,
  "failed": 1,
  "categories": {
    "unit": {"passed": 5, "failed": 0},
    "integration": {"passed": 7, "failed": 1},
    "functional": {"passed": 2, "failed": 0}
  },
  "execution_time": 45.2
}
```

## 🔧 Configuration

Test behavior can be configured in `tests/config.json`:

- **Timeouts**: Per-category timeout settings
- **Parallel execution**: Enable/disable parallel test running
- **Environment**: Python/Node executable paths
- **Reporting**: Output format and result saving

## 🚨 Troubleshooting

### Common Issues

1. **Tests not found**: Ensure test files start with `test_` and are in correct category folder
2. **Import errors**: Check that project root is in Python path
3. **Timeout errors**: Increase timeout in `config.json` for slow tests
4. **Permission errors**: Ensure write access to temp directories

### Debug Mode

```bash
# Run with maximum verbosity
python tests/run_all.py --verbose

# Run single test file directly
python tests/unit/test_credentials.py

# Check test discovery
python tests/run_all.py --list
```

## 📈 CI/CD Integration

Tests are designed to work with GitHub Actions and other CI systems:

```yaml
# .github/workflows/tests.yml
name: Test Suite
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Python
        uses: actions/setup-python@v2
        with:
          python-version: '3.8'
      - name: Install dependencies
        run: npm install
      - name: Run Unit Tests
        run: python tests/run_all.py --category unit
      - name: Run Integration Tests
        run: python tests/run_all.py --category integration
```

## 🎯 Best Practices

1. **Test Naming**: Use descriptive names that explain what is being tested
2. **Test Isolation**: Each test should be independent and not rely on others
3. **Clear Assertions**: Use specific assertions with helpful error messages
4. **Cleanup**: Always clean up temporary files and resources
5. **Documentation**: Include docstrings explaining test purpose and scope
6. **Fast Feedback**: Keep unit tests fast for quick development feedback

## 📝 Contributing

When adding new functionality:

1. Write unit tests for individual functions
2. Add integration tests for complete workflows  
3. Update this README if adding new test categories
4. Ensure all tests pass before submitting PR

---

**Version**: 1.13.1  
**Last Updated**: 2024-06-03 