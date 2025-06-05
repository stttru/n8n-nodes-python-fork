/**
 * Test for Python value conversion functionality
 * Tests that JavaScript boolean values are correctly converted to Python format
 */

const { generateCodeTemplateStatic } = require('../../dist/nodes/PythonFunction/PythonFunction.node.js');

console.log('=== Testing Python Value Conversion ===\n');

// Test 1: Basic boolean conversion test
console.log('1. Testing boolean conversion (true/false -> True/False):');
console.log('='.repeat(60));

const booleanTestTemplate = generateCodeTemplateStatic(
  'print("Testing boolean conversion")', // functionCode
  true,  // includeInputItems (this will include mock data with booleans)
  false, // includeEnvVarsDict
  false, // hideVariableValues (important: show real values to test conversion)
  false, // includeFiles
  false  // includeOutputDir
);

console.log(booleanTestTemplate);

// Check for problems
const hasJavaScriptBooleans = booleanTestTemplate.includes(' = true') || 
                              booleanTestTemplate.includes(' = false') ||
                              booleanTestTemplate.includes(': true') || 
                              booleanTestTemplate.includes(': false');

const hasPythonBooleans = booleanTestTemplate.includes('True') || 
                          booleanTestTemplate.includes('False');

console.log('\n--- Conversion Test Results ---');
console.log(`❌ Contains JavaScript booleans (true/false): ${hasJavaScriptBooleans ? 'YES - PROBLEM!' : 'No'}`);
console.log(`✅ Contains Python booleans (True/False): ${hasPythonBooleans ? 'Yes' : 'NO - PROBLEM!'}`);

if (!hasJavaScriptBooleans && hasPythonBooleans) {
    console.log('🎉 SUCCESS: Boolean conversion is working correctly!');
} else {
    console.log('❌ FAILED: Boolean conversion needs fixing!');
}

// Test 2: Complex nested object test
console.log('\n\n2. Testing complex nested objects with mixed data types:');
console.log('='.repeat(60));

const complexTestTemplate = generateCodeTemplateStatic(
  '# Complex data processing test', // functionCode
  true,  // includeInputItems
  true,  // includeEnvVarsDict (this adds env_vars dict)
  false, // hideVariableValues
  false, // includeFiles
  false  // includeOutputDir
);

console.log(complexTestTemplate);

// Check line by line for problems
console.log('\n--- Line-by-line Analysis ---');
const lines = complexTestTemplate.split('\n');
let problemLines = [];

lines.forEach((line, index) => {
    if (line.includes(' = ') && !line.trim().startsWith('#')) {
        // Check for JavaScript boolean patterns
        if (line.match(/=\s*true(?!\w)/) || line.match(/=\s*false(?!\w)/) ||
            line.match(/:\s*true(?!\w)/) || line.match(/:\s*false(?!\w)/)) {
            problemLines.push(`Line ${index + 1}: ${line.trim()}`);
        }
    }
});

if (problemLines.length > 0) {
    console.log('❌ Found problematic lines with JavaScript booleans:');
    problemLines.forEach(line => console.log(`  ${line}`));
} else {
    console.log('✅ No problematic JavaScript boolean patterns found!');
}

// Test 3: Environment variables test
console.log('\n\n3. Testing environment variables conversion:');
console.log('='.repeat(60));

const envTestTemplate = generateCodeTemplateStatic(
  'print("Environment test")', // functionCode
  false, // includeInputItems
  true,  // includeEnvVarsDict
  false, // hideVariableValues
  false, // includeFiles
  false  // includeOutputDir
);

// Look specifically at env_vars line
const envVarsMatch = envTestTemplate.match(/env_vars = .*/);
if (envVarsMatch) {
    console.log('Environment variables line:');
    console.log(envVarsMatch[0]);
    
    const hasJSBooleans = envVarsMatch[0].includes(': true') || envVarsMatch[0].includes(': false');
    console.log(`Contains JS booleans: ${hasJSBooleans ? 'YES - PROBLEM!' : 'No'}`);
} else {
    console.log('No env_vars line found.');
}

console.log('\n=== Test Complete ===');
console.log('If all tests show "SUCCESS" or "No" for problems, the conversion is working correctly!'); 