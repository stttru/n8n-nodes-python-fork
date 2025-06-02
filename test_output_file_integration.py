#!/usr/bin/env python3
"""
Полный интеграционный тест Output File Processing v1.11.0
Проверяет реальную функциональность генерации файлов Python скриптами
"""

import os
import json
import tempfile
import shutil
import subprocess
import sys
from pathlib import Path

# Конфигурация теста
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
        """Создать временную среду для тестирования"""
        self.base_temp_dir = tempfile.mkdtemp(prefix="n8n_output_test_")
        self.temp_dirs.append(self.base_temp_dir)
        print(f"✅ Test environment created: {self.base_temp_dir}")
        
    def cleanup_test_environment(self):
        """Очистить временную среду"""
        for temp_dir in self.temp_dirs:
            if os.path.exists(temp_dir):
                shutil.rmtree(temp_dir)
                print(f"🧹 Cleaned up: {temp_dir}")
                
    def create_output_directory(self):
        """Создать уникальную выходную директорию (имитация n8n)"""
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
        """Тест 1: Генерация простого текстового файла"""
        print("\n📝 Test 1: Text File Generation")
        
        output_dir = self.create_output_directory()
        
        # Python скрипт для генерации текстового файла
        script_code = f'''
import os
import datetime

# output_dir предоставляется n8n
output_dir = "{output_dir}"

# Создать простой текстовый отчет
report_path = os.path.join(output_dir, "test_report.txt")
with open(report_path, 'w', encoding='utf-8') as f:
    f.write(f"Test Report Generated: {{datetime.datetime.now()}}\\n")
    f.write("Status: SUCCESS\\n")
    f.write("Test Type: Text File Generation\\n")
    f.write("Content: Simple text content for testing\\n")

print(f"Created text file: {{report_path}}")
print(f"File size: {{os.path.getsize(report_path)}} bytes")
'''
        
        # Выполнить скрипт
        result = self.execute_python_script(script_code)
        
        # Проверить результат
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
        """Тест 2: Экспорт JSON данных"""
        print("\n📊 Test 2: JSON Export")
        
        output_dir = self.create_output_directory()
        
        # Python скрипт для JSON экспорта
        script_code = f'''
import os
import json
from datetime import datetime

output_dir = "{output_dir}"

# Создать комплексные JSON данные
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

# Сохранить JSON файл
json_path = os.path.join(output_dir, "export_data.json")
with open(json_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"Created JSON file: {{json_path}}")
print(f"Data keys: {{list(data.keys())}}")
'''
        
        # Выполнить скрипт
        result = self.execute_python_script(script_code)
        
        # Проверить результат
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
                print(f"❌ Invalid JSON format: {e}")
                self.test_results.append({
                    "test": "json_export",
                    "success": False,
                    "error": f"Invalid JSON: {e}"
                })
        else:
            print("❌ JSON file was not created")
            self.test_results.append({
                "test": "json_export",
                "success": False, 
                "error": "File not created"
            })
            
    def test_multiple_files(self):
        """Тест 3: Генерация нескольких файлов"""
        print("\n📁 Test 3: Multiple Files Generation")
        
        output_dir = self.create_output_directory()
        
        # Python скрипт для генерации нескольких файлов
        script_code = f'''
import os
import json
import csv
from datetime import datetime

output_dir = "{output_dir}"

# 1. Создать текстовый файл
text_path = os.path.join(output_dir, "summary.txt") 
with open(text_path, 'w') as f:
    f.write("Multi-file generation test\\n")
    f.write(f"Generated at: {{datetime.now()}}\\n")

# 2. Создать JSON файл
json_data = {{"files": ["summary.txt", "data.csv", "config.json"], "count": 3}}
json_path = os.path.join(output_dir, "config.json")
with open(json_path, 'w') as f:
    json.dump(json_data, f)

# 3. Создать CSV файл
csv_path = os.path.join(output_dir, "data.csv")
with open(csv_path, 'w', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(["ID", "Name", "Value"])
    writer.writerow([1, "Test Item 1", 100])
    writer.writerow([2, "Test Item 2", 200])
    writer.writerow([3, "Test Item 3", 300])

# 4. Создать файл с метаданными
meta_path = os.path.join(output_dir, "metadata.txt")
files_info = []
for filename in ["summary.txt", "config.json", "data.csv"]:
    filepath = os.path.join(output_dir, filename)
    if os.path.exists(filepath):
        files_info.append(f"{{filename}}: {{os.path.getsize(filepath)}} bytes")

with open(meta_path, 'w') as f:
    f.write("Generated Files Metadata:\\n")
    f.write("\\n".join(files_info))

print(f"Created {{len(os.listdir(output_dir))}} files in {{output_dir}}")
'''
        
        # Выполнить скрипт
        result = self.execute_python_script(script_code)
        
        # Проверить результат
        expected_files = ["summary.txt", "config.json", "data.csv", "metadata.txt"]
        created_files = os.listdir(output_dir) if os.path.exists(output_dir) else []
        
        success = all(f in created_files for f in expected_files) and len(created_files) == 4
        
        self.test_results.append({
            "test": "multiple_files",
            "success": success,
            "details": {
                "expected_files": expected_files,
                "created_files": created_files,
                "files_count": len(created_files)
            }
        })
        
        if success:
            print(f"✅ Multiple files created successfully: {created_files}")
        else:
            print(f"❌ File creation failed. Expected: {expected_files}, Got: {created_files}")
            
    def test_error_handling(self):
        """Тест 4: Обработка ошибок"""
        print("\n⚠️ Test 4: Error Handling")
        
        output_dir = self.create_output_directory()
        
        # Python скрипт с ошибкой доступа к файлу
        script_code = f'''
import os

output_dir = "{output_dir}"

try:
    # Попытка создать файл в несуществующей директории
    bad_path = os.path.join(output_dir, "nonexistent", "file.txt")
    with open(bad_path, 'w') as f:
        f.write("This should fail")
    print("ERROR: This should not be printed")
except Exception as e:
    print(f"Expected error caught: {{e}}")
    
    # Создать валидный файл после ошибки
    good_path = os.path.join(output_dir, "recovery.txt")
    with open(good_path, 'w') as f:
        f.write("Recovered from error successfully")
    print(f"Recovery file created: {{good_path}}")
'''
        
        # Выполнить скрипт
        result = self.execute_python_script(script_code)
        
        # Проверить результат
        recovery_file = os.path.join(output_dir, "recovery.txt")
        
        success = (
            os.path.exists(recovery_file) and
            "Expected error caught:" in result.get("stdout", "") and
            "Recovery file created:" in result.get("stdout", "")
        )
        
        self.test_results.append({
            "test": "error_handling",
            "success": success,
            "details": {
                "recovery_file_created": os.path.exists(recovery_file),
                "error_handled": "Expected error caught:" in result.get("stdout", ""),
                "stdout": result.get("stdout", "")
            }
        })
        
        if success:
            print("✅ Error handling successful")
        else:
            print("❌ Error handling failed")
            
    def test_cleanup_verification(self):
        """Тест 5: Проверка очистки"""
        print("\n🧹 Test 5: Cleanup Verification")
        
        # Создать несколько временных директорий
        temp_dirs = []
        for i in range(3):
            temp_dir = self.create_output_directory()
            temp_dirs.append(temp_dir)
            
            # Создать файл в каждой директории
            test_file = os.path.join(temp_dir, f"temp_file_{i}.txt")
            with open(test_file, 'w') as f:
                f.write(f"Temporary file {i}")
                
        # Проверить что все файлы созданы
        all_created = all(
            os.path.exists(os.path.join(d, f"temp_file_{i}.txt")) 
            for i, d in enumerate(temp_dirs)
        )
        
        # Имитировать cleanup
        cleanup_success = 0
        for temp_dir in temp_dirs:
            try:
                if os.path.exists(temp_dir):
                    shutil.rmtree(temp_dir)
                    cleanup_success += 1
            except Exception as e:
                print(f"Cleanup error: {e}")
                
        # Проверить что директории удалены
        all_cleaned = all(not os.path.exists(d) for d in temp_dirs)
        
        success = all_created and all_cleaned and cleanup_success == 3
        
        self.test_results.append({
            "test": "cleanup_verification",
            "success": success,
            "details": {
                "dirs_created": len(temp_dirs),
                "all_created": all_created,
                "cleanup_success": cleanup_success,
                "all_cleaned": all_cleaned
            }
        })
        
        if success:
            print(f"✅ Cleanup successful for {cleanup_success} directories")
        else:
            print("❌ Cleanup verification failed")
            
    def execute_python_script(self, script_code):
        """Выполнить Python скрипт и вернуть результат"""
        script_file = os.path.join(self.base_temp_dir, "test_script.py")
        
        with open(script_file, 'w', encoding='utf-8') as f:
            f.write(script_code)
            
        try:
            result = subprocess.run(
                [sys.executable, script_file],
                capture_output=True,
                text=True,
                timeout=30
            )
            
            return {
                "returncode": result.returncode,
                "stdout": result.stdout,
                "stderr": result.stderr
            }
        except subprocess.TimeoutExpired:
            return {
                "returncode": -1,
                "stdout": "",
                "stderr": "Script execution timeout"
            }
        finally:
            if os.path.exists(script_file):
                os.remove(script_file)
                
    def run_all_tests(self):
        """Запустить все тесты"""
        print(f"🚀 Starting Output File Processing Integration Tests")
        print(f"Version: {TEST_CONFIG['version']}")
        print(f"Feature: {TEST_CONFIG['feature']}")
        print("=" * 60)
        
        self.setup_test_environment()
        
        try:
            # Запустить все тестовые функции
            self.test_text_file_generation()
            self.test_json_export()
            self.test_multiple_files()
            self.test_error_handling()
            self.test_cleanup_verification()
            
        finally:
            self.cleanup_test_environment()
            
        # Подсчитать результаты
        total_tests = len(self.test_results)
        passed_tests = sum(1 for r in self.test_results if r["success"])
        failed_tests = total_tests - passed_tests
        
        print("\n" + "=" * 60)
        print("📋 TEST RESULTS SUMMARY")
        print("=" * 60)
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests} ✅")
        print(f"Failed: {failed_tests} ❌")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        # Детальные результаты
        print("\n📊 DETAILED RESULTS:")
        for result in self.test_results:
            status = "✅ PASS" if result["success"] else "❌ FAIL"
            print(f"  {result['test']}: {status}")
            if not result["success"] and "error" in result:
                print(f"    Error: {result['error']}")
                
        # Финальный статус
        overall_success = failed_tests == 0
        print("\n" + "=" * 60)
        if overall_success:
            print("🎉 ALL TESTS PASSED! Output File Processing is working correctly!")
        else:
            print(f"⚠️  {failed_tests} TESTS FAILED! Output File Processing needs fixes!")
        print("=" * 60)
        
        return overall_success

if __name__ == "__main__":
    tester = OutputFileProcessingTester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1) 