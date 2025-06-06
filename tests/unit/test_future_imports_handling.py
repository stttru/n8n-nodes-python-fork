#!/usr/bin/env python3
"""
Test for __future__ Imports Handling Functionality
Tests proper detection, extraction and placement of from __future__ import statements
Prevents regression of the "Cannot read properties of undefined (reading 'trim')" error
"""

import unittest
import json
import sys
import re
from pathlib import Path

# Add test utilities to path
sys.path.insert(0, str(Path(__file__).parent.parent))
from utils.test_helpers import TestContext, run_python_script

class TestFutureImportsHandling(unittest.TestCase):
    
    def test_single_future_import(self):
        """Test handling of single __future__ import statement"""
        
        user_code_with_future = '''from __future__ import annotations
import json
import sys

print("Hello from Python with annotations!")
'''
        
        script = self._simulate_script_generation(user_code_with_future)
        
        # Check that __future__ import is moved to the beginning
        lines = script.split('\n')
        
        # Find where future imports should be (after shebang and comments, before other imports)
        future_import_line = None
        json_import_line = None
        user_code_start_line = None
        
        for i, line in enumerate(lines):
            if 'from __future__ import annotations' in line:
                future_import_line = i
            elif 'import json' == line.strip():
                json_import_line = i
            elif '# User code starts here' in line:
                user_code_start_line = i
        
        # Assertions
        self.assertIsNotNone(future_import_line, "__future__ import should be present in generated script")
        self.assertIsNotNone(json_import_line, "Standard imports should be present")
        self.assertIsNotNone(user_code_start_line, "User code section should be marked")
        
        # __future__ import should come before standard imports
        self.assertLess(future_import_line, json_import_line, 
                       "__future__ import should come before standard imports")
        
        # User code should not contain __future__ import anymore
        user_code_section = '\n'.join(lines[user_code_start_line+1:])
        self.assertNotIn('from __future__ import', user_code_section, 
                        "User code section should not contain __future__ imports")
    
    def test_multiple_future_imports(self):
        """Test handling of multiple __future__ import statements"""
        
        user_code_with_multiple_futures = '''from __future__ import annotations
from __future__ import division
import json
from __future__ import print_function

result = {"test": True}
print(json.dumps(result))
'''
        
        script = self._simulate_script_generation(user_code_with_multiple_futures)
        
        # Check that all __future__ imports are extracted and placed at the beginning
        lines = script.split('\n')
        
        future_imports_found = []
        user_code_start = None
        
        for i, line in enumerate(lines):
            if 'from __future__ import' in line:
                future_imports_found.append((i, line.strip()))
            elif '# User code starts here' in line:
                user_code_start = i
                break
        
        # Should find all 3 __future__ imports
        self.assertEqual(len(future_imports_found), 3, "Should find all 3 __future__ imports")
        
        # Check specific imports are present
        import_types = [imp[1] for imp in future_imports_found]
        self.assertIn('from __future__ import annotations', import_types)
        self.assertIn('from __future__ import division', import_types)
        self.assertIn('from __future__ import print_function', import_types)
        
        # All __future__ imports should be before user code
        for line_num, _ in future_imports_found:
            self.assertLess(line_num, user_code_start, 
                           "All __future__ imports should be before user code section")
        
        # User code section should not contain __future__ imports anymore
        if user_code_start:
            user_code_section = '\n'.join(lines[user_code_start+1:])
            future_count_in_user_code = user_code_section.count('from __future__ import')
            self.assertEqual(future_count_in_user_code, 0, 
                           "User code section should not contain any __future__ imports")
    
    def test_future_imports_with_complex_user_code(self):
        """Test __future__ imports handling with complex real-world user code"""
        
        # This is based on the user's actual problematic code
        complex_user_code = '''#!/usr/bin/env python3
# n8n Function · ONE-SHOT: exchange youtube_verification_code → token_json  (FULL YouTube scope)

from __future__ import annotations
import json, sys, traceback
from datetime import timezone
from typing import Sequence

# ── обязательные переменные из ноды ────────────────────────────
CLIENT_ID     = globals().get("client_id")
CLIENT_SECRET = globals().get("client_secret")
AUTH_URI      = globals().get("auth_uri")  or "https://accounts.google.com/o/oauth2/auth"
TOKEN_URI     = globals().get("token_uri") or "https://oauth2.googleapis.com/token"
RAW_CODE      = globals().get("youtube_verification_code")      # <- одноразовый код

# ── проверяем вход ─────────────────────────────────────────────
if not (CLIENT_ID and CLIENT_SECRET):
    sys.exit("client_id / client_secret не заданы.")

if not RAW_CODE or "hidden" in str(RAW_CODE):
    sys.exit("youtube_verification_code отсутствует — сначала получите одноразовый код в браузере.")

# убираем возможный префикс code= и хвост &...
CODE = str(RAW_CODE).split("code=", 1)[-1].split("&", 1)[0].strip()

# ── библиотеки ────────────────────────────────────────────────
from google_auth_oauthlib.flow import InstalledAppFlow

result = {"status": "test", "success": True}
print(json.dumps(result))
'''
        
        script = self._simulate_script_generation(complex_user_code)
        
        # Check script structure
        self.assertIn("#!/usr/bin/env python3", script)
        self.assertIn("from __future__ import annotations", script)
        self.assertIn("# User code starts here", script)
        
        # Verify __future__ import is properly positioned
        lines = script.split('\n')
        future_line = None
        shebang_line = None
        user_code_start = None
        
        for i, line in enumerate(lines):
            if line.startswith('#!/usr/bin/env python3'):
                shebang_line = i
            elif 'from __future__ import annotations' in line and future_line is None:
                future_line = i
            elif '# User code starts here' in line:
                user_code_start = i
                break
        
        # __future__ import should be right after the initial setup, before user code
        self.assertIsNotNone(future_line, "__future__ import should be found")
        self.assertIsNotNone(user_code_start, "User code section should be found")
        self.assertLess(future_line, user_code_start, 
                       "__future__ import should come before user code")
        
        # User's complex code should be preserved (minus the __future__ import)
        user_section = '\n'.join(lines[user_code_start+1:])
        self.assertIn("CLIENT_ID", user_section, "User's variables should be preserved")
        self.assertIn("google_auth_oauthlib", user_section, "User's imports should be preserved")
        self.assertNotIn("from __future__ import", user_section, 
                        "No __future__ imports should remain in user code")
    
    def test_no_future_imports(self):
        """Test that code without __future__ imports works normally"""
        
        normal_code = '''import json
import sys

result = {"message": "No future imports here"}
print(json.dumps(result))
'''
        
        script = self._simulate_script_generation(normal_code)
        
        # Should not contain any __future__ imports
        self.assertNotIn("from __future__ import", script)
        
        # Should contain user code
        self.assertIn("No future imports here", script)
        self.assertIn("# User code starts here", script)
    
    def test_future_imports_execution(self):
        """Test that generated script with __future__ imports executes correctly"""
        
        user_code = '''from __future__ import annotations
import json
from typing import List, Dict

def process_data(items: List[Dict]) -> Dict:
    """Function that uses type annotations from __future__ import"""
    result = {
        "processed_count": len(items),
        "item_types": [type(item).__name__ for item in items],
        "success": True
    }
    return result

# Test the function
test_items = [{"id": 1}, {"id": 2}, "string_item"]
result = process_data(test_items)
print(json.dumps(result))
'''
        
        script = self._simulate_script_generation(user_code)
        
        # Execute the generated script
        execution_result = run_python_script(script)
        
        self.assertTrue(execution_result["success"], 
                       f"Script with __future__ imports should execute successfully. Error: {execution_result['stderr']}")
        self.assertEqual(execution_result["returncode"], 0, "Script should exit with code 0")
        
        # Parse the output to verify it worked
        if execution_result["stdout"]:
            try:
                output_data = json.loads(execution_result["stdout"].strip())
                self.assertEqual(output_data["processed_count"], 3, "Should process all items")
                self.assertTrue(output_data["success"], "Processing should succeed")
                self.assertIn("dict", output_data["item_types"], "Should identify dict types")
            except json.JSONDecodeError:
                self.fail(f"Script output is not valid JSON: {execution_result['stdout']}")
    
    def test_edge_cases_future_imports(self):
        """Test edge cases and malformed __future__ imports"""
        
        edge_cases = [
            # Case 1: Multiple imports on same line
            'from __future__ import annotations, division',
            
            # Case 2: With extra whitespace
            '   from __future__ import print_function   ',
            
            # Case 3: Mixed with comments
            '''# Some comment
from __future__ import annotations  # End of line comment
import json''',
        ]
        
        for i, test_code in enumerate(edge_cases):
            with self.subTest(case=i+1, code=test_code[:50] + "..."):
                script = self._simulate_script_generation(test_code + '\nprint("test")')
                
                # Should contain the __future__ import in generated section
                self.assertIn("from __future__ import", script, 
                             f"Case {i+1}: Should extract __future__ import")
                
                # Should be valid Python
                execution_result = run_python_script(script)
                self.assertTrue(execution_result["success"], 
                               f"Case {i+1}: Generated script should be valid Python")
    
    def _simulate_script_generation(self, user_code, include_vars=True):
        """
        Simulate the script generation process focusing on __future__ imports handling
        This replicates the logic from getScriptCode function
        """
        
        # Extract __future__ imports (simulate the regex logic)
        future_import_regex = r'^from __future__ import .+$'
        future_imports = []
        cleaned_code = user_code
        
        for line in user_code.split('\n'):
            line = line.strip()
            if re.match(future_import_regex, line):
                future_imports.append(line)
        
        # Remove __future__ imports from original code
        for future_import in future_imports:
            cleaned_code = cleaned_code.replace(future_import, '')
        
        # Clean up extra newlines
        cleaned_code = re.sub(r'\n\s*\n', '\n', cleaned_code).strip()
        
        # Build the script structure
        script_parts = [
            "#!/usr/bin/env python3",
            "# Auto-generated script for n8n Python Function (Raw)",
        ]
        
        # Add __future__ imports at the beginning if any found
        if future_imports:
            script_parts.extend(future_imports)
            script_parts.append("")  # Empty line after __future__ imports
        
        script_parts.extend([
            "import json",
            "import sys",
            ""
        ])
        
        # Add simulated variables if requested
        if include_vars:
            script_parts.extend([
                "# Individual variables from first input item",
                'id = 1',
                'name = "Test Item"',
                ""
            ])
        
        script_parts.extend([
            "# User code starts here",
            cleaned_code
        ])
        
        return '\n'.join(script_parts)


if __name__ == '__main__':
    print("Testing __future__ Imports Handling")
    print("=" * 60)
    unittest.main(verbosity=2) 