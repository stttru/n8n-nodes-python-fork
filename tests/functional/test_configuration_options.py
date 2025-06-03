#!/usr/bin/env python3

def test_flexible_script_generation(code_snippet, data, env_vars, include_input_items=True, include_env_vars_dict=False, hide_values=False):
    """Test the new flexible script generation logic"""
    
    # Environment variables as individual variables (always included when env_vars exist)
    env_variables_section = ''
    if len(env_vars) > 0:
        env_variable_assignments = []
        
        for key, value in env_vars.items():
            safe_var_name = ''.join(c if c.isalnum() or c == '_' else '_' for c in key)
            if not (safe_var_name[0].isalpha() or safe_var_name[0] == '_'):
                safe_var_name = f'env_{safe_var_name}'
            
            display_value = '"***hidden***"' if hide_values else repr(value)
            env_variable_assignments.append(f'{safe_var_name} = {display_value}')
        
        if env_variable_assignments:
            env_variables_section = f'''
# Environment variables (from credentials and system)
{chr(10).join(env_variable_assignments)}
'''

    # Individual variables from first item
    individual_variables = ''
    if data:
        first_item = data[0]
        variable_assignments = []
        
        for key, value in first_item.items():
            safe_var_name = ''.join(c if c.isalnum() or c == '_' else '_' for c in key)
            display_value = '"***hidden***"' if hide_values else repr(value)
            variable_assignments.append(f'{safe_var_name} = {display_value}')
        
        if variable_assignments:
            individual_variables = f'''
# Individual variables from first input item
{chr(10).join(variable_assignments)}
'''

    # Legacy compatibility objects - now flexible!
    legacy_data_section = ''
    if include_input_items or include_env_vars_dict:
        legacy_parts = []
        
        if include_input_items:
            input_items_value = '"***hidden***"' if hide_values else repr(data)
            legacy_parts.append(f'input_items = {input_items_value}')
        
        if include_env_vars_dict:
            env_vars_value = '"***hidden***"' if hide_values else repr(env_vars)
            legacy_parts.append(f'env_vars = {env_vars_value}')
        
        if legacy_parts:
            legacy_data_section = f'''
# Legacy compatibility objects
{chr(10).join(legacy_parts)}'''

    script = f'''#!/usr/bin/env python3
# Auto-generated script for n8n Python Function (Raw)

import json
import sys
{env_variables_section}{individual_variables}{legacy_data_section}
# User code starts here
{code_snippet}
'''
    return script

# Test data
test_data = [{"name": "test", "value": 123}]
test_env_vars = {"API_KEY": "secret123", "DB_HOST": "localhost", "PORT": "5432"}

print("=== Testing NEW FLEXIBLE Script Generation ===")
print()

# Test 1: Default (input_items=True, env_vars_dict=False)
print("1. DEFAULT SETTINGS:")
print("   input_items=ON, env_vars_dict=OFF")
script = test_flexible_script_generation("print('Hello world')", test_data, test_env_vars, True, False, False)
print(script)
print("="*60)
print()

# Test 2: Both legacy objects
print("2. BOTH LEGACY OBJECTS:")
print("   input_items=ON, env_vars_dict=ON")
script = test_flexible_script_generation("print('Hello world')", test_data, test_env_vars, True, True, False)
print(script)
print("="*60)
print()

# Test 3: Only env_vars dict
print("3. ONLY ENV_VARS DICT:")
print("   input_items=OFF, env_vars_dict=ON")
script = test_flexible_script_generation("print('Hello world')", test_data, test_env_vars, False, True, False)
print(script)
print("="*60)
print()

# Test 4: No legacy objects
print("4. NO LEGACY OBJECTS:")
print("   input_items=OFF, env_vars_dict=OFF")
script = test_flexible_script_generation("print('Hello world')", test_data, test_env_vars, False, False, False)
print(script)
print("="*60)
print()

# Test 5: Hidden values
print("5. HIDDEN VALUES:")
print("   input_items=ON, env_vars_dict=ON, hide=ON")
script = test_flexible_script_generation("print('Hello world')", test_data, test_env_vars, True, True, True)
print(script) 