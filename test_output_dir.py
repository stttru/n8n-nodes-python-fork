#!/usr/bin/env python3
"""Простой тест для проверки output_dir"""

import os

print("🔍 Проверка Output File Processing:")
print(f"📂 Текущая директория: {os.getcwd()}")

if 'output_dir' in globals():
    print(f"✅ output_dir доступен: {output_dir}")
    print(f"📁 output_dir существует: {os.path.exists(output_dir)}")
    
    # Создаем простой тестовый файл
    test_file = os.path.join(output_dir, "test.txt")
    with open(test_file, 'w') as f:
        f.write("Тест Output File Processing\n")
        f.write("Файл создан успешно!")
    
    print(f"✅ Создан тестовый файл: {test_file}")
    print(f"📊 Размер файла: {os.path.getsize(test_file)} байт")
else:
    print("❌ output_dir НЕ доступен!")
    print("💡 Включите 'Enable Output File Processing' в настройках ноды") 