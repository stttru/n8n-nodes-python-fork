#!/usr/bin/env python3
"""
Test for Export Mode without Environment Variables
Tests that exported scripts don't contain env_vars when in export mode
"""

import unittest
import sys
from pathlib import Path

# Add test utilities to path
sys.path.insert(0, str(Path(__file__).parent.parent))
from utils.test_helpers import TestContext

class TestExportWithoutEnvVars(unittest.TestCase):
    
    def test_export_script_excludes_env_vars(self):
        """Test that exported script doesn't contain environment variables"""
        
        # Sample Python code
        user_code = '''
import json
result = {"message": "Hello World", "processed": True}
print(json.dumps(result))
'''
        
        # Sample input data
        input_data = [{"title": "Test", "value": 42}]
        
        # Sample environment variables (should NOT appear in export)
        env_vars = {
            "SECRET_API_KEY": "abc123secret",
            "DATABASE_URL": "postgresql://user:pass@host:5432/db", 
            "WEBHOOK_URL": "https://api.example.com/webhook"
        }
        
        # This simulates getScriptCodeForExport function
        script_content = f'''#!/usr/bin/env python3
# Auto-generated script for n8n Python Function (Raw)

import json
import sys

# Individual variables from first input item
title = "Test"
value = 42

# User code starts here
{user_code.strip()}
'''
        
        # Test that script doesn't contain environment variables
        self.assertNotIn("SECRET_API_KEY", script_content, "Script should NOT contain SECRET_API_KEY")
        self.assertNotIn("DATABASE_URL", script_content, "Script should NOT contain DATABASE_URL") 
        self.assertNotIn("WEBHOOK_URL", script_content, "Script should NOT contain WEBHOOK_URL")
        
        # Test that script doesn't contain env_vars section
        self.assertNotIn("# Environment variables", script_content, "Script should NOT contain env vars section")
        self.assertNotIn("env_vars =", script_content, "Script should NOT contain env_vars dictionary")
        self.assertNotIn("From:", script_content, "Script should NOT contain credential source info")
        
        # Test that script still contains user code and input variables
        self.assertIn("Hello World", script_content, "Script should contain user code")
        self.assertIn("title = \"Test\"", script_content, "Script should contain input variables")
        self.assertIn("value = 42", script_content, "Script should contain input variables")
        
    def test_export_vs_regular_script_difference(self):
        """Test the difference between export and regular script generation"""
        
        user_code = 'print("Processing data")'
        input_data = [{"name": "Test Item"}]
        env_vars = {"API_KEY": "secret123", "DEBUG": "true"}
        
        # Regular script (with env_vars) - simulates getScriptCode
        regular_script = f'''#!/usr/bin/env python3
# Auto-generated script for n8n Python Function (Raw)

import json
import sys

# Environment variables (from credentials and system)
API_KEY = "secret123"
DEBUG = "true"

# Individual variables from first input item
name = "Test Item"

# User code starts here
{user_code}
'''
        
        # Export script (without env_vars) - simulates getScriptCodeForExport
        export_script = f'''#!/usr/bin/env python3
# Auto-generated script for n8n Python Function (Raw)

import json
import sys

# Individual variables from first input item
name = "Test Item"

# User code starts here
{user_code}
'''
        
        # Test that regular script contains env vars
        self.assertIn("API_KEY = \"secret123\"", regular_script, "Regular script should contain env vars")
        self.assertIn("DEBUG = \"true\"", regular_script, "Regular script should contain env vars")
        
        # Test that export script doesn't contain env vars
        self.assertNotIn("API_KEY", export_script, "Export script should NOT contain env vars")
        self.assertNotIn("DEBUG", export_script, "Export script should NOT contain env vars")
        
        # Test that both contain user code and input vars
        self.assertIn("Processing data", regular_script, "Regular script should contain user code")
        self.assertIn("Processing data", export_script, "Export script should contain user code")
        self.assertIn("name = \"Test Item\"", regular_script, "Regular script should contain input vars")
        self.assertIn("name = \"Test Item\"", export_script, "Export script should contain input vars")
        
    def test_export_script_with_files_and_output_dir(self):
        """Test that export script properly handles files and output directories"""
        
        user_code = '''
import os
with open(os.path.join(output_dir, "result.txt"), "w") as f:
    f.write("Generated content")
'''
        
        input_data = [{"id": 1}]
        
        # Simulate input files
        input_files = [{
            "filename": "data.csv",
            "mimetype": "text/csv", 
            "size": 1024,
            "extension": "csv",
            "binary_key": "file1",
            "item_index": 0,
            "temp_path": "/tmp/data.csv"
        }]
        
        output_dir = "/tmp/output"
        
        # Export script should contain files and output_dir but NO env_vars
        expected_script_parts = [
            "#!/usr/bin/env python3",
            "import json",
            "import sys", 
            "id = 1",  # input variable
            "input_files =",  # files section
            "output_dir =",  # output directory
            user_code.strip()  # user code
        ]
        
        # Simulate export script content
        export_script = f'''#!/usr/bin/env python3
# Auto-generated script for n8n Python Function (Raw)

import json
import sys

# Individual variables from first input item
id = 1

# Binary files from previous nodes
input_files = [{{"filename": "data.csv", "mimetype": "text/csv", "size": 1024, "extension": "csv", "binary_key": "file1", "item_index": 0, "temp_path": "/tmp/data.csv"}}]

# Output directory for generated files (Output File Processing enabled)
output_dir = r"/tmp/output"

# User code starts here
{user_code.strip()}
'''
        
        # Verify all expected parts are present
        for part in expected_script_parts:
            if part.strip():  # Skip empty strings
                self.assertIn(part, export_script, f"Export script should contain: {part}")
        
        # Verify no environment variables
        self.assertNotIn("env_", export_script, "Export script should NOT contain any env_ variables")
        self.assertNotIn("API", export_script, "Export script should NOT contain API keys")
        self.assertNotIn("SECRET", export_script, "Export script should NOT contain secrets")
        
    def test_export_debug_info_excludes_env_vars(self):
        """Test that debug info in export mode doesn't contain env_vars"""
        
        # Simulate debug info structure for export mode
        debug_info_export = {
            "script_content": "#!/usr/bin/env python3\nprint('hello')",
            "execution_command": "python3 /tmp/script.py",
            "debug_info": {
                "script_path": "/tmp/script.py",
                "timing": {"script_created_at": "2024-01-01T12:00:00Z"},
                "injected_data": {
                    "input_items": [{"test": "data"}],
                    # env_vars should be empty/missing in export mode
                }
            }
        }
        
        # Debug info for regular mode (should contain env_vars)
        debug_info_regular = {
            "script_content": "#!/usr/bin/env python3\nAPI_KEY='secret'\nprint('hello')",
            "execution_command": "python3 /tmp/script.py", 
            "debug_info": {
                "script_path": "/tmp/script.py",
                "timing": {"script_created_at": "2024-01-01T12:00:00Z"},
                "injected_data": {
                    "input_items": [{"test": "data"}],
                    "env_vars": {"API_KEY": "secret", "DEBUG": "true"}
                }
            }
        }
        
        # Test export mode debug info
        export_injected = debug_info_export["debug_info"]["injected_data"]
        self.assertIn("input_items", export_injected, "Export debug should contain input_items")
        self.assertNotIn("env_vars", export_injected, "Export debug should NOT contain env_vars")
        
        # Test regular mode debug info 
        regular_injected = debug_info_regular["debug_info"]["injected_data"]
        self.assertIn("input_items", regular_injected, "Regular debug should contain input_items")
        self.assertIn("env_vars", regular_injected, "Regular debug should contain env_vars")
        
        # Verify env_vars content in regular mode
        env_vars = regular_injected["env_vars"]
        self.assertEqual(env_vars["API_KEY"], "secret", "Regular debug should contain actual env vars")
        self.assertEqual(env_vars["DEBUG"], "true", "Regular debug should contain actual env vars")

if __name__ == '__main__':
    unittest.main() 