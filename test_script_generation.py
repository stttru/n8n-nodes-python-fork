#!/usr/bin/env python3
"""
Тест генерации Python скрипта с output_dir переменной
"""

import os
import sys
import tempfile
from pathlib import Path

# Добавляем путь к модулям проекта
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'nodes', 'PythonFunction'))

def test_script_generation():
    """Тестирует генерацию скрипта с output_dir"""
    print("🧪 ТЕСТИРОВАНИЕ ГЕНЕРАЦИИ СКРИПТА С OUTPUT_DIR")
    print("=" * 60)
    
    # Симуляция данных
    code_snippet = """
import os
print(f"Output directory: {output_dir}")
if 'output_dir' in globals():
    os.makedirs(output_dir, exist_ok=True)
    with open(os.path.join(output_dir, 'test.txt'), 'w') as f:
        f.write('Hello from Python!')
    print(f"File created in: {output_dir}")
else:
    print("output_dir variable not found!")
"""
    
    data = [{"message": "test"}]
    env_vars = {"TEST_VAR": "test_value"}
    output_dir = tempfile.mkdtemp(prefix="test_output_")
    
    print(f"📁 Test output directory: {output_dir}")
    
    # Симуляция функции getScriptCode (из TypeScript)
    script_content = f"""#!/usr/bin/env python3
# Auto-generated script for n8n Python Function (Raw)

import json
import sys

# Environment variables (from credentials and system)
TEST_VAR = "test_value"

# Individual variables from first input item
message = "test"

# Legacy compatibility objects
input_items = {data}

# Output directory for generated files (Output File Processing enabled)
output_dir = r"{output_dir}"

# User code starts here
{code_snippet}
"""
    
    print("📝 Generated script content:")
    print("-" * 40)
    print(script_content)
    print("-" * 40)
    
    # Проверяем что output_dir присутствует в скрипте
    if 'output_dir = r"' in script_content:
        print("✅ output_dir variable found in script")
    else:
        print("❌ output_dir variable NOT found in script")
        return False
    
    # Создаем временный файл скрипта и выполняем его
    script_path = os.path.join(tempfile.gettempdir(), 'test_script.py')
    try:
        with open(script_path, 'w', encoding='utf-8') as f:
            f.write(script_content)
        
        print(f"📄 Script saved to: {script_path}")
        
        # Выполняем скрипт
        import subprocess
        result = subprocess.run([sys.executable, script_path], 
                              capture_output=True, text=True, timeout=10)
        
        print(f"🔧 Script execution:")
        print(f"   Exit code: {result.returncode}")
        print(f"   Stdout: {result.stdout}")
        if result.stderr:
            print(f"   Stderr: {result.stderr}")
        
        # Проверяем что файл был создан
        test_file = os.path.join(output_dir, 'test.txt')
        if os.path.exists(test_file):
            print("✅ Test file was created successfully!")
            with open(test_file, 'r') as f:
                content = f.read()
                print(f"   File content: {content}")
            return True
        else:
            print("❌ Test file was NOT created")
            return False
            
    except Exception as e:
        print(f"❌ Error executing script: {e}")
        return False
    finally:
        # Cleanup
        try:
            if os.path.exists(script_path):
                os.unlink(script_path)
            if os.path.exists(output_dir):
                import shutil
                shutil.rmtree(output_dir)
        except:
            pass

if __name__ == "__main__":
    success = test_script_generation()
    if success:
        print("\n🎉 SCRIPT GENERATION TEST PASSED!")
    else:
        print("\n💥 SCRIPT GENERATION TEST FAILED!")
    sys.exit(0 if success else 1) 