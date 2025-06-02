#!/usr/bin/env python3

import sys
import os
sys.path.append('dist')

from nodes.PythonFunction.PythonFunction_node import getScriptCode

# Test data
test_data = [{"name": "test", "value": 123}]
test_env_vars = {
    "API_KEY": "secret123",
    "DB_HOST": "localhost", 
    "PORT": "5432",
    "SOME-VAR": "with-dashes",
    "123_INVALID": "starts-with-number"
}

print("=== Testing new environment variables functionality ===\n")

# Test with normal variables
print("1. Normal execution (hideVariableValues=False):")
script = getScriptCode("print('Hello world')", test_data, test_env_vars, True, False)
print(script)
print("\n" + "="*60 + "\n")

# Test with hidden variables
print("2. With hidden values (hideVariableValues=True):")
script_hidden = getScriptCode("print('Hello world')", test_data, test_env_vars, True, True)
print(script_hidden)
print("\n" + "="*60 + "\n")

# Test with legacy disabled
print("3. With legacy support disabled (includeLegacyInputItems=False):")
script_no_legacy = getScriptCode("print('Hello world')", test_data, test_env_vars, False, False)
print(script_no_legacy)
print("\n" + "="*60 + "\n")

# Test empty env vars
print("4. With empty environment variables:")
script_empty = getScriptCode("print('Hello world')", test_data, {}, True, False)
print(script_empty) 