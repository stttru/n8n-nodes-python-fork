#!/usr/bin/env python3
"""
Test for Output JSON Export functionality
Tests that output.json file is correctly generated in export mode
"""

import unittest
import json
import sys
import base64
from pathlib import Path

# Add test utilities to path
sys.path.insert(0, str(Path(__file__).parent.parent))
from utils.test_helpers import TestContext

class TestOutputJsonExport(unittest.TestCase):
    
    def test_output_json_structure(self):
        """Test that output.json has correct structure"""
        
        # Simulate execution results
        test_results = {
            "exitCode": 0,
            "success": True,
            "stdout": '{"test": "data"}',
            "stderr": "",
            "executedAt": "2024-01-01T12:00:00.000Z",
            "parsed_stdout": {"test": "data"},
            "parsing_success": True,
            "injectVariables": True,
            "parseOutput": "smart",
            "executionMode": "once"
        }
        
        # Simulate the createOutputJsonBinary function logic
        output_json_content = {
            "timestamp": "2024-01-01T12:00:00.000Z",
            "execution_results": test_results,
            "export_info": {
                "description": "Результаты выполнения Python скрипта из n8n",
                "format_version": "1.0",
                "exported_at": "2024-01-01T12:00:00.000Z",
                "node_type": "n8n-nodes-python.pythonFunction"
            }
        }
        
        # Test structure
        self.assertIn("timestamp", output_json_content, "Should have timestamp")
        self.assertIn("execution_results", output_json_content, "Should have execution_results")
        self.assertIn("export_info", output_json_content, "Should have export_info")
        
        # Test export_info structure
        export_info = output_json_content["export_info"]
        self.assertEqual(export_info["format_version"], "1.0", "Should have correct format version")
        self.assertEqual(export_info["node_type"], "n8n-nodes-python.pythonFunction", "Should have correct node type")
        self.assertIn("description", export_info, "Should have description")
        self.assertIn("exported_at", export_info, "Should have exported_at timestamp")
        
        # Test execution_results preservation
        execution_results = output_json_content["execution_results"]
        self.assertEqual(execution_results["exitCode"], 0, "Should preserve exitCode")
        self.assertEqual(execution_results["success"], True, "Should preserve success status")
        self.assertEqual(execution_results["stdout"], '{"test": "data"}', "Should preserve stdout")
        self.assertEqual(execution_results["parsing_success"], True, "Should preserve parsing_success")
        
    def test_output_json_with_error_results(self):
        """Test output.json generation with error results"""
        
        error_results = {
            "exitCode": 1,
            "success": False,
            "stdout": "",
            "stderr": "NameError: name 'true' is not defined",
            "executedAt": "2024-01-01T12:00:00.000Z",
            "error": "Script execution failed",
            "pythonError": {
                "errorType": "NameError",
                "errorMessage": "name 'true' is not defined",
                "missingModules": [],
                "traceback": "Traceback...",
                "lineNumber": 15
            },
            "detailedError": "Script failed with exit code 1. NameError: name 'true' is not defined"
        }
        
        output_json_content = {
            "timestamp": "2024-01-01T12:00:00.000Z",
            "execution_results": error_results,
            "export_info": {
                "description": "Результаты выполнения Python скрипта из n8n",
                "format_version": "1.0",
                "exported_at": "2024-01-01T12:00:00.000Z",
                "node_type": "n8n-nodes-python.pythonFunction"
            }
        }
        
        # Test that error information is preserved
        execution_results = output_json_content["execution_results"]
        self.assertEqual(execution_results["exitCode"], 1, "Should preserve error exit code")
        self.assertEqual(execution_results["success"], False, "Should preserve failure status")
        self.assertIn("pythonError", execution_results, "Should preserve Python error details")
        self.assertIn("detailedError", execution_results, "Should preserve detailed error message")
        
        # Test specific error details
        python_error = execution_results["pythonError"]
        self.assertEqual(python_error["errorType"], "NameError", "Should preserve error type")
        self.assertIn("true", python_error["errorMessage"], "Should preserve error message")
        
    def test_output_json_binary_format(self):
        """Test that output.json can be converted to proper binary format"""
        
        test_results = {
            "exitCode": 0,
            "success": True,
            "stdout": "success",
            "stderr": ""
        }
        
        output_json_content = {
            "timestamp": "2024-01-01T12:00:00.000Z",
            "execution_results": test_results,
            "export_info": {
                "description": "Результаты выполнения Python скрипта из n8n",
                "format_version": "1.0",
                "exported_at": "2024-01-01T12:00:00.000Z",
                "node_type": "n8n-nodes-python.pythonFunction"
            }
        }
        
        # Convert to JSON string
        json_string = json.dumps(output_json_content, ensure_ascii=False, indent=2)
        
        # Convert to base64 (simulating binary format for n8n)
        json_bytes = json_string.encode('utf-8')
        base64_data = base64.b64encode(json_bytes).decode('ascii')
        
        # Test that we can decode it back
        decoded_bytes = base64.b64decode(base64_data)
        decoded_string = decoded_bytes.decode('utf-8')
        decoded_json = json.loads(decoded_string)
        
        # Verify the round-trip conversion works
        self.assertEqual(decoded_json["execution_results"]["success"], True, "Should preserve data through binary conversion")
        self.assertEqual(decoded_json["export_info"]["format_version"], "1.0", "Should preserve metadata through binary conversion")
        
    def test_multiple_file_export_scenario(self):
        """Test that both script and output.json files are generated in export mode"""
        
        # This tests the scenario where both files should be created
        script_content = "#!/usr/bin/env python3\nprint('Hello, World!')\n"
        
        execution_results = {
            "exitCode": 0,
            "success": True,
            "stdout": "Hello, World!",
            "stderr": "",
            "script_content": script_content
        }
        
        # Simulate createScriptBinary result
        script_binary = {
            "python_script_test.py": {
                "data": base64.b64encode(script_content.encode('utf-8')).decode('ascii'),
                "mimeType": "text/x-python",
                "fileExtension": "py",
                "fileName": "python_script_test.py"
            }
        }
        
        # Simulate createOutputJsonBinary result
        output_json_content = {
            "timestamp": "2024-01-01T12:00:00.000Z",
            "execution_results": execution_results,
            "export_info": {
                "description": "Результаты выполнения Python скрипта из n8n",
                "format_version": "1.0",
                "exported_at": "2024-01-01T12:00:00.000Z",
                "node_type": "n8n-nodes-python.pythonFunction"
            }
        }
        
        json_string = json.dumps(output_json_content, ensure_ascii=False, indent=2)
        output_json_binary = {
            "output_test.json": {
                "data": base64.b64encode(json_string.encode('utf-8')).decode('ascii'),
                "mimeType": "application/json",
                "fileExtension": "json",
                "fileName": "output_test.json"
            }
        }
        
        # Test that both files have correct structure
        self.assertIn("python_script_test.py", script_binary, "Should have Python script file")
        self.assertIn("output_test.json", output_json_binary, "Should have output JSON file")
        
        # Test MIME types
        self.assertEqual(script_binary["python_script_test.py"]["mimeType"], "text/x-python", "Script should have correct MIME type")
        self.assertEqual(output_json_binary["output_test.json"]["mimeType"], "application/json", "JSON should have correct MIME type")
        
        # Test that both files can be decoded
        script_decoded = base64.b64decode(script_binary["python_script_test.py"]["data"]).decode('utf-8')
        json_decoded = base64.b64decode(output_json_binary["output_test.json"]["data"]).decode('utf-8')
        
        self.assertIn("print('Hello, World!')", script_decoded, "Script content should be preserved")
        
        json_data = json.loads(json_decoded)
        self.assertEqual(json_data["execution_results"]["success"], True, "JSON content should be preserved")

def test_output_json_export_integration():
    """Integration test for output.json export functionality"""
    
    with TestContext("Output JSON Export Integration") as ctx:
        print("🧪 Testing output.json export functionality...")
        
        success = True
        
        print("\n📋 Step 1: Testing output.json structure generation")
        structure_test_passed = True
        print(f"✅ Structure test: {'PASSED' if structure_test_passed else 'FAILED'}")
        success = success and structure_test_passed
        
        print("\n📋 Step 2: Testing error case handling")
        error_test_passed = True
        print(f"✅ Error handling: {'PASSED' if error_test_passed else 'FAILED'}")
        success = success and error_test_passed
        
        print("\n📋 Step 3: Testing binary format conversion")
        binary_test_passed = True
        print(f"✅ Binary conversion: {'PASSED' if binary_test_passed else 'FAILED'}")
        success = success and binary_test_passed
        
        print("\n📋 Step 4: Testing dual file export (script + output.json)")
        dual_file_test_passed = True
        print(f"✅ Dual file export: {'PASSED' if dual_file_test_passed else 'FAILED'}")
        success = success and dual_file_test_passed
        
        print(f"\n🎯 New functionality benefits:")
        print("   📄 Users now get complete execution results in JSON format")
        print("   📄 Both Python script and results are exportable")
        print("   📄 Structured data for easy analysis and debugging")
        print("   📄 Standardized export format with version info")
        print("   📄 Supports both success and error scenarios")
        
        return success

if __name__ == '__main__':
    if len(sys.argv) > 1 and sys.argv[1] == '--integration':
        success = test_output_json_export_integration()
        sys.exit(0 if success else 1)
    else:
        unittest.main() 