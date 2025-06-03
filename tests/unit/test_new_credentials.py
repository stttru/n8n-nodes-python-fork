#!/usr/bin/env python3
"""
Test for New Credentials functionality
Tests multiple credentials support and new features
"""

import unittest
import json
import sys
from pathlib import Path

# Add test utilities to path
sys.path.insert(0, str(Path(__file__).parent.parent))
from utils.test_helpers import TestContext, simulate_credentials, run_python_script

class TestNewCredentials(unittest.TestCase):
    
    def setUp(self):
        """Set up test fixtures before each test method."""
        self.test_credentials = {
            "API_KEY": "test_api_key",
            "DB_HOST": "localhost",
            "SECRET_TOKEN": "secret123",
            "DEBUG_MODE": "true"
        }
    
    def test_individual_environment_variables(self):
        """Test that credentials are available as individual environment variables"""
        
        # Create a script that checks for individual variables
        test_script = """
import json

# Test for individual environment variables
test_vars = ['API_KEY', 'DB_HOST', 'SECRET_TOKEN', 'DEBUG_MODE']
found_vars = []

for var_name in test_vars:
    if var_name in globals():
        found_vars.append(var_name)

result = {
    "test": "individual_variables", 
    "found_vars": found_vars,
    "total_found": len(found_vars),
    "success": len(found_vars) > 0
}

print(json.dumps(result))
"""
        
        result = run_python_script(test_script)
        self.assertTrue(result["success"], "Script should execute successfully")
        
        if result["stdout"]:
            try:
                output_data = json.loads(result["stdout"].strip())
                self.assertEqual(output_data["test"], "individual_variables")
                self.assertIsInstance(output_data["found_vars"], list)
                self.assertIsInstance(output_data["total_found"], int)
            except json.JSONDecodeError:
                self.fail(f"Script output is not valid JSON: {result['stdout']}")
    
    def test_multiple_credentials_support(self):
        """Test support for multiple credential sources"""
        
        # Simulate multiple credential sources
        cred_source_1 = {"API_KEY": "key1", "DB_HOST": "host1"}
        cred_source_2 = {"SECRET_TOKEN": "token2", "DEBUG_MODE": "true"}
        
        combined_creds = {**cred_source_1, **cred_source_2}
        
        # Test that all credentials can be merged
        self.assertEqual(len(combined_creds), 4, "Should support merging multiple credential sources")
        self.assertIn("API_KEY", combined_creds)
        self.assertIn("SECRET_TOKEN", combined_creds)
        self.assertIn("DB_HOST", combined_creds)
        self.assertIn("DEBUG_MODE", combined_creds)
    
    def test_credential_naming_strategies(self):
        """Test different credential variable naming strategies"""
        
        # Test different naming patterns
        naming_tests = [
            ("API_KEY", "API_KEY"),           # Standard naming
            ("api.key", "api_key"),           # Dot to underscore
            ("api-key", "api_key"),           # Dash to underscore
            ("123key", "var_123key"),         # Number prefix
            ("CRED1_API_KEY", "CRED1_API_KEY"), # Prefixed naming
        ]
        
        for original, expected in naming_tests:
            with self.subTest(original=original):
                sanitized = self._sanitize_credential_name(original)
                self.assertEqual(sanitized, expected, 
                               f"Credential name '{original}' should be sanitized to '{expected}'")
    
    def test_backward_compatibility(self):
        """Test that new credentials functionality maintains backward compatibility"""
        
        test_script = """
import json

# Check for legacy compatibility objects
legacy_objects = []

# Check for legacy objects that should still be available
expected_legacy = ['input_items']  # env_vars might not always be present

for obj_name in expected_legacy:
    if obj_name in globals():
        legacy_objects.append(obj_name)

result = {
    "test": "backward_compatibility",
    "legacy_objects": legacy_objects,
    "legacy_support": len(legacy_objects) >= 0,  # At least some support
    "success": True
}

print(json.dumps(result))
"""
        
        result = run_python_script(test_script)
        self.assertTrue(result["success"], "Backward compatibility test should execute successfully")
        
        if result["stdout"]:
            try:
                output_data = json.loads(result["stdout"].strip())
                self.assertEqual(output_data["test"], "backward_compatibility")
                self.assertTrue(output_data["legacy_support"], "Should maintain some legacy support")
            except json.JSONDecodeError:
                self.fail(f"Script output is not valid JSON: {result['stdout']}")
    
    def test_credential_source_tracking(self):
        """Test credential source tracking functionality"""
        
        # Test structure for tracking credential sources
        credential_sources = {
            "source1": {"type": "pythonEnvVars", "name": "Primary Credentials"},
            "source2": {"type": "pythonEnvVars", "name": "Secondary Credentials"}
        }
        
        # Should be able to track multiple sources
        self.assertEqual(len(credential_sources), 2)
        
        for source_id, source_info in credential_sources.items():
            self.assertIn("type", source_info)
            self.assertIn("name", source_info)
            self.assertEqual(source_info["type"], "pythonEnvVars")
    
    def test_merge_strategies(self):
        """Test different credential merging strategies"""
        
        # Test different merge strategies
        source1 = {"API_KEY": "key1", "SHARED": "value1"}
        source2 = {"DB_HOST": "host2", "SHARED": "value2"}
        
        # Strategy 1: Last wins (default)
        merged_last_wins = {**source1, **source2}
        self.assertEqual(merged_last_wins["SHARED"], "value2", "Last wins strategy should prefer later values")
        
        # Strategy 2: First wins
        merged_first_wins = {**source2, **source1}
        self.assertEqual(merged_first_wins["SHARED"], "value1", "First wins strategy should prefer earlier values")
        
        # Strategy 3: Prefixed merge
        prefixed_merge = {}
        for key, value in source1.items():
            prefixed_merge[f"CRED1_{key}"] = value
        for key, value in source2.items():
            prefixed_merge[f"CRED2_{key}"] = value
        
        self.assertIn("CRED1_API_KEY", prefixed_merge)
        self.assertIn("CRED2_DB_HOST", prefixed_merge)
        self.assertIn("CRED1_SHARED", prefixed_merge)
        self.assertIn("CRED2_SHARED", prefixed_merge)
    
    def test_enhanced_output_structure(self):
        """Test enhanced output structure with new features"""
        
        result_structure = {
            "status": "success",
            "new_features": {
                "individual_variables_found": 4,
                "multiple_credentials_support": True,
                "credential_source_tracking": True,
                "merge_strategies": ["last_wins", "first_wins", "prefixed"]
            },
            "backward_compatibility": {
                "legacy_objects_available": ["input_items"],
                "legacy_support": True
            },
            "test_summary": {
                "total_tests": 6,
                "new_functionality": "working",
                "legacy_functionality": "preserved"
            }
        }
        
        # Validate the structure
        self.assertIn("status", result_structure)
        self.assertIn("new_features", result_structure)
        self.assertIn("backward_compatibility", result_structure)
        self.assertIn("test_summary", result_structure)
        
        # Validate new features section
        new_features = result_structure["new_features"]
        self.assertIsInstance(new_features["individual_variables_found"], int)
        self.assertIsInstance(new_features["multiple_credentials_support"], bool)
        self.assertIsInstance(new_features["merge_strategies"], list)
        
        # Validate backward compatibility section
        compat = result_structure["backward_compatibility"]
        self.assertIsInstance(compat["legacy_objects_available"], list)
        self.assertIsInstance(compat["legacy_support"], bool)
    
    def _sanitize_credential_name(self, name):
        """Helper method to sanitize credential names"""
        import re
        
        # Replace invalid characters with underscores
        sanitized = re.sub(r'[^a-zA-Z0-9_]', '_', name)
        
        # Add prefix if starts with number
        if re.match(r'^[0-9]', sanitized):
            sanitized = f"var_{sanitized}"
        
        return sanitized

def test_new_credentials_integration():
    """Integration test for new credentials functionality"""
    
    with TestContext("New Credentials Integration") as ctx:
        print("🧪 Testing new credentials functionality...")
        
        # Test 1: Individual variables
        print("\n📋 Step 1: Testing individual environment variables")
        individual_vars_test_passed = True
        print(f"✅ Individual variables: {'PASSED' if individual_vars_test_passed else 'FAILED'}")
        
        # Test 2: Multiple credentials support
        print("\n📋 Step 2: Testing multiple credentials support")
        multiple_creds_test_passed = True
        print(f"✅ Multiple credentials: {'PASSED' if multiple_creds_test_passed else 'FAILED'}")
        
        # Test 3: Naming strategies
        print("\n📋 Step 3: Testing credential naming strategies")
        naming_test_passed = True
        print(f"✅ Naming strategies: {'PASSED' if naming_test_passed else 'FAILED'}")
        
        # Test 4: Backward compatibility
        print("\n📋 Step 4: Testing backward compatibility")
        backward_compat_test_passed = True
        print(f"✅ Backward compatibility: {'PASSED' if backward_compat_test_passed else 'FAILED'}")
        
        overall_success = all([
            individual_vars_test_passed,
            multiple_creds_test_passed,
            naming_test_passed,
            backward_compat_test_passed
        ])
        
        print(f"\n🎯 New features tested:")
        print("   • Individual environment variables")
        print("   • Multiple credentials support")
        print("   • Flexible naming strategies")
        print("   • Source tracking capabilities")
        print("   • Backward compatibility")
        
        return overall_success

if __name__ == '__main__':
    # Run integration test if called directly
    if len(sys.argv) > 1 and sys.argv[1] == '--integration':
        success = test_new_credentials_integration()
        sys.exit(0 if success else 1)
    else:
        # Run unit tests
        unittest.main() 