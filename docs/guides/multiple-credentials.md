# Multiple Credentials Support Guide

## Overview

Version 1.9.0 introduces support for multiple Python Environment Variables credentials in the Python Function (Raw) node. This allows you to combine environment variables from different credential sources in a single Python script execution.

## Full Debug+ Integration (v1.19.0+)

### Credential Diagnostics
Full Debug+ mode provides comprehensive credential information:

```json
{
  "full_debug_plus": {
    "data_sources": {
      "credentials": {
        "enabled": true,
        "credential_type": "pythonEnvVars",
        "credential_connected": true,
        "credential_id": "cred_123",
        "credential_name": "My API Credentials",
        "raw_credential_data_keys": ["API_KEY", "DB_HOST", "DB_PASSWORD"],
        "envFileContent_exists": true,
        "envFileContent_length": 156,
        "envFileContent_lines_count": 3,
        "envFileContent_preview_first_3_lines": [
          "API_KEY=sk-1234567890abcdef",
          "DB_HOST=localhost",
          "DB_PASSWORD=***hidden***"
        ],
        "parsing_attempted": true,
        "parsing_successful": true,
        "variables_parsed": 3,
        "variable_names": ["API_KEY", "DB_HOST", "DB_PASSWORD"]
      }
    }
  }
}
```

### Security Features
- **Hide Variable Values**: Sensitive data replaced with `***hidden***` in exported files
- **Credential Preview**: First 3 lines shown with sensitive values hidden
- **Parsing Status**: Shows if credentials were parsed successfully

### Troubleshooting Credentials
Use Full Debug+ to diagnose credential issues:
1. Enable Full Debug+ mode
2. Check `data_sources.credentials` section
3. Verify `credential_connected` and `parsing_successful`
4. Check `variable_names` for expected variables

## Features

### 1. Credentials Management Section

A new "Credentials Management" section has been added above the Python Code field, providing:

- **Python Environment Variables**: Multi-select dropdown for choosing specific credentials
- **Include All Available Credentials**: Checkbox to automatically include all available credentials
- **Credential Merge Strategy**: Options for handling variable name conflicts

### 2. Merge Strategies

When multiple credentials contain variables with the same name, you can choose how to handle conflicts:

#### Last Selected Wins (Default)
```python
# If both Credential A and B have API_KEY:
# Credential A: API_KEY = "key_from_a"
# Credential B: API_KEY = "key_from_b"
# Result: API_KEY = "key_from_b"
```

#### First Selected Wins
```python
# Same scenario as above
# Result: API_KEY = "key_from_a"
```

#### Prefix with Credential Name
```python
# Same scenario as above
# Result: 
# CREDENTIAL_A_API_KEY = "key_from_a"
# CREDENTIAL_B_API_KEY = "key_from_b"
```

### 3. Enhanced Script Generation

Generated Python scripts now include source information:

```python
#!/usr/bin/env python3
# Auto-generated script for n8n Python Function (Raw)

import json
import sys

# Environment variables (from credentials and system)
# From: Production API Keys
API_KEY = "prod_key_123"
DB_HOST = "prod.database.com"

# From: Development Settings
DEV_API_KEY = "dev_key_456"
DEBUG_MODE = "true"

# From: system_environment
PATH = "/usr/local/bin:/usr/bin"

# User code starts here
print(f"Using API Key: {API_KEY}")
print(f"Database: {DB_HOST}")
```

## Usage Examples

### Example 1: Basic Multiple Credentials

1. Create two Python Environment Variables credentials:
   - "Production APIs" with `API_KEY=prod123` and `DB_HOST=prod.db.com`
   - "External Services" with `WEBHOOK_URL=https://api.service.com` and `SECRET=abc123`

2. In the Credentials Management section:
   - Select both credentials in the dropdown
   - Choose "Last Selected Wins" strategy
   - Leave "Include All Available Credentials" unchecked

3. Your Python script can now access:
   ```python
   print(f"API: {API_KEY}")           # prod123
   print(f"DB: {DB_HOST}")            # prod.db.com
   print(f"Webhook: {WEBHOOK_URL}")   # https://api.service.com
   print(f"Secret: {SECRET}")         # abc123
   ```

### Example 2: Handling Name Conflicts

If you have credentials with conflicting variable names:

1. Credential "Service A": `API_KEY=service_a_key`
2. Credential "Service B": `API_KEY=service_b_key`

Using "Prefix with Credential Name" strategy:
```python
print(f"Service A: {SERVICE_A_API_KEY}")  # service_a_key
print(f"Service B: {SERVICE_B_API_KEY}")  # service_b_key
```

### Example 3: Include All Available

Enable "Include All Available Credentials" to automatically include all Python Environment Variables credentials without manual selection.

## Backward Compatibility

- Existing workflows continue to work without changes
- If no credentials are selected in the new section, the node falls back to the original single credential behavior
- All existing options and functionality remain unchanged

## Technical Implementation

### Current Limitations

Due to n8n API limitations, the current implementation:
- Uses a placeholder dropdown for credential selection
- Simulates multiple credential loading using the default credential
- Provides a framework ready for future n8n API enhancements

### Future Enhancements

When n8n exposes advanced credential management APIs:
- True multiple credential selection will be available
- Dynamic credential discovery and listing
- Enhanced credential management features

## Configuration Options

### Credentials Management Collection

```typescript
{
  pythonEnvVarsList: string[],        // Selected credential IDs
  includeAllCredentials: boolean,     // Auto-include all credentials
  mergeStrategy: 'last_wins' | 'first_wins' | 'prefix'
}
```

### Merge Strategy Details

- **last_wins**: Later credentials override earlier ones for same variable names
- **first_wins**: Earlier credentials take precedence for same variable names  
- **prefix**: Add credential name prefix to avoid conflicts

## Debug Information

When using debug modes, credential source information is included:

```json
{
  "debug_info": {
    "credential_sources": {
      "API_KEY": "Production APIs",
      "DB_HOST": "Production APIs", 
      "WEBHOOK_URL": "External Services"
    }
  }
}
```

This helps track which credential provided each environment variable. 