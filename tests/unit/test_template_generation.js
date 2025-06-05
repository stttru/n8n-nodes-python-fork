const { generateCodeTemplateStatic } = require('../../dist/nodes/PythonFunction/PythonFunction.node.js');

// Test different configurations
console.log('=== Testing Code Template Generation ===\n');

// Test 1: Basic template with all features enabled
console.log('1. Full Template (all features enabled):');
console.log('='.repeat(50));
const fullTemplate = generateCodeTemplateStatic(
  'print("Hello from user code!")', // functionCode
  true,  // includeInputItems
  true,  // includeEnvVarsDict
  false, // hideVariableValues
  true,  // includeFiles
  true   // includeOutputDir
);
console.log(fullTemplate);

console.log('\n\n2. Minimal Template (basic features only):');
console.log('='.repeat(50));
const minimalTemplate = generateCodeTemplateStatic(
  'print("Hello world!")', // functionCode
  true,  // includeInputItems
  false, // includeEnvVarsDict
  true,  // hideVariableValues (hidden for security)
  false, // includeFiles
  false  // includeOutputDir
);
console.log(minimalTemplate);

console.log('\n\n3. Template with File Processing:');
console.log('='.repeat(50));
const fileTemplate = generateCodeTemplateStatic(
  '# Process files here', // functionCode
  true,  // includeInputItems
  false, // includeEnvVarsDict
  true,  // hideVariableValues
  true,  // includeFiles
  false  // includeOutputDir
);
console.log(fileTemplate); 