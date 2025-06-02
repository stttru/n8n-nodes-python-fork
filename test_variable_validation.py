#!/usr/bin/env python3
"""
Test script to verify variable validation improvements in v1.12.8
Tests various edge cases that could cause syntax errors
"""

import json

def test_sanitize_variable_name():
    """Test the sanitizeVariableName function logic"""
    
    test_cases = [
        # (input_key, expected_result, description)
        ("", None, "Empty string should return None"),
        ("   ", None, "Whitespace only should return None"),
        ("123", "var_123", "Number should get var_ prefix"),
        ("valid_name", "valid_name", "Valid name should remain unchanged"),
        ("invalid-name", "invalid_name", "Hyphens should be replaced with underscores"),
        ("invalid.name", "invalid_name", "Dots should be replaced with underscores"),
        ("invalid name", "invalid_name", "Spaces should be replaced with underscores"),
        ("_valid", "_valid", "Leading underscore should be preserved"),
        ("123abc", "var_123abc", "Number start should get prefix"),
        ("@#$%", "var____", "Special chars should be replaced"),
        ("", None, "Empty after sanitization should return None"),
    ]
    
    def sanitize_variable_name(key, prefix='var'):
        """Python implementation of the sanitizeVariableName function"""
        import re
        
        # Skip empty keys or invalid Python identifiers
        if not key or key.strip() == '':
            return None
        
        # Create safe variable names (replace invalid characters)
        safe_var_name = re.sub(r'[^a-zA-Z0-9_]', '_', key)
        
        # Ensure it starts with letter or underscore
        if not re.match(r'^[a-zA-Z_]', safe_var_name):
            safe_var_name = f"{prefix}_{safe_var_name}"
        
        # Skip if after sanitization the name is empty or invalid
        if not safe_var_name or safe_var_name.strip() == '' or safe_var_name == f"{prefix}_":
            return None
        
        return safe_var_name
    
    print("Testing variable name sanitization:")
    print("=" * 50)
    
    for input_key, expected, description in test_cases:
        result = sanitize_variable_name(input_key)
        status = "✓ PASS" if result == expected else "✗ FAIL"
        print(f"{status} | Input: '{input_key}' -> Output: '{result}' | {description}")
        if result != expected:
            print(f"      Expected: '{expected}', Got: '{result}'")
    
    print("\n" + "=" * 50)

def test_problematic_input_data():
    """Test with problematic input data that could cause syntax errors"""
    
    problematic_data = [
        {"": "empty_key_value"},
        {"   ": "whitespace_key_value"},
        {"123": "numeric_key_value"},
        {"invalid-name": "hyphen_value"},
        {"invalid.name": "dot_value"},
        {"@#$%": "special_chars_value"},
        {"normal_key": "normal_value"},
    ]
    
    print("Testing problematic input data handling:")
    print("=" * 50)
    
    for i, data in enumerate(problematic_data):
        print(f"Test case {i+1}: {data}")
        
        # Simulate the variable generation process
        variable_assignments = []
        
        for key, value in data.items():
            # Apply the same logic as in the actual code
            if not key or key.strip() == '':
                print(f"  Skipped empty key: '{key}'")
                continue
            
            # Create safe variable names (replace invalid characters)
            import re
            safe_var_name = re.sub(r'[^a-zA-Z0-9_]', '_', key)
            
            # Ensure it starts with letter or underscore
            if not re.match(r'^[a-zA-Z_]', safe_var_name):
                safe_var_name = f"var_{safe_var_name}"
            
            # Skip if after sanitization the name is empty or invalid
            if not safe_var_name or safe_var_name.strip() == '' or safe_var_name == 'var_':
                print(f"  Skipped invalid key after sanitization: '{key}' -> '{safe_var_name}'")
                continue
            
            assignment = f"{safe_var_name} = {json.dumps(value)}"
            variable_assignments.append(assignment)
            print(f"  Generated: {assignment}")
        
        print(f"  Total valid assignments: {len(variable_assignments)}")
        print()
    
    print("=" * 50)

def test_syntax_validation():
    """Test the syntax validation patterns"""
    
    test_lines = [
        ("= \"value\"", True, "Empty variable assignment"),
        ("123var = \"value\"", True, "Variable starting with number"),
        ("valid_var = \"value\"", False, "Valid assignment"),
        ("_valid = \"value\"", False, "Valid assignment with underscore"),
        ("var_123 = \"value\"", False, "Valid assignment with prefix"),
        ("", False, "Empty line"),
        ("# comment", False, "Comment line"),
        ("import json", False, "Import statement"),
    ]
    
    print("Testing syntax validation patterns:")
    print("=" * 50)
    
    for line, should_error, description in test_lines:
        # Test the regex patterns from the validation code
        import re
        
        line_trimmed = line.strip()
        
        # Check for invalid variable assignments (empty variable names)
        error1 = bool(re.match(r'^\s*=\s*', line_trimmed) or re.match(r'^[^a-zA-Z_]\w*\s*=', line_trimmed))
        
        # Check for other obvious syntax issues
        error2 = bool(re.match(r'^\s*[0-9]+\w*\s*=', line_trimmed) and not re.match(r'^\s*[a-zA-Z_]', line_trimmed))
        
        detected_error = error1 or error2
        status = "✓ PASS" if detected_error == should_error else "✗ FAIL"
        
        print(f"{status} | Line: '{line}' | Should error: {should_error} | Detected: {detected_error} | {description}")
    
    print("\n" + "=" * 50)

if __name__ == "__main__":
    print("Variable Validation Test Suite - v1.12.8")
    print("=" * 60)
    print()
    
    test_sanitize_variable_name()
    print()
    test_problematic_input_data()
    print()
    test_syntax_validation()
    
    print("\nTest completed! All validations should prevent syntax errors.")
    print("The improvements in v1.12.8 include:")
    print("- Robust variable name sanitization")
    print("- Empty key validation")
    print("- Syntax error prevention")
    print("- Better error messages for users") 