#!/usr/bin/env python3
"""
Анализ статуса интеграции Output File Processing v1.11.0
Проверяет насколько полно интегрирована функциональность в основной код
"""

import re
import os
import json

def analyze_node_file():
    """Анализировать основной файл узла на предмет интеграции Output File Processing"""
    
    node_file = "nodes/PythonFunction/PythonFunction.node.ts"
    
    if not os.path.exists(node_file):
        return {
            "status": "CRITICAL_ERROR",
            "error": "Main node file not found"
        }
    
    with open(node_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Проверки интеграции
    checks = {
        "ui_configuration": {
            "name": "UI Configuration",
            "items": [
                ("outputFileProcessing section", r"displayName:\s*['\"]Output File Processing['\"]"),
                ("Enable toggle", r"name:\s*['\"]enabled['\"].*description.*detect.*process.*files"),
                ("Max file size", r"name:\s*['\"]maxOutputFileSize['\"]"),
                ("Auto cleanup", r"name:\s*['\"]autoCleanupOutput['\"]"),
                ("Include metadata", r"name:\s*['\"]includeOutputMetadata['\"]")
            ]
        },
        "interfaces": {
            "name": "TypeScript Interfaces",
            "items": [
                ("OutputFileProcessingOptions", r"interface\s+OutputFileProcessingOptions"),
                ("OutputFileInfo", r"interface\s+OutputFileInfo"),
                ("enabled property", r"enabled:\s*boolean"),
                ("maxOutputFileSize property", r"maxOutputFileSize:\s*number"),
                ("base64Data property", r"base64Data:\s*string")
            ]
        },
        "core_functions": {
            "name": "Core Functions",
            "items": [
                ("scanOutputDirectory", r"async\s+function\s+scanOutputDirectory"),
                ("getMimeType", r"function\s+getMimeType"),
                ("cleanupOutputDirectory", r"async\s+function\s+cleanupOutputDirectory"),
                ("createUniqueOutputDirectory", r"function\s+createUniqueOutputDirectory")
            ]
        },
        "script_generation": {
            "name": "Script Generation Integration",
            "items": [
                ("getScriptCode with outputDir", r"getScriptCode\([^)]*outputDir"),
                ("output_dir variable", r"output_dir\s*="),
                ("getTemporaryScriptPath with outputDir", r"getTemporaryScriptPath\([^)]*outputDir")
            ]
        },
        "execution_integration": {
            "name": "Execution Integration",
            "items": [
                ("executeOnce with outputDir", r"executeOnce\([^)]*outputDir"),
                ("executePerItem with outputDir", r"executePerItem\([^)]*outputDir"),
                ("outputFileProcessingConfig", r"outputFileProcessingConfig"),
                ("scanOutputDirectory call", r"scanOutputDirectory\("),
                ("binary data assignment", r"binary\[.*binaryKey\]")
            ]
        }
    }
    
    results = {}
    total_passed = 0
    total_checks = 0
    
    for category, info in checks.items():
        category_results = {
            "name": info["name"],
            "items": {},
            "passed": 0,
            "total": len(info["items"])
        }
        
        for item_name, pattern in info["items"]:
            found = bool(re.search(pattern, content, re.MULTILINE | re.DOTALL))
            category_results["items"][item_name] = found
            if found:
                category_results["passed"] += 1
                total_passed += 1
            total_checks += 1
            
        results[category] = category_results
    
    # Общий статус
    completion_rate = (total_passed / total_checks) * 100 if total_checks > 0 else 0
    
    if completion_rate >= 90:
        status = "FULLY_INTEGRATED"
    elif completion_rate >= 70:
        status = "MOSTLY_INTEGRATED"
    elif completion_rate >= 50:
        status = "PARTIALLY_INTEGRATED"
    elif completion_rate >= 20:
        status = "BASIC_SETUP"
    else:
        status = "NOT_INTEGRATED"
    
    return {
        "status": status,
        "completion_rate": completion_rate,
        "total_passed": total_passed,
        "total_checks": total_checks,
        "details": results
    }

def check_file_existence():
    """Проверить существование ключевых файлов"""
    files_to_check = [
        "nodes/PythonFunction/PythonFunction.node.ts",
        "OUTPUT_FILE_PROCESSING_GUIDE.md",
        "CHANGELOG.md",
        "package.json"
    ]
    
    results = {}
    for file_path in files_to_check:
        results[file_path] = os.path.exists(file_path)
    
    return results

def check_version_consistency():
    """Проверить консистентность версии в разных файлах"""
    version_files = {
        "package.json": r'"version":\s*"([^"]+)"',
        "CHANGELOG.md": r"\[([0-9]+\.[0-9]+\.[0-9]+)\]",
        "OUTPUT_FILE_PROCESSING_GUIDE.md": r"v([0-9]+\.[0-9]+\.[0-9]+)"
    }
    
    versions = {}
    for file_path, pattern in version_files.items():
        if os.path.exists(file_path):
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            match = re.search(pattern, content)
            if match:
                versions[file_path] = match.group(1)
            else:
                versions[file_path] = "NOT_FOUND"
        else:
            versions[file_path] = "FILE_NOT_FOUND"
    
    # Проверить что все версии одинаковые
    unique_versions = set(v for v in versions.values() if v not in ["NOT_FOUND", "FILE_NOT_FOUND"])
    consistent = len(unique_versions) <= 1
    
    return {
        "consistent": consistent,
        "versions": versions,
        "target_version": "1.11.0"
    }

def main():
    print("🔍 АНАЛИЗ СТАТУСА ИНТЕГРАЦИИ OUTPUT FILE PROCESSING")
    print("=" * 60)
    
    # 1. Проверить существование файлов
    print("\n📁 Проверка файлов:")
    file_status = check_file_existence()
    for file_path, exists in file_status.items():
        status = "✅" if exists else "❌"
        print(f"  {status} {file_path}")
    
    # 2. Проверить версии
    print("\n🏷️  Проверка версий:")
    version_status = check_version_consistency()
    for file_path, version in version_status["versions"].items():
        status = "✅" if version == "1.11.0" else "⚠️ "
        print(f"  {status} {file_path}: {version}")
    
    version_consistency = "✅" if version_status["consistent"] else "❌"
    print(f"  {version_consistency} Консистентность версий: {version_status['consistent']}")
    
    # 3. Анализ интеграции кода
    print("\n🔧 Анализ интеграции в коде:")
    integration_status = analyze_node_file()
    
    if "error" in integration_status:
        print(f"❌ ОШИБКА: {integration_status['error']}")
        return
    
    print(f"📊 Общий статус: {integration_status['status']}")
    print(f"📈 Процент завершения: {integration_status['completion_rate']:.1f}%")
    print(f"📋 Проверок пройдено: {integration_status['total_passed']}/{integration_status['total_checks']}")
    
    # Детальный анализ по категориям
    print("\n📂 Детальный анализ по категориям:")
    for category, details in integration_status["details"].items():
        passed = details["passed"]
        total = details["total"]
        percentage = (passed / total) * 100 if total > 0 else 0
        
        status_icon = "✅" if percentage == 100 else "⚠️ " if percentage >= 50 else "❌"
        print(f"\n  {status_icon} {details['name']}: {passed}/{total} ({percentage:.0f}%)")
        
        for item_name, found in details["items"].items():
            item_status = "  ✓" if found else "  ✗"
            print(f"    {item_status} {item_name}")
    
    # Рекомендации
    print("\n💡 РЕКОМЕНДАЦИИ:")
    
    if integration_status["status"] == "FULLY_INTEGRATED":
        print("  🎉 Интеграция полностью завершена!")
        print("  ✅ Можно переходить к тестированию в n8n")
        
    elif integration_status["status"] == "MOSTLY_INTEGRATED":
        print("  🔨 Интеграция почти завершена, требуется доработка:")
        missing_categories = [
            cat for cat, details in integration_status["details"].items()
            if details["passed"] < details["total"]
        ]
        for cat in missing_categories:
            print(f"    - Доработать категорию: {integration_status['details'][cat]['name']}")
            
    elif integration_status["status"] == "PARTIALLY_INTEGRATED":
        print("  🚧 Требуется значительная доработка интеграции:")
        print("    - Завершить интеграцию в execute функции")
        print("    - Добавить обработку выходных файлов")
        print("    - Интегрировать с binary data системой n8n")
        
    elif integration_status["status"] == "BASIC_SETUP":
        print("  🏗️  Базовая настройка есть, нужна полная интеграция:")
        print("    - Добавить вызовы функций в execution pipeline")
        print("    - Интегрировать getScriptCode с outputDir")
        print("    - Добавить binary data обработку")
        
    else:
        print("  🔴 Интеграция отсутствует:")
        print("    - Добавить UI конфигурацию")
        print("    - Реализовать core функции")
        print("    - Интегрировать в execution flow")
        
    print("\n" + "=" * 60)
    print(f"🎯 ИТОГ: {integration_status['status']} ({integration_status['completion_rate']:.1f}% готово)")
    print("=" * 60)

if __name__ == "__main__":
    main() 