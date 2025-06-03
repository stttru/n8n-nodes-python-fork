#!/usr/bin/env python3

import fire
import json
import sys

def test_function(items):
    """
    Test function to verify python-fire functionality
    """
    print("Python setup working correctly!")
    print(f"Received items: {items}")
    
    # Transform data
    result = []
    for item in items:
        new_item = dict(item)
        new_item['processed'] = True
        new_item['test_field'] = 'Hello from Python!'
        result.append(new_item)
    
    return result

if __name__ == '__main__':
    # Test data
    test_items = [
        {'id': 1, 'name': 'Test Item 1'},
        {'id': 2, 'name': 'Test Item 2'}
    ]
    
    result = test_function(test_items)
    print(f"Result: {json.dumps(result, indent=2)}") 