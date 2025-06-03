#!/usr/bin/env python3
"""
Analysis of Output File Processing v1.11.0 integration status
Checks how fully the functionality is integrated into the main code
"""

import re
import os
import json

def analyze_node_file():
    """Analyze main node file for Output File Processing integration"""
    
    node_file = "nodes/PythonFunction/PythonFunction.node.ts"
    
    if not os.path.exists(node_file):
        return {
            "status": "CRITICAL_ERROR",
            "error": "Main node file not found"
        }
    
    with open(node_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Integration checks
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
    
    # Overall status
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
    """Check existence of key files"""
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
    """Check version consistency across different files"""
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
    
    # Check that all versions are the same
    unique_versions = set(v for v in versions.values() if v not in ["NOT_FOUND", "FILE_NOT_FOUND"])
    consistent = len(unique_versions) <= 1
    
    return {
        "consistent": consistent,
        "versions": versions,
        "target_version": "1.11.0"
    }

def main():
    print("🔍 OUTPUT FILE PROCESSING INTEGRATION STATUS ANALYSIS")
    print("=" * 60)
    
    # 1. Check file existence
    print("\n📁 File Check:")
    file_status = check_file_existence()
    for file_path, exists in file_status.items():
        status = "✅" if exists else "❌"
        print(f"  {status} {file_path}")
    
    # 2. Check versions
    print("\n🏷️  Version Check:")
    version_status = check_version_consistency()
    for file_path, version in version_status["versions"].items():
        status = "✅" if version == "1.11.0" else "⚠️ "
        print(f"  {status} {file_path}: {version}")
    
    version_consistency = "✅" if version_status["consistent"] else "❌"
    print(f"  {version_consistency} Version consistency: {version_status['consistent']}")
    
    # 3. Code integration analysis
    print("\n🔧 Code Integration Analysis:")
    integration_status = analyze_node_file()
    
    if "error" in integration_status:
        print(f"❌ ERROR: {integration_status['error']}")
        return
    
    print(f"📊 Overall status: {integration_status['status']}")
    print(f"📈 Completion rate: {integration_status['completion_rate']:.1f}%")
    print(f"📋 Checks passed: {integration_status['total_passed']}/{integration_status['total_checks']}")
    
    # Detailed analysis by categories
    print("\n📋 Detailed Analysis:")
    for category, results in integration_status["details"].items():
        passed = results["passed"]
        total = results["total"]
        percentage = (passed / total * 100) if total > 0 else 0
        
        status_icon = "✅" if percentage == 100 else "⚠️" if percentage >= 50 else "❌"
        print(f"\n  {status_icon} {results['name']}: {passed}/{total} ({percentage:.1f}%)")
        
        for item_name, found in results["items"].items():
            item_status = "✅" if found else "❌"
            print(f"    {item_status} {item_name}")
    
    # Final assessment
    print("\n" + "=" * 60)
    print("🎯 FINAL ASSESSMENT:")
    
    overall_status = integration_status["status"]
    completion_rate = integration_status["completion_rate"]
    
    if overall_status == "FULLY_INTEGRATED":
        print("🎉 OUTPUT FILE PROCESSING IS FULLY INTEGRATED!")
        print("✨ All components are properly implemented and ready for use.")
    elif overall_status == "MOSTLY_INTEGRATED":
        print("⚠️ OUTPUT FILE PROCESSING IS MOSTLY INTEGRATED")
        print("🔧 Minor components may need attention.")
    elif overall_status == "PARTIALLY_INTEGRATED":
        print("⚠️ OUTPUT FILE PROCESSING IS PARTIALLY INTEGRATED")
        print("🚧 Significant work still needed for full functionality.")
    else:
        print("❌ OUTPUT FILE PROCESSING IS NOT PROPERLY INTEGRATED")
        print("🛠️ Major implementation work required.")
    
    print(f"📊 Overall completion: {completion_rate:.1f}%")
    
    # Save results to file
    report_data = {
        "timestamp": "2024-01-15",
        "version_target": "1.11.0",
        "file_status": file_status,
        "version_status": version_status,
        "integration_status": integration_status
    }
    
    try:
        with open("integration_status_report.json", "w") as f:
            json.dump(report_data, f, indent=2)
        print(f"\n📄 Report saved to: integration_status_report.json")
    except Exception as e:
        print(f"\n⚠️ Could not save report: {e}")

if __name__ == "__main__":
    main() 