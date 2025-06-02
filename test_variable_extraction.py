#!/usr/bin/env python3
# Test script to demonstrate variable extraction
from __future__ import annotations

import json

# This should demonstrate how variables are now extracted:
print("=== VARIABLES EXTRACTED ===")
print(f"Title: {title}")
print(f"SFTP Path: {sftp_path_episode_completed}")
print(f"Description length: {len(description)}")
print(f"Tags: {tags}")

print("\n=== ORIGINAL DATA STILL AVAILABLE ===")
print(f"Input items count: {len(input_items)}")
print(f"First item keys: {list(input_items[0].keys()) if input_items else 'No items'}")

print("\n=== RESULT ===")
result = {
    "extracted_title": title,
    "extracted_path": sftp_path_episode_completed,
    "description_preview": description[:100] + "..." if len(description) > 100 else description,
    "tags_parsed": tags,
    "status": "success"
}

print(json.dumps(result, indent=2, ensure_ascii=False)) 