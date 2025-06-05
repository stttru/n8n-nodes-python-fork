const { generateCodeTemplateStatic } = require('../../dist/nodes/PythonFunction/PythonFunction.node.js');

console.log('=== Testing n8n Refresh Button Functionality ===\n');

// Simulate different node configuration scenarios
const scenarios = [
    {
        name: 'Minimal Configuration (default settings)',
        config: {
            functionCode: 'print("Hello World!")',
            includeInputItems: true,
            includeEnvVarsDict: false,
            hideVariableValues: true,
            includeFiles: false,
            includeOutputDir: false,
        }
    },
    {
        name: 'Full Configuration (all features enabled)',
        config: {
            functionCode: `
# Process input data
for item in input_items:
    print(f"Processing item: {item['name']}")

# Use environment variables
print(f"API Key: {API_KEY}")
print(f"Database URL: {DATABASE_URL}")

# Process files
for file_info in input_files:
    print(f"Processing file: {file_info['filename']}")
    with open(file_info['temp_path'], 'r') as f:
        content = f.read()
        print(f"File content: {content[:100]}...")

# Generate output file
import os
output_file = os.path.join(output_dir, "result.json")
with open(output_file, 'w') as f:
    f.write('{"status": "completed"}')
`.trim(),
            includeInputItems: true,
            includeEnvVarsDict: true,
            hideVariableValues: false,
            includeFiles: true,
            includeOutputDir: true,
        }
    },
    {
        name: 'File Processing Only',
        config: {
            functionCode: `
# Process uploaded files
for file_info in input_files:
    filename = file_info['filename']
    base64_data = file_info['base64_data']
    
    # Decode and process file
    import base64
    file_content = base64.b64decode(base64_data).decode('utf-8')
    
    # Process the content
    processed_content = file_content.upper()
    print(f"Processed {filename}: {len(processed_content)} characters")
`.trim(),
            includeInputItems: false,
            includeEnvVarsDict: false,
            hideVariableValues: true,
            includeFiles: true,
            includeOutputDir: false,
        }
    },
    {
        name: 'API Integration (with hidden credentials)',
        config: {
            functionCode: `
import requests

# Use hidden API credentials
response = requests.get(
    f"{API_BASE_URL}/users", 
    headers={"Authorization": f"Bearer {API_TOKEN}"}
)

print(f"Response status: {response.status_code}")
result = response.json()
print(f"Retrieved {len(result)} users")
`.trim(),
            includeInputItems: true,
            includeEnvVarsDict: false,
            hideVariableValues: true,
            includeFiles: false,
            includeOutputDir: false,
        }
    }
];

// Simulate the refresh button being clicked for each scenario
scenarios.forEach((scenario, index) => {
    console.log(`${index + 1}. ${scenario.name}`);
    console.log('='*60);
    
    const template = generateCodeTemplateStatic(
        scenario.config.functionCode,
        scenario.config.includeInputItems,
        scenario.config.includeEnvVarsDict,
        scenario.config.hideVariableValues,
        scenario.config.includeFiles,
        scenario.config.includeOutputDir
    );
    
    // Show what would appear in the refresh button response
    const lines = template.split('\n');
    const nonEmptyLines = lines.filter(line => line.trim() !== '').length;
    const hasUserCode = scenario.config.functionCode && scenario.config.functionCode.trim();
    const timestamp = new Date().toLocaleString();
    
    console.log('🔄 Refresh Button Response:');
    console.log(`   Generated Template (${lines.length} lines, ${nonEmptyLines} non-empty)`);
    console.log(`   Features included:`);
    console.log(`   • Input items: ${scenario.config.includeInputItems ? 'Yes' : 'No'}`);
    console.log(`   • Environment variables: ${scenario.config.includeEnvVarsDict ? 'Yes' : 'No'}`);
    console.log(`   • File processing: ${scenario.config.includeFiles ? 'Yes' : 'No'}`);
    console.log(`   • Output file processing: ${scenario.config.includeOutputDir ? 'Yes' : 'No'}`);
    console.log(`   • Hidden credentials: ${scenario.config.hideVariableValues ? 'Yes' : 'No'}`);
    console.log(`   • User code: ${hasUserCode ? 'Found' : 'None (template only)'}`);
    
    // Show template preview (first 15 lines)
    const previewLines = lines.slice(0, 15);
    const preview = previewLines.join('\n') + (lines.length > 15 ? '\n\n# ... (truncated)' : '');
    
    console.log('\n📋 Template Preview (first 15 lines):');
    console.log(preview);
    
    console.log('\n📖 Full Template Length:', lines.length, 'lines');
    console.log('─'*60);
    console.log();
});

console.log('✅ Test completed! This demonstrates what users will see when they click');
console.log('   the refresh button (🔄) next to "Extract Code Template" in n8n.');
console.log();
console.log('💡 In the actual n8n interface:');
console.log('   1. User clicks refresh button');
console.log('   2. n8n calls generateCodeTemplate() method');
console.log('   3. User sees 3 options in dropdown:');
console.log('      - Template Summary (features overview)');
console.log('      - Template Preview (first 20 lines)');
console.log('      - Full Template (complete code)');
console.log('   4. User can copy Full Template content to examine the structure'); 