/**
 * Test for __future__ Imports Handling in Compiled Code
 * Tests the actual TypeScript->JavaScript compiled function generateCodeTemplateStatic
 * Prevents regression of the "Cannot read properties of undefined (reading 'trim')" error
 * 
 * This test verifies that the compiled getScriptCode function properly handles:
 * - Single __future__ import statements
 * - Multiple __future__ import statements  
 * - Complex user code with __future__ imports
 * - Error conditions and edge cases
 */

const { generateCodeTemplateStatic } = require('../../dist/nodes/PythonFunction/PythonFunction.node.js');

console.log('=== Testing __future__ Imports Handling in Compiled Code ===\n');

// Test 1: Basic __future__ import handling
console.log('1. Testing single __future__ import extraction:');
console.log('='.repeat(70));

const singleFutureCode = `from __future__ import annotations
import json
import sys

result = {"test": "annotations_enabled"}
print(json.dumps(result))`;

try {
    const template1 = generateCodeTemplateStatic(
        singleFutureCode,
        false,  // includeInputItems
        false,  // includeEnvVarsDict  
        false,  // hideVariableValues
        false,  // includeFiles
        false   // includeOutputDir
    );
    
    console.log('Generated template:');
    console.log('-'.repeat(50));
    console.log(template1.substring(0, 500) + '...');
    console.log('-'.repeat(50));
    
    // Check if __future__ import is properly extracted and positioned
    const lines = template1.split('\n');
    let futureImportLine = -1;
    let userCodeStartLine = -1;
    
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('from __future__ import annotations')) {
            futureImportLine = i;
        }
        if (lines[i].includes('# User code starts here')) {
            userCodeStartLine = i;
            break;
        }
    }
    
    console.log(`__future__ import found at line: ${futureImportLine + 1}`);
    console.log(`User code starts at line: ${userCodeStartLine + 1}`);
    
    if (futureImportLine >= 0 && userCodeStartLine >= 0 && futureImportLine < userCodeStartLine) {
        console.log('✅ SUCCESS: __future__ import properly extracted and positioned');
        
        // Check that user code section doesn't contain __future__ import
        const userCodeSection = lines.slice(userCodeStartLine + 1).join('\n');
        if (!userCodeSection.includes('from __future__ import')) {
            console.log('✅ SUCCESS: User code section clean (no __future__ imports)');
        } else {
            console.log('❌ PROBLEM: User code still contains __future__ imports');
        }
    } else {
        console.log('❌ PROBLEM: __future__ import not properly handled');
    }
    
} catch (error) {
    console.log('❌ CRITICAL ERROR: Failed to process __future__ import');
    console.log(`Error: ${error.message}`);
    if (error.message.includes("Cannot read properties of undefined (reading 'trim')")) {
        console.log('🚨 REGRESSION DETECTED: The original bug has returned!');
        console.log('This is the exact error that was supposed to be fixed.');
    }
}

// Test 2: Multiple __future__ imports
console.log('\n\n2. Testing multiple __future__ imports:');
console.log('='.repeat(70));

const multipleFutureCode = `from __future__ import annotations
from __future__ import division  
import json
from __future__ import print_function

def test_function():
    return {"multiple_futures": True}

print(json.dumps(test_function()))`;

try {
    const template2 = generateCodeTemplateStatic(
        multipleFutureCode,
        false,  // includeInputItems
        false,  // includeEnvVarsDict
        false,  // hideVariableValues
        false,  // includeFiles
        false   // includeOutputDir
    );
    
    // Count __future__ imports in different sections
    const lines2 = template2.split('\n');
    let userCodeStart = -1;
    let futureImportsInHeader = 0;
    let futureImportsInUserCode = 0;
    
    for (let i = 0; i < lines2.length; i++) {
        if (lines2[i].includes('# User code starts here')) {
            userCodeStart = i;
        }
        
        if (lines2[i].includes('from __future__ import')) {
            if (userCodeStart === -1) {
                futureImportsInHeader++;
            } else {
                futureImportsInUserCode++;
            }
        }
    }
    
    console.log(`__future__ imports in header section: ${futureImportsInHeader}`);
    console.log(`__future__ imports in user code section: ${futureImportsInUserCode}`);
    
    if (futureImportsInHeader === 3 && futureImportsInUserCode === 0) {
        console.log('✅ SUCCESS: All 3 __future__ imports extracted and moved to header');
    } else {
        console.log('❌ PROBLEM: __future__ imports not properly extracted');
        console.log('Expected: 3 in header, 0 in user code');
        console.log(`Got: ${futureImportsInHeader} in header, ${futureImportsInUserCode} in user code`);
    }
    
} catch (error) {
    console.log('❌ CRITICAL ERROR: Multiple __future__ imports failed');
    console.log(`Error: ${error.message}`);
}

// Test 3: User's actual problematic code (regression test)
console.log('\n\n3. Testing user\'s original problematic code:');
console.log('='.repeat(70));

const userProblematicCode = `#!/usr/bin/env python3
# n8n Function · ONE-SHOT: exchange youtube_verification_code → token_json

from __future__ import annotations
import json, sys, traceback
from datetime import timezone
from typing import Sequence

# ── обязательные переменные из ноды ────────────────────────────
CLIENT_ID = globals().get("client_id")
CLIENT_SECRET = globals().get("client_secret")

# Test content
result = {"status": "success", "type": "youtube_auth"}
print(json.dumps(result))`;

try {
    const template3 = generateCodeTemplateStatic(
        userProblematicCode,
        true,   // includeInputItems (use real scenario)
        false,  // includeEnvVarsDict
        false,  // hideVariableValues (show real values for testing)
        false,  // includeFiles
        false   // includeOutputDir
    );
    
    console.log('✅ SUCCESS: User\'s original code processed without errors');
    
    // Check key requirements
    const hasAnnotationsImport = template3.includes('from __future__ import annotations');
    const userCodeStart = template3.indexOf('# User code starts here');
    const userCodeSection = userCodeStart >= 0 ? template3.substring(userCodeStart) : '';
    const userCodeHasFutureImports = userCodeSection.includes('from __future__ import');
    
    console.log(`Contains __future__ import: ${hasAnnotationsImport ? 'Yes' : 'No'}`);
    console.log(`User code section clean: ${!userCodeHasFutureImports ? 'Yes' : 'No'}`);
    console.log(`Preserves user variables: ${template3.includes('CLIENT_ID') ? 'Yes' : 'No'}`);
    
    if (hasAnnotationsImport && !userCodeHasFutureImports) {
        console.log('✅ FULL SUCCESS: Original error scenario now works correctly');
    } else {
        console.log('❌ ISSUE: Some requirements not met');
    }
    
} catch (error) {
    console.log('❌ CRITICAL REGRESSION: User\'s original code still fails!');
    console.log(`Error: ${error.message}`);
    
    if (error.message.includes("Cannot read properties of undefined (reading 'trim')")) {
        console.log('🚨🚨🚨 CRITICAL REGRESSION DETECTED 🚨🚨🚨');
        console.log('The original bug from the user report has NOT been fixed!');
        console.log('This means match[1].trim() is still being called instead of match[0].trim()');
    }
}

// Test 4: Edge cases and stress testing
console.log('\n\n4. Testing edge cases:');
console.log('='.repeat(70));

const edgeCases = [
    {
        name: "Multiple imports on one line",
        code: "from __future__ import annotations, division\nprint('test')"
    },
    {
        name: "Import with extra whitespace", 
        code: "   from __future__ import print_function   \nprint('test')"
    },
    {
        name: "Import with comment",
        code: "from __future__ import annotations  # Enable type hints\nprint('test')"
    }
];

let edgeTestsPassed = 0;

edgeCases.forEach((testCase, index) => {
    try {
        const result = generateCodeTemplateStatic(testCase.code, false, false, false, false, false);
        
        const containsFutureImport = result.includes('from __future__ import');
        const userCodeClean = !result.substring(result.indexOf('# User code starts here')).includes('from __future__ import');
        
        if (containsFutureImport && userCodeClean) {
            console.log(`✅ Edge case ${index + 1} (${testCase.name}): PASS`);
            edgeTestsPassed++;
        } else {
            console.log(`❌ Edge case ${index + 1} (${testCase.name}): FAIL`);
        }
        
    } catch (error) {
        console.log(`❌ Edge case ${index + 1} (${testCase.name}): ERROR - ${error.message}`);
    }
});

console.log(`\nEdge cases summary: ${edgeTestsPassed}/${edgeCases.length} passed`);

// Final summary
console.log('\n' + '='.repeat(70));
console.log('FINAL TEST SUMMARY');
console.log('='.repeat(70));

console.log('If all tests show ✅ SUCCESS, the __future__ imports bug has been fixed.');
console.log('If any test shows the trim() error, the regression fix needs to be checked.');
console.log('');
console.log('This test should be run after any changes to the getScriptCode function');
console.log('to ensure the __future__ imports handling continues to work correctly.');
console.log('='.repeat(70)); 