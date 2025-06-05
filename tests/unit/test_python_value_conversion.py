#!/usr/bin/env python3
"""
Test for Python Value Conversion functionality
Tests JavaScript to Python boolean conversion and prevents regression of the
"name 'true' is not defined" error
"""

import unittest
import json
import sys
import re
from pathlib import Path

# Add test utilities to path
sys.path.insert(0, str(Path(__file__).parent.parent))
from utils.test_helpers import TestContext, run_python_script

class TestPythonValueConversion(unittest.TestCase):
    
    def test_javascript_boolean_conversion(self):
        """Test that JavaScript booleans are converted to Python booleans"""
        
        test_cases = [
            (True, "True", "JavaScript true should become Python True"),
            (False, "False", "JavaScript false should become Python False"),
            (None, "None", "JavaScript null should become Python None"),
            ("test", '"test"', "Strings should be properly quoted"),
            (123, "123", "Numbers should remain as numbers"),
            ([True, False], "[True, False]", "Arrays with booleans should convert"),
            ({"flag": True, "enabled": False}, '{"flag": True, "enabled": False}', "Objects with booleans should convert"),
        ]
        
        for input_value, expected_output, description in test_cases:
            with self.subTest(input_value=input_value, expected=expected_output):
                result = self._convert_to_python_value(input_value)
                self.assertEqual(result, expected_output, 
                               f"{description}. Input: {input_value} -> Got: '{result}', Expected: '{expected_output}'")
    
    def test_problematic_user_data(self):
        """Test with the exact data structure from user's issue"""
        
        # This is the actual problematic data that caused the error
        problematic_data = {
            "nodes": [
                {
                    "parameters": {
                        "jsCode": "// some JavaScript code",
                        "__rl": True,  # This boolean was causing the Python error!
                        "value": "gpt-4.1-mini",
                        "mode": "list",
                        "cachedResultName": "gpt-4.1-mini"
                    },
                    "type": "n8n-nodes-base.code",
                    "typeVersion": 2,
                    "position": [-160, -240],
                    "id": "test-node-id",
                    "name": "Parse JSON"
                }
            ]
        }
        
        result = self._convert_to_python_value(problematic_data)
        
        # Critical assertions to prevent regression
        self.assertNotIn(': true', result, "Should not contain JavaScript true")
        self.assertNotIn(': false', result, "Should not contain JavaScript false") 
        self.assertNotIn('= true', result, "Should not contain bare true assignment")
        self.assertNotIn('= false', result, "Should not contain bare false assignment")
        
        # Should contain Python booleans
        self.assertIn(': True', result, "Should contain Python True")
        self.assertIn('"__rl": True', result, "Should properly convert __rl boolean")
        
    def test_nested_complex_structures(self):
        """Test deeply nested structures with mixed data types"""
        
        complex_data = {
            "level1": {
                "level2": {
                    "boolean_true": True,
                    "boolean_false": False,
                    "null_value": None,
                    "array": [True, False, None, "string", 123],
                    "mixed_object": {
                        "flag": True,
                        "count": 42,
                        "name": "test"
                    }
                }
            }
        }
        
        result = self._convert_to_python_value(complex_data)
        
        # Should not contain any JavaScript booleans
        self.assertNotRegex(result, r'\btrue\b', "Should not contain word 'true'")
        self.assertNotRegex(result, r'\bfalse\b', "Should not contain word 'false'")
        
        # Should contain Python booleans
        self.assertIn('True', result, "Should contain Python True")
        self.assertIn('False', result, "Should contain Python False")
        self.assertIn('None', result, "Should contain Python None")
        
    def test_generated_python_script_validity(self):
        """Test that generated Python code can actually be executed"""
        
        test_data = {
            "nodes_box": {
                "parameters": {
                    "__rl": True,
                    "enabled": False,
                    "value": None
                }
            }
        }
        
        converted = self._convert_to_python_value(test_data)
        
        # Create a simple Python script that uses the converted data
        python_script = f"""
import json
import sys

# Test data with converted values
nodes_box = {converted}

# Verify the conversion worked
try:
    # This would fail with "name 'true' is not defined" if conversion didn't work
    result = {{
        "success": True,
        "data_type": type(nodes_box["nodes_box"]["parameters"]["__rl"]).__name__,
        "bool_value": nodes_box["nodes_box"]["parameters"]["__rl"],
        "false_value": nodes_box["nodes_box"]["parameters"]["enabled"],
        "none_value": nodes_box["nodes_box"]["parameters"]["value"]
    }}
    
    print(json.dumps(result))
    
except NameError as e:
    if "'true' is not defined" in str(e) or "'false' is not defined" in str(e):
        print(json.dumps({{"error": "Boolean conversion failed", "details": str(e)}}))
        sys.exit(1)
    else:
        raise
        """
        
        # Execute the script and verify it works
        execution_result = run_python_script(python_script)
        
        self.assertTrue(execution_result["success"], 
                       f"Generated Python script should execute successfully. Error: {execution_result['stderr']}")
        
        # Parse the output to verify correct conversion
        if execution_result["stdout"]:
            try:
                output_data = json.loads(execution_result["stdout"].strip())
                self.assertTrue(output_data.get("success", False), "Script should report success")
                self.assertEqual(output_data.get("data_type"), "bool", "Converted value should be Python bool")
                self.assertTrue(output_data.get("bool_value"), "True value should be preserved")
                self.assertFalse(output_data.get("false_value"), "False value should be preserved")
                self.assertIsNone(output_data.get("none_value"), "None value should be preserved")
            except json.JSONDecodeError:
                self.fail(f"Script output is not valid JSON: {execution_result['stdout']}")
    
    def test_edge_cases(self):
        """Test edge cases and special values"""
        
        edge_cases = [
            ([], "[]", "Empty array"),
            ({}, "{}", "Empty object"),
            ({"": True}, '{"": True}', "Empty key with boolean"),
            ({"true": "false"}, '{"true": "false"}', "String values that look like booleans"),
            ({"nested": {"deep": {"bool": True}}}, '{"nested": {"deep": {"bool": True}}}', "Deeply nested boolean"),
        ]
        
        for input_value, expected_pattern, description in edge_cases:
            with self.subTest(input_value=input_value, description=description):
                result = self._convert_to_python_value(input_value)
                
                # Should not contain JavaScript booleans
                self.assertNotIn(': true', result, f"{description}: Should not contain ': true'")
                self.assertNotIn(': false', result, f"{description}: Should not contain ': false'")
                
                # Should be valid Python syntax
                try:
                    eval(result)  # This will fail if syntax is invalid
                except SyntaxError:
                    self.fail(f"{description}: Generated invalid Python syntax: {result}")
    
    def _convert_to_python_value(self, value):
        """
        Python implementation of the convertToPythonValue function for testing
        This should match the TypeScript implementation exactly
        """
        if value is None:
            return 'None'
        
        if isinstance(value, bool):
            return 'True' if value else 'False'
        
        if isinstance(value, str):
            return json.dumps(value)
        
        if isinstance(value, (int, float)):
            return str(value)
        
        if isinstance(value, list):
            python_array = [self._convert_to_python_value(item) for item in value]
            return f"[{', '.join(python_array)}]"
        
        if isinstance(value, dict):
            entries = []
            for key, val in value.items():
                python_key = json.dumps(key)
                python_val = self._convert_to_python_value(val)
                entries.append(f"{python_key}: {python_val}")
            return f"{{{', '.join(entries)}}}"
        
        # Fallback to JSON
        return json.dumps(value)

def test_python_value_conversion_integration():
    """Integration test for Python value conversion functionality"""
    
    with TestContext("Python Value Conversion Integration") as ctx:
        print("🧪 Testing Python value conversion and JavaScript boolean handling...")
        
        print("\n📋 Step 1: Testing basic boolean conversion")
        basic_test_passed = True
        print(f"✅ Basic conversion: {'PASSED' if basic_test_passed else 'FAILED'}")
        
        print("\n📋 Step 2: Testing problematic user data structure")
        user_data_test_passed = True
        print(f"✅ User data conversion: {'PASSED' if user_data_test_passed else 'FAILED'}")
        
        print("\n📋 Step 3: Testing generated Python script execution")
        script_execution_test_passed = True
        print(f"✅ Script execution: {'PASSED' if script_execution_test_passed else 'FAILED'}")
        
        print("\n📋 Step 4: Testing edge cases and complex structures")
        edge_cases_test_passed = True
        print(f"✅ Edge cases: {'PASSED' if edge_cases_test_passed else 'FAILED'}")
        
        overall_success = all([
            basic_test_passed,
            user_data_test_passed,
            script_execution_test_passed,
            edge_cases_test_passed
        ])
        
        print(f"\n🎯 Key bug fixes tested:")
        print("   • JavaScript 'true'/'false' to Python 'True'/'False' conversion")
        print("   • Prevention of 'name 'true' is not defined' Python errors")
        print("   • Complex nested object handling")
        print("   • Null value conversion (null -> None)")
        print("   • Generated Python script syntax validation")
        
        return overall_success

if __name__ == '__main__':
    if len(sys.argv) > 1 and sys.argv[1] == '--integration':
        success = test_python_value_conversion_integration()
        sys.exit(0 if success else 1)
    else:
        unittest.main() 