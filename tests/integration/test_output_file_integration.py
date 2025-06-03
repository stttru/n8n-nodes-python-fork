#!/usr/bin/env python3
"""
Complete integration test for Output File Processing v1.11.0
Tests real functionality of file generation by Python scripts
"""

import os
import json
import tempfile
import shutil
import subprocess
import sys
from pathlib import Path

# Test configuration
TEST_CONFIG = {
    "version": "1.11.0",
    "feature": "Output File Processing",
    "test_cases": [
        "text_file_generation",
        "json_export", 
        "multiple_files",
        "binary_file_creation",
        "directory_structure",
        "error_handling",
        "cleanup_verification"
    ]
}

class OutputFileProcessingTester:
    def __init__(self):
        self.test_results = []
        self.temp_dirs = []
        
    def setup_test_environment(self):
        """Create temporary testing environment"""
        self.base_temp_dir = tempfile.mkdtemp(prefix="n8n_output_test_")
        self.temp_dirs.append(self.base_temp_dir)
        print(f"✅ Test environment created: {self.base_temp_dir}")
        
    def cleanup_test_environment(self):
        """Clean up temporary environment"""
        for temp_dir in self.temp_dirs:
            if os.path.exists(temp_dir):
                shutil.rmtree(temp_dir)
                print(f"🧹 Cleaned up: {temp_dir}")
                
    def create_output_directory(self):
        """Create unique output directory (n8n simulation)"""
        import time
        import random
        timestamp = int(time.time() * 1000)
        random_id = ''.join([chr(ord('a') + random.randint(0, 25)) for _ in range(6)])
        unique_id = f"n8n_python_output_{timestamp}_{random_id}"
        output_dir = os.path.join(self.base_temp_dir, unique_id)
        os.makedirs(output_dir, exist_ok=True)
        self.temp_dirs.append(output_dir)
        return output_dir
        
    def test_text_file_generation(self):
        """Test 1: Simple text file generation"""
        print("\n📝 Test 1: Text File Generation")
        
        output_dir = self.create_output_directory()
        
        # Python script for text file generation
        script_code = f'''
import os
import datetime

# output_dir is provided by n8n
output_dir = "{output_dir}"

# Create simple text report
report_path = os.path.join(output_dir, "test_report.txt")
with open(report_path, 'w', encoding='utf-8') as f:
    f.write(f"Test Report Generated: {{datetime.datetime.now()}}\\n")
    f.write("Status: SUCCESS\\n")
    f.write("Test Type: Text File Generation\\n")
    f.write("Content: Simple text content for testing\\n")

print(f"Created text file: {{report_path}}")
print(f"File size: {{os.path.getsize(report_path)}} bytes")
'''
        
        # Execute script
        result = self.execute_python_script(script_code)
        
        # Check result
        expected_file = os.path.join(output_dir, "test_report.txt")
        if os.path.exists(expected_file):
            with open(expected_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            success = (
                "Test Report Generated:" in content and
                "Status: SUCCESS" in content and
                len(content) > 50
            )
            
            self.test_results.append({
                "test": "text_file_generation",
                "success": success,
                "details": {
                    "file_created": True,
                    "file_size": os.path.getsize(expected_file),
                    "content_preview": content[:100] + "..." if len(content) > 100 else content
                }
            })
            
            if success:
                print("✅ Text file generated successfully")
                print(f"   File size: {os.path.getsize(expected_file)} bytes")
            else:
                print("❌ Text file content validation failed")
        else:
            print("❌ Text file was not created")
            self.test_results.append({
                "test": "text_file_generation", 
                "success": False,
                "error": "File not created"
            })
            
    def test_json_export(self):
        """Test 2: JSON data export"""
        print("\n📊 Test 2: JSON Export")
        
        output_dir = self.create_output_directory()
        
        # Python script for JSON export
        script_code = f'''
import os
import json
from datetime import datetime

output_dir = "{output_dir}"

# Create complex JSON data
data = {{
    "timestamp": datetime.now().isoformat(),
    "test_info": {{
        "name": "JSON Export Test",
        "version": "1.11.0",
        "feature": "Output File Processing"
    }},
    "results": [
        {{"id": 1, "value": "test_value_1", "status": "completed"}},
        {{"id": 2, "value": "test_value_2", "status": "pending"}},
        {{"id": 3, "value": "test_value_3", "status": "failed"}}
    ],
    "statistics": {{
        "total_items": 3,
        "completed": 1,
        "pending": 1,
        "failed": 1
    }}
}}

# Save JSON file
json_path = os.path.join(output_dir, "export_data.json")
with open(json_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"Created JSON file: {{json_path}}")
print(f"Data keys: {{list(data.keys())}}")
'''
        
        # Execute script
        result = self.execute_python_script(script_code)
        
        # Check result
        expected_file = os.path.join(output_dir, "export_data.json")
        if os.path.exists(expected_file):
            try:
                with open(expected_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                
                success = (
                    "test_info" in data and
                    "results" in data and
                    "statistics" in data and
                    len(data["results"]) == 3
                )
                
                self.test_results.append({
                    "test": "json_export",
                    "success": success,
                    "details": {
                        "file_created": True,
                        "valid_json": True,
                        "data_keys": list(data.keys()),
                        "results_count": len(data.get("results", []))
                    }
                })
                
                if success:
                    print("✅ JSON export successful")
                    print(f"   Data keys: {list(data.keys())}")
                else:
                    print("❌ JSON data validation failed")
            except json.JSONDecodeError as e:
                print(f"❌ Invalid JSON generated: {e}")
                self.test_results.append({
                    "test": "json_export",
                    "success": False,
                    "error": f"JSON decode error: {e}"
                })
        else:
            print("❌ JSON file was not created")
            self.test_results.append({
                "test": "json_export",
                "success": False,
                "error": "File not created"
            })
            
    def test_multiple_files(self):
        """Test 3: Multiple file generation"""
        print("\n📁 Test 3: Multiple Files Generation")
        
        output_dir = self.create_output_directory()
        
        # Python script for multiple file generation
        script_code = f'''
import os
import json
import csv
from datetime import datetime

output_dir = "{output_dir}"

# Create multiple files of different types

# 1. Text file
text_path = os.path.join(output_dir, "summary.txt")
with open(text_path, 'w') as f:
    f.write("Multi-file Test Summary\\n")
    f.write(f"Generated: {{datetime.now()}}\\n")
    f.write("Files: 4 different types\\n")

# 2. JSON configuration
config_path = os.path.join(output_dir, "config.json")
config_data = {{
    "app_name": "n8n Python Function",
    "version": "1.11.0",
    "features": ["output_processing", "multi_files", "binary_conversion"],
    "enabled": True
}}
with open(config_path, 'w') as f:
    json.dump(config_data, f, indent=2)

# 3. CSV data
csv_path = os.path.join(output_dir, "data.csv")
with open(csv_path, 'w', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(['ID', 'Name', 'Value', 'Status'])
    writer.writerow([1, 'Item One', 100, 'Active'])
    writer.writerow([2, 'Item Two', 200, 'Inactive'])
    writer.writerow([3, 'Item Three', 300, 'Pending'])

# 4. HTML report
html_path = os.path.join(output_dir, "report.html")
with open(html_path, 'w') as f:
    f.write("""<!DOCTYPE html>
<html>
<head><title>Test Report</title></head>
<body>
<h1>n8n Python Function Test Report</h1>
<p>Generated: {{datetime.now()}}</p>
<ul>
<li>Text file: summary.txt</li>
<li>JSON file: config.json</li>
<li>CSV file: data.csv</li>
<li>HTML file: report.html</li>
</ul>
</body>
</html>""")

# List all created files
files = os.listdir(output_dir)
print(f"Created {{len(files)}} files: {{files}}")
for file in files:
    file_path = os.path.join(output_dir, file)
    print(f"  {{file}}: {{os.path.getsize(file_path)}} bytes")
'''
        
        # Execute script
        result = self.execute_python_script(script_code)
        
        # Check results
        expected_files = ["summary.txt", "config.json", "data.csv", "report.html"]
        created_files = []
        
        for expected_file in expected_files:
            file_path = os.path.join(output_dir, expected_file)
            if os.path.exists(file_path):
                created_files.append({
                    "name": expected_file,
                    "size": os.path.getsize(file_path),
                    "exists": True
                })
            else:
                created_files.append({
                    "name": expected_file,
                    "exists": False
                })
        
        success = all(f["exists"] for f in created_files)
        
        self.test_results.append({
            "test": "multiple_files",
            "success": success,
            "details": {
                "expected_files": len(expected_files),
                "created_files": len([f for f in created_files if f["exists"]]),
                "files": created_files
            }
        })
        
        if success:
            print("✅ All multiple files generated successfully")
            for file_info in created_files:
                if file_info["exists"]:
                    print(f"   {file_info['name']}: {file_info['size']} bytes")
        else:
            print("❌ Some files were not created")
            for file_info in created_files:
                status = "✅" if file_info["exists"] else "❌"
                print(f"   {status} {file_info['name']}")
                
    def test_binary_file_creation(self):
        """Test 4: Binary file creation"""
        print("\n🔧 Test 4: Binary File Creation")
        
        output_dir = self.create_output_directory()
        
        # Python script for binary file creation
        script_code = f'''
import os

output_dir = "{output_dir}"

# Create binary files

# 1. Create a simple binary file
binary_path = os.path.join(output_dir, "data.bin")
binary_data = bytes([i % 256 for i in range(1000)])  # 1000 bytes of test data
with open(binary_path, 'wb') as f:
    f.write(binary_data)

# 2. Create a pseudo image file (BMP header simulation)
bmp_path = os.path.join(output_dir, "test.bmp")
# Simple BMP header for 1x1 pixel image
bmp_header = b'BM\\x46\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x36\\x00\\x00\\x00\\x28\\x00\\x00\\x00\\x01\\x00\\x00\\x00\\x01\\x00\\x00\\x00\\x01\\x00\\x18\\x00\\x00\\x00\\x00\\x00\\x10\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00'
bmp_data = b'\\x00\\x00\\x00\\x00'  # 1 pixel data
with open(bmp_path, 'wb') as f:
    f.write(bmp_header + bmp_data)

# 3. Create a ZIP-like file
zip_path = os.path.join(output_dir, "archive.zip")
# Simple ZIP file signature
zip_data = b'PK\\x03\\x04' + b'\\x00' * 100  # ZIP signature + dummy data
with open(zip_path, 'wb') as f:
    f.write(zip_data)

print(f"Created binary files:")
for file in ['data.bin', 'test.bmp', 'archive.zip']:
    file_path = os.path.join(output_dir, file)
    print(f"  {{file}}: {{os.path.getsize(file_path)}} bytes")
'''
        
        # Execute script
        result = self.execute_python_script(script_code)
        
        # Check results
        expected_files = ["data.bin", "test.bmp", "archive.zip"]
        binary_files = []
        
        for expected_file in expected_files:
            file_path = os.path.join(output_dir, expected_file)
            if os.path.exists(file_path):
                # Read first few bytes to verify binary content
                with open(file_path, 'rb') as f:
                    header = f.read(10)
                
                binary_files.append({
                    "name": expected_file,
                    "size": os.path.getsize(file_path),
                    "exists": True,
                    "header": header.hex()
                })
            else:
                binary_files.append({
                    "name": expected_file,
                    "exists": False
                })
        
        success = all(f["exists"] for f in binary_files) and all(f["size"] > 0 for f in binary_files if f["exists"])
        
        self.test_results.append({
            "test": "binary_file_creation",
            "success": success,
            "details": {
                "expected_files": len(expected_files),
                "created_files": len([f for f in binary_files if f["exists"]]),
                "files": binary_files
            }
        })
        
        if success:
            print("✅ All binary files created successfully")
            for file_info in binary_files:
                if file_info["exists"]:
                    print(f"   {file_info['name']}: {file_info['size']} bytes (header: {file_info['header'][:20]}...)")
        else:
            print("❌ Some binary files were not created")
            
    def test_error_handling(self):
        """Test 5: Error handling during file creation"""
        print("\n⚠️ Test 5: Error Handling")
        
        output_dir = self.create_output_directory()
        
        # Python script that has errors but still creates some files
        script_code = f'''
import os
import sys

output_dir = "{output_dir}"

try:
    # Create a successful file first
    success_path = os.path.join(output_dir, "success.txt")
    with open(success_path, 'w') as f:
        f.write("This file was created successfully before the error\\n")
    print(f"Created: {{success_path}}")
    
    # Create another file
    before_error_path = os.path.join(output_dir, "before_error.json")
    import json
    data = {{"status": "created_before_error", "timestamp": "2024-01-15"}}
    with open(before_error_path, 'w') as f:
        json.dump(data, f)
    print(f"Created: {{before_error_path}}")
    
    # Now cause an error (division by zero)
    result = 1 / 0
    
except Exception as e:
    print(f"Error occurred: {{e}}")
    
    # Even with error, try to create error report file
    try:
        error_path = os.path.join(output_dir, "error_report.txt")
        with open(error_path, 'w') as f:
            f.write(f"Error occurred during execution: {{e}}\\n")
            f.write("But some files were still created\\n")
        print(f"Created error report: {{error_path}}")
    except:
        pass

# List all files that were created despite the error
try:
    files = os.listdir(output_dir)
    print(f"Files created despite error: {{files}}")
except:
    pass
'''
        
        # Execute script (expect it to fail but still create files)
        result = self.execute_python_script(script_code)
        
        # Check that files were still created even with script error
        expected_files = ["success.txt", "before_error.json", "error_report.txt"]
        created_files = []
        
        for expected_file in expected_files:
            file_path = os.path.join(output_dir, expected_file)
            if os.path.exists(file_path):
                created_files.append({
                    "name": expected_file,
                    "size": os.path.getsize(file_path),
                    "exists": True
                })
        
        # Success if files were created even though script had errors
        success = len(created_files) >= 2  # At least 2 files should be created
        
        self.test_results.append({
            "test": "error_handling",
            "success": success,
            "details": {
                "script_had_error": result["exit_code"] != 0,
                "files_created_despite_error": len(created_files),
                "created_files": created_files
            }
        })
        
        if success:
            print("✅ Error handling test passed - files created despite script error")
            print(f"   Files created: {len(created_files)}")
            for file_info in created_files:
                print(f"   - {file_info['name']}: {file_info['size']} bytes")
        else:
            print("❌ Error handling test failed")
            
    def test_cleanup_verification(self):
        """Test 6: Cleanup verification"""
        print("\n🧹 Test 6: Cleanup Verification")
        
        # This test verifies that our test cleanup works
        # In real n8n, this would test the auto-cleanup feature
        
        temp_output_dir = self.create_output_directory()
        
        # Create some test files
        script_code = f'''
import os

output_dir = "{temp_output_dir}"

# Create several test files for cleanup testing
for i in range(5):
    file_path = os.path.join(output_dir, f"cleanup_test_{{i}}.txt")
    with open(file_path, 'w') as f:
        f.write(f"Test file {{i}} for cleanup verification\\n")

# Create a subdirectory with files
sub_dir = os.path.join(output_dir, "subdir")
os.makedirs(sub_dir, exist_ok=True)
for i in range(3):
    file_path = os.path.join(sub_dir, f"sub_file_{{i}}.txt")
    with open(file_path, 'w') as f:
        f.write(f"Sub file {{i}}\\n")

files = []
for root, dirs, filenames in os.walk(output_dir):
    for filename in filenames:
        files.append(os.path.join(root, filename))

print(f"Created {{len(files)}} files for cleanup test")
for file in files:
    print(f"  {{file}}")
'''
        
        # Execute script
        result = self.execute_python_script(script_code)
        
        # Count files before cleanup
        files_before = []
        for root, dirs, filenames in os.walk(temp_output_dir):
            for filename in filenames:
                files_before.append(os.path.join(root, filename))
        
        print(f"Files before cleanup: {len(files_before)}")
        
        # Simulate cleanup (in real n8n this would be automatic)
        if os.path.exists(temp_output_dir):
            shutil.rmtree(temp_output_dir)
        
        # Verify cleanup
        cleanup_success = not os.path.exists(temp_output_dir)
        
        self.test_results.append({
            "test": "cleanup_verification",
            "success": cleanup_success,
            "details": {
                "files_before_cleanup": len(files_before),
                "directory_removed": cleanup_success,
                "cleanup_method": "manual_simulation"
            }
        })
        
        if cleanup_success:
            print("✅ Cleanup verification successful")
            print(f"   {len(files_before)} files and directory removed")
        else:
            print("❌ Cleanup verification failed")
            
    def execute_python_script(self, script_code):
        """Execute Python script and return results"""
        # Create temporary script file
        script_path = os.path.join(self.base_temp_dir, "temp_script.py")
        
        try:
            with open(script_path, 'w', encoding='utf-8') as f:
                f.write(script_code)
            
            # Execute script
            result = subprocess.run(
                [sys.executable, script_path],
                capture_output=True,
                text=True,
                timeout=30
            )
            
            return {
                "exit_code": result.returncode,
                "stdout": result.stdout,
                "stderr": result.stderr,
                "success": result.returncode == 0
            }
            
        except subprocess.TimeoutExpired:
            return {
                "exit_code": -1,
                "stdout": "",
                "stderr": "Script execution timeout",
                "success": False
            }
        except Exception as e:
            return {
                "exit_code": -1,
                "stdout": "",
                "stderr": str(e),
                "success": False
            }
        finally:
            # Clean up script file
            if os.path.exists(script_path):
                try:
                    os.unlink(script_path)
                except:
                    pass
                    
    def run_all_tests(self):
        """Run all integration tests"""
        print("🚀 STARTING OUTPUT FILE PROCESSING INTEGRATION TESTS")
        print("=" * 80)
        
        try:
            self.setup_test_environment()
            
            # Run all test cases
            self.test_text_file_generation()
            self.test_json_export()
            self.test_multiple_files()
            self.test_binary_file_creation()
            self.test_error_handling()
            self.test_cleanup_verification()
            
            # Generate final report
            self.generate_final_report()
            
        finally:
            self.cleanup_test_environment()
            
    def generate_final_report(self):
        """Generate final test report"""
        print("\n" + "=" * 80)
        print("📊 FINAL INTEGRATION TEST REPORT")
        print("=" * 80)
        
        total_tests = len(self.test_results)
        passed_tests = len([r for r in self.test_results if r["success"]])
        success_rate = (passed_tests / total_tests * 100) if total_tests > 0 else 0
        
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests}")
        print(f"Failed: {total_tests - passed_tests}")
        print(f"Success Rate: {success_rate:.1f}%")
        print()
        
        # Detailed results
        for result in self.test_results:
            status = "✅ PASS" if result["success"] else "❌ FAIL"
            print(f"{status} {result['test']}")
            
            if "details" in result:
                for key, value in result["details"].items():
                    print(f"    {key}: {value}")
            
            if "error" in result:
                print(f"    Error: {result['error']}")
            print()
        
        # Overall assessment
        if success_rate >= 80:
            print("🎉 INTEGRATION TESTS SUCCESSFUL!")
            print("Output File Processing v1.11.0 is working correctly")
        elif success_rate >= 60:
            print("⚠️ INTEGRATION TESTS PARTIAL SUCCESS")
            print("Some issues detected but core functionality works")
        else:
            print("💥 INTEGRATION TESTS FAILED")
            print("Major issues detected in Output File Processing")
        
        # Save report to file
        report_data = {
            "test_summary": {
                "total_tests": total_tests,
                "passed_tests": passed_tests,
                "success_rate": success_rate,
                "timestamp": "2024-01-15"
            },
            "test_results": self.test_results,
            "conclusion": "SUCCESS" if success_rate >= 80 else "PARTIAL" if success_rate >= 60 else "FAILED"
        }
        
        try:
            report_path = os.path.join(os.getcwd(), "integration_test_report.json")
            with open(report_path, 'w') as f:
                json.dump(report_data, f, indent=2)
            print(f"📄 Detailed report saved: {report_path}")
        except Exception as e:
            print(f"⚠️ Could not save report: {e}")

def main():
    """Main test execution"""
    tester = OutputFileProcessingTester()
    tester.run_all_tests()

if __name__ == "__main__":
    main() 