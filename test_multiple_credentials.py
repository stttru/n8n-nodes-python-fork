#!/usr/bin/env python3

import json
import sys

def test_multiple_credentials():
    """
    Test script to verify multiple credentials functionality
    """
    print("Testing multiple credentials functionality...")
    
    # Test available variables
    test_variables = [
        'API_KEY', 
        'DATABASE_URL', 
        'SECRET_TOKEN', 
        'WEBHOOK_URL',
        'API1_KEY',  # with prefix
        'PROD_DATABASE_URL',  # with prefix
    ]
    
    found_variables = []
    for var_name in test_variables:
        if var_name in globals():
            found_variables.append(var_name)
            print(f"✓ Found variable: {var_name}")
        else:
            print(f"✗ Missing variable: {var_name}")
    
    # Test result
    result = {
        "test_status": "success",
        "found_variables": found_variables,
        "total_variables_found": len(found_variables),
        "expected_variables": test_variables,
        "multiple_credentials_test": "passed" if len(found_variables) > 0 else "failed",
        "message": f"Successfully found {len(found_variables)} variables from credentials"
    }
    
    print(json.dumps(result, indent=2))
    return result

if __name__ == '__main__':
    test_multiple_credentials() 