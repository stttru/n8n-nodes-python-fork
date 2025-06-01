#!/usr/bin/env python3

import fire
import json
import sys

def test_function(items):
    """
    Тестовая функция для проверки работы python-fire
    """
    print("Python setup working correctly!")
    print(f"Received items: {items}")
    
    # Трансформируем данные
    result = []
    for item in items:
        new_item = dict(item)
        new_item['processed'] = True
        new_item['test_field'] = 'Hello from Python!'
        result.append(new_item)
    
    return result

if __name__ == '__main__':
    # Тестовые данные
    test_items = [
        {'id': 1, 'name': 'Test Item 1'},
        {'id': 2, 'name': 'Test Item 2'}
    ]
    
    result = test_function(test_items)
    print(f"Result: {json.dumps(result, indent=2)}") 