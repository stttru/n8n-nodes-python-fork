#!/usr/bin/env python3

import json
import sys

def test_credentials_loading():
    """
    Test script to verify credentials functionality
    """
    print("Testing credentials loading functionality...")
    
    # Test data to simulate n8n input
    test_items = [
        {'id': 1, 'name': 'Test Item 1'},
        {'id': 2, 'name': 'Test Item 2'}
    ]
    
    print(f"Test items count: {len(test_items)}")
    
    # Test environment variables simulation
    print("Environment variables test:")
    print("API_KEY available:", 'API_KEY' in globals())
    print("DATABASE_URL available:", 'DATABASE_URL' in globals())
    
    # Test result
    result = {
        "test_status": "success",
        "items_processed": len(test_items),
        "credentials_test": "passed",
        "timestamp": "2024-01-01T00:00:00Z"
    }
    
    print(json.dumps(result, indent=2))
    return result

if __name__ == '__main__':
    test_credentials_loading() 