#!/usr/bin/env python3
"""
Test Helpers and Utilities

Common functions and utilities used across different test categories.
"""

import json
import tempfile
import os
import base64
from pathlib import Path
from typing import Dict, List, Any, Optional

def load_mock_data(filename: str = "mock_n8n_data.json") -> Dict[str, Any]:
    """Load mock data from fixtures directory"""
    fixtures_dir = Path(__file__).parent.parent / "fixtures"
    mock_file = fixtures_dir / filename
    
    if not mock_file.exists():
        raise FileNotFoundError(f"Mock data file not found: {mock_file}")
    
    with open(mock_file, 'r', encoding='utf-8') as f:
        return json.load(f)

def create_temp_directory(prefix: str = "n8n_test_") -> str:
    """Create a temporary directory for testing"""
    return tempfile.mkdtemp(prefix=prefix)

def cleanup_temp_directory(temp_dir: str) -> bool:
    """Clean up temporary directory"""
    try:
        import shutil
        if os.path.exists(temp_dir):
            shutil.rmtree(temp_dir)
        return True
    except Exception:
        return False

def create_test_file(directory: str, filename: str, content: str) -> str:
    """Create a test file with specified content"""
    file_path = os.path.join(directory, filename)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    return file_path

def create_binary_test_file(directory: str, filename: str, content: bytes) -> str:
    """Create a binary test file"""
    file_path = os.path.join(directory, filename)
    with open(file_path, 'wb') as f:
        f.write(content)
    return file_path

def encode_file_to_base64(file_path: str) -> str:
    """Encode file content to base64"""
    with open(file_path, 'rb') as f:
        content = f.read()
    return base64.b64encode(content).decode('ascii')

def simulate_n8n_input_items(count: int = 2) -> List[Dict[str, Any]]:
    """Generate simulated n8n input items"""
    items = []
    for i in range(count):
        item = {
            "json": {
                "id": i + 1,
                "name": f"Test Item {i + 1}",
                "value": (i + 1) * 100,
                "category": "test"
            },
            "binary": {}
        }
        items.append(item)
    return items

def simulate_credentials(credential_names: List[str] = None) -> Dict[str, str]:
    """Generate simulated credentials"""
    if credential_names is None:
        credential_names = ["API_KEY", "DATABASE_URL", "SECRET_TOKEN"]
    
    credentials = {}
    for name in credential_names:
        credentials[name] = f"test_{name.lower()}_value"
    
    return credentials

def assert_file_exists(file_path: str, message: str = None) -> bool:
    """Assert that a file exists"""
    if not os.path.exists(file_path):
        error_msg = message or f"File does not exist: {file_path}"
        raise AssertionError(error_msg)
    return True

def assert_file_content(file_path: str, expected_content: str, message: str = None) -> bool:
    """Assert file content matches expected"""
    assert_file_exists(file_path)
    
    with open(file_path, 'r', encoding='utf-8') as f:
        actual_content = f.read()
    
    if actual_content != expected_content:
        error_msg = message or f"File content mismatch in {file_path}"
        raise AssertionError(error_msg)
    
    return True

def assert_json_structure(data: Dict[str, Any], required_keys: List[str], message: str = None) -> bool:
    """Assert that JSON data has required structure"""
    missing_keys = [key for key in required_keys if key not in data]
    
    if missing_keys:
        error_msg = message or f"Missing required keys: {missing_keys}"
        raise AssertionError(error_msg)
    
    return True

def run_python_script(script_content: str, timeout: int = 30) -> Dict[str, Any]:
    """Run Python script and return result"""
    import subprocess
    import sys
    
    # Create temporary script file
    temp_dir = create_temp_directory()
    script_path = os.path.join(temp_dir, "test_script.py")
    
    try:
        with open(script_path, 'w', encoding='utf-8') as f:
            f.write(script_content)
        
        # Run script
        result = subprocess.run(
            [sys.executable, script_path],
            capture_output=True,
            text=True,
            timeout=timeout
        )
        
        return {
            "returncode": result.returncode,
            "stdout": result.stdout,
            "stderr": result.stderr,
            "success": result.returncode == 0
        }
        
    finally:
        cleanup_temp_directory(temp_dir)

def measure_execution_time(func, *args, **kwargs) -> tuple:
    """Measure function execution time"""
    import time
    
    start_time = time.time()
    result = func(*args, **kwargs)
    execution_time = time.time() - start_time
    
    return result, execution_time

def print_test_header(test_name: str, description: str = None):
    """Print formatted test header"""
    print(f"\n{'='*60}")
    print(f"🧪 {test_name}")
    if description:
        print(f"📝 {description}")
    print(f"{'='*60}")

def print_test_step(step_number: int, description: str):
    """Print formatted test step"""
    print(f"\n📋 Step {step_number}: {description}")

def print_test_result(success: bool, message: str = None):
    """Print formatted test result"""
    status = "✅ PASS" if success else "❌ FAIL"
    if message:
        print(f"{status} {message}")
    else:
        print(status)

class TestContext:
    """Context manager for test setup and cleanup"""
    
    def __init__(self, test_name: str):
        self.test_name = test_name
        self.temp_dirs = []
        self.temp_files = []
    
    def __enter__(self):
        print_test_header(self.test_name)
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        # Cleanup temporary resources
        for temp_dir in self.temp_dirs:
            cleanup_temp_directory(temp_dir)
        
        for temp_file in self.temp_files:
            try:
                if os.path.exists(temp_file):
                    os.unlink(temp_file)
            except Exception:
                pass
        
        if exc_type is None:
            print_test_result(True, f"{self.test_name} completed successfully")
        else:
            print_test_result(False, f"{self.test_name} failed: {exc_val}")
    
    def create_temp_dir(self, prefix: str = "test_") -> str:
        """Create and track temporary directory"""
        temp_dir = create_temp_directory(prefix)
        self.temp_dirs.append(temp_dir)
        return temp_dir
    
    def create_temp_file(self, content: str, suffix: str = ".py") -> str:
        """Create and track temporary file"""
        import tempfile
        fd, temp_file = tempfile.mkstemp(suffix=suffix, text=True)
        try:
            with os.fdopen(fd, 'w') as f:
                f.write(content)
        except:
            os.close(fd)
            raise
        
        self.temp_files.append(temp_file)
        return temp_file 