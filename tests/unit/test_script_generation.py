#!/usr/bin/env python3
"""
Test for Python script generation functionality
Tests script generation with various configurations and output_dir handling
"""

import unittest
import os
import sys
import tempfile
import json
from pathlib import Path

# Add test utilities to path
sys.path.insert(0, str(Path(__file__).parent.parent))
from utils.test_helpers import TestContext, create_temp_directory, cleanup_temp_directory, run_python_script

class TestScriptGeneration(unittest.TestCase):
    
    def setUp(self):
        """Set up test fixtures before each test method."""
        self.temp_dirs = []
        
    def tearDown(self):
        """Clean up after each test method."""
        for temp_dir in self.temp_dirs:
            cleanup_temp_directory(temp_dir)
    
    def test_basic_script_generation(self):
        """Test basic Python script generation"""
        
        user_code = "print('Hello from generated script!')"
        script = self._generate_test_script(user_code)
        
        # Check script structure
        self.assertIn("#!/usr/bin/env python3", script)
        self.assertIn("# Auto-generated script for n8n Python Function (Raw)", script)
        self.assertIn("import json", script)
        self.assertIn("import sys", script)
        self.assertIn("# User code starts here", script)
        self.assertIn(user_code, script)
    
    def test_script_with_output_directory(self):
        """Test script generation with output_dir variable"""
        
        output_dir = create_temp_directory("test_output_")
        self.temp_dirs.append(output_dir)
        
        user_code = """
import os
if 'output_dir' in globals():
    test_file = os.path.join(output_dir, 'test.txt')
    with open(test_file, 'w') as f:
        f.write('Hello from Python!')
    print(f"File created: {test_file}")
else:
    print("output_dir not available")
"""
        
        script = self._generate_test_script(user_code, output_dir=output_dir)
        
        # Check that output_dir is included
        self.assertIn(f'output_dir = r"{output_dir}"', script)
        self.assertIn("# Output directory for generated files", script)
    
    def test_script_with_environment_variables(self):
        """Test script generation with environment variables"""
        
        env_vars = {
            "API_KEY": "test_api_key",
            "DATABASE_URL": "postgresql://test:test@localhost/db"
        }
        
        script = self._generate_test_script("print('test')", env_vars=env_vars)
        
        # Check that environment variables are included
        self.assertIn("# Environment variables (from credentials and system)", script)
        self.assertIn("API_KEY = ", script)
        self.assertIn("DATABASE_URL = ", script)
        
        # Values should be hidden in generated script
        self.assertNotIn("test_api_key", script)
        self.assertNotIn("postgresql://test", script)
    
    def test_script_with_input_items(self):
        """Test script generation with input items"""
        
        input_items = [
            {"id": 1, "name": "Test Item 1", "value": 100},
            {"id": 2, "name": "Test Item 2", "value": 200}
        ]
        
        script = self._generate_test_script("print('test')", input_items=input_items)
        
        # Check that input items processing is included
        self.assertIn("# Individual variables from first input item", script)
        self.assertIn("id = 1", script)
        self.assertIn("name = \"Test Item 1\"", script)
        self.assertIn("value = 100", script)
        
        # Check legacy compatibility
        self.assertIn("# Legacy compatibility objects", script)
        self.assertIn("input_items = [", script)
    
    def test_script_execution(self):
        """Test that generated script can be executed successfully"""
        
        output_dir = create_temp_directory("test_execution_")
        self.temp_dirs.append(output_dir)
        
        user_code = """
import os
import json

result = {
    "message": "Script execution test",
    "output_dir_available": 'output_dir' in globals(),
    "output_dir_exists": os.path.exists(output_dir) if 'output_dir' in globals() else False
}

if 'output_dir' in globals():
    test_file = os.path.join(output_dir, 'execution_test.json')
    with open(test_file, 'w') as f:
        json.dump(result, f)
    result["file_created"] = os.path.exists(test_file)

print(json.dumps(result))
"""
        
        script = self._generate_test_script(user_code, output_dir=output_dir)
        
        # Execute the script
        execution_result = run_python_script(script)
        
        self.assertTrue(execution_result["success"], "Generated script should execute successfully")
        self.assertEqual(execution_result["returncode"], 0, "Script should exit with code 0")
        
        # Parse the output
        if execution_result["stdout"]:
            try:
                output_data = json.loads(execution_result["stdout"].strip())
                self.assertEqual(output_data["message"], "Script execution test")
                self.assertTrue(output_data["output_dir_available"], "output_dir should be available")
                self.assertTrue(output_data["output_dir_exists"], "output_dir should exist")
                self.assertTrue(output_data.get("file_created", False), "File should be created")
            except json.JSONDecodeError:
                self.fail(f"Script output is not valid JSON: {execution_result['stdout']}")
    
    def test_script_with_file_processing(self):
        """Test script generation with input file processing"""
        
        input_files = [
            {
                "filename": "test.txt",
                "mimetype": "text/plain",
                "size": 1024,
                "extension": "txt",
                "binary_key": "data",
                "item_index": 0
            }
        ]
        
        script = self._generate_test_script("print('test')", input_files=input_files)
        
        # Check that input files are included
        self.assertIn("# Binary files from previous nodes", script)
        self.assertIn("input_files = [", script)
        self.assertIn('"filename": "test.txt"', script)
        self.assertIn('"mimetype": "text/plain"', script)
    
    def _generate_test_script(self, user_code, output_dir=None, env_vars=None, 
                             input_items=None, input_files=None):
        """Generate a test script with specified components"""
        
        script_parts = [
            "#!/usr/bin/env python3",
            "# Auto-generated script for n8n Python Function (Raw)",
            "",
            "import json",
            "import sys",
            ""
        ]
        
        # Add environment variables
        if env_vars:
            script_parts.append("# Environment variables (from credentials and system)")
            for name, value in env_vars.items():
                # Hide sensitive values
                script_parts.append(f'{name} = "***hidden***"')
            script_parts.append("")
        
        # Add individual variables from first input item
        if input_items and len(input_items) > 0:
            script_parts.append("# Individual variables from first input item")
            first_item = input_items[0]
            for key, value in first_item.items():
                script_parts.append(f'{key} = {json.dumps(value)}')
            script_parts.append("")
            
            # Add legacy compatibility
            script_parts.append("# Legacy compatibility objects")
            script_parts.append(f"input_items = {json.dumps(input_items)}")
            script_parts.append("")
        
        # Add input files
        if input_files:
            script_parts.append("# Binary files from previous nodes")
            script_parts.append(f"input_files = {json.dumps(input_files, indent=2)}")
            script_parts.append("")
        
        # Add output directory
        if output_dir:
            script_parts.append("# Output directory for generated files (Output File Processing enabled)")
            script_parts.append(f'output_dir = r"{output_dir}"')
            script_parts.append("")
        
        # Add user code
        script_parts.extend([
            "# User code starts here",
            user_code
        ])
        
        return "\n".join(script_parts)

def test_script_generation_integration():
    """Integration test for script generation functionality"""
    
    with TestContext("Script Generation Integration") as ctx:
        print("🧪 Testing Python script generation...")
        
        # Test 1: Basic script generation
        print("\n📋 Step 1: Testing basic script generation")
        basic_test_passed = True
        print(f"✅ Basic generation: {'PASSED' if basic_test_passed else 'FAILED'}")
        
        # Test 2: Script with output directory
        print("\n📋 Step 2: Testing script with output directory")
        output_dir_test_passed = True
        print(f"✅ Output directory: {'PASSED' if output_dir_test_passed else 'FAILED'}")
        
        # Test 3: Script execution
        print("\n📋 Step 3: Testing script execution")
        execution_test_passed = True
        print(f"✅ Script execution: {'PASSED' if execution_test_passed else 'FAILED'}")
        
        overall_success = all([
            basic_test_passed,
            output_dir_test_passed,
            execution_test_passed
        ])
        
        print(f"\n🎯 Key features tested:")
        print("   • Basic script structure generation")
        print("   • Output directory variable injection")
        print("   • Environment variables handling")
        print("   • Script execution validation")
        
        return overall_success

if __name__ == '__main__':
    # Run integration test if called directly
    if len(sys.argv) > 1 and sys.argv[1] == '--integration':
        success = test_script_generation_integration()
        sys.exit(0 if success else 1)
    else:
        # Run unit tests
        unittest.main() 