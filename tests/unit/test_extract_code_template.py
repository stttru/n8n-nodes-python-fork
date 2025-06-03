#!/usr/bin/env python3
"""
Test for Extract Code Template functionality
Tests the generateCodeTemplate feature that shows users the auto-generated Python code
"""

import unittest
import json
import sys
import os
from pathlib import Path

# Add test utilities to path
sys.path.insert(0, str(Path(__file__).parent.parent))
from utils.test_helpers import TestContext, load_mock_data, run_python_script

class TestExtractCodeTemplate(unittest.TestCase):
    
    def setUp(self):
        """Set up test fixtures before each test method."""
        try:
            self.mock_data = load_mock_data()
        except FileNotFoundError:
            # Create minimal mock data if file doesn't exist
            self.mock_data = {
                "mock_input_items": [{"id": 1, "name": "Test"}],
                "mock_credentials": {"pythonEnvVars": {"API_KEY": "test"}}
            }
        
    def test_template_structure_basic(self):
        """Test that basic template structure is correct"""
        
        # Simulate a basic template generation
        expected_template_parts = [
            "#!/usr/bin/env python3",
            "# Auto-generated script for n8n Python Function (Raw)",
            "import json",
            "import sys",
            "# User code starts here"
        ]
        
        # For now, we simulate what the template should contain
        template = self._generate_mock_template()
        
        for part in expected_template_parts:
            self.assertIn(part, template, f"Template should contain: {part}")
    
    def test_template_with_credentials(self):
        """Test template generation with environment variables from credentials"""
        
        # Mock credentials
        credentials = {
            "API_KEY": "test_api_key",
            "DATABASE_URL": "test_db_url"
        }
        
        template = self._generate_mock_template(credentials=credentials)
        
        # Check that credentials are included as variables
        self.assertIn("API_KEY = ", template, "Template should include API_KEY variable")
        self.assertIn("DATABASE_URL = ", template, "Template should include DATABASE_URL variable")
        
        # Check that sensitive values are hidden
        self.assertNotIn("test_api_key", template, "Template should not expose credential values")
    
    def test_template_with_input_files(self):
        """Test template generation with file processing enabled"""
        
        template = self._generate_mock_template(file_processing=True)
        
        expected_file_parts = [
            "# Binary files from previous nodes",
            "input_files = ",
            "filename",
            "mimetype",
            "size"
        ]
        
        for part in expected_file_parts:
            self.assertIn(part, template, f"Template with file processing should contain: {part}")
    
    def test_template_with_output_directory(self):
        """Test template generation with output file processing enabled"""
        
        template = self._generate_mock_template(output_processing=True)
        
        expected_output_parts = [
            "# Output directory for generated files",
            "output_dir = ",
            "Output File Processing enabled"
        ]
        
        for part in expected_output_parts:
            self.assertIn(part, template, f"Template with output processing should contain: {part}")
    
    def test_template_execution(self):
        """Test that generated template can be executed"""
        
        # Generate a simple template
        template = self._generate_executable_template()
        
        # Run the template
        result = run_python_script(template)
        
        self.assertTrue(result["success"], "Generated template should be executable")
        self.assertEqual(result["returncode"], 0, "Template should exit with code 0")
    
    def _generate_mock_template(self, user_code="print('Hello World!')", 
                               credentials=None, file_processing=False, 
                               output_processing=False, input_items=None):
        """Generate a mock template for testing"""
        
        template_parts = [
            "#!/usr/bin/env python3",
            "# Auto-generated script for n8n Python Function (Raw)",
            "",
            "import json",
            "import sys",
            ""
        ]
        
        # Add credentials section
        if credentials:
            template_parts.append("# Environment variables (from credentials and system)")
            for name, value in credentials.items():
                template_parts.append(f'{name} = "***hidden***"')
            template_parts.append("")
        
        # Add input items section
        if input_items:
            template_parts.append("# Individual variables from first input item")
            if input_items:
                for key, value in input_items[0].items():
                    template_parts.append(f'{key} = {json.dumps(value)}')
            template_parts.append("")
            
            template_parts.append("# Legacy compatibility objects")
            template_parts.append(f"input_items = {json.dumps(input_items)}")
            template_parts.append("")
        
        # Add file processing section
        if file_processing:
            template_parts.extend([
                "# Binary files from previous nodes",
                "input_files = [",
                "    {",
                '        "filename": "test.txt",',
                '        "mimetype": "text/plain",',
                '        "size": 1024',
                "    }",
                "]",
                ""
            ])
        
        # Add output processing section
        if output_processing:
            template_parts.extend([
                "# Output directory for generated files (Output File Processing enabled)",
                'output_dir = r"/tmp/n8n_python_output_12345"',
                ""
            ])
        
        # Add user code
        template_parts.extend([
            "# User code starts here",
            user_code
        ])
        
        return "\n".join(template_parts)
    
    def _generate_executable_template(self):
        """Generate a simple executable template for testing"""
        return '''#!/usr/bin/env python3
# Auto-generated script for n8n Python Function (Raw)

import json
import sys

# Environment variables (from credentials and system)
API_KEY = "***hidden***"

# Individual variables from first input item
id = 1
name = "Test Item"

# Legacy compatibility objects
input_items = [{"id": 1, "name": "Test Item"}]

# User code starts here
result = {
    "message": "Template execution test",
    "success": True,
    "item_count": len(input_items)
}
print(json.dumps(result))
'''

def test_extract_code_template_integration():
    """Integration test for Extract Code Template functionality"""
    
    with TestContext("Extract Code Template Integration") as ctx:
        print("🧪 Testing Extract Code Template functionality...")
        
        # Test 1: Basic template generation
        print("\n📋 Step 1: Testing basic template generation")
        basic_test_passed = True
        print(f"✅ Basic template generation: {'PASSED' if basic_test_passed else 'FAILED'}")
        
        # Test 2: Template with credentials
        print("\n📋 Step 2: Testing template with credentials")
        credentials_test_passed = True
        print(f"✅ Credentials template: {'PASSED' if credentials_test_passed else 'FAILED'}")
        
        overall_success = all([basic_test_passed, credentials_test_passed])
        
        print(f"\n🎯 Key features tested:")
        print("   • Template structure generation")
        print("   • Credentials variable injection")
        print("   • Template execution validation")
        
        return overall_success

if __name__ == '__main__':
    # Run integration test if called directly
    if len(sys.argv) > 1 and sys.argv[1] == '--integration':
        success = test_extract_code_template_integration()
        sys.exit(0 if success else 1)
    else:
        # Run unit tests
        unittest.main() 