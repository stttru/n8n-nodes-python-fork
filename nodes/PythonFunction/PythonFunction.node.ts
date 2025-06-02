import {IExecuteFunctions, ILoadOptionsFunctions} from 'n8n-core';
import {
	IDataObject,
	INodeExecutionData,
	INodePropertyOptions,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';
import {spawn} from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as tempy from 'tempy';


export interface IExecReturnData {
	exitCode: number;
	error?: Error;
	stderr: string;
	stdout: string;
}

interface BinaryFileInfo {
	key: string;
	data: {
		data: string;
		fileName: string;
		mimeType: string;
		fileExtension?: string;
	};
	itemIndex: number;
}

interface FileMapping {
	filename: string;
	mimetype: string;
	size: number;
	tempPath?: string;
	base64Data?: string;
	binaryKey: string;
	itemIndex: number;
	extension: string;
}

interface FileProcessingOptions {
	enabled: boolean;
	accessMethod: 'temp_files' | 'base64' | 'both';
	maxFileSize: number;
	includeMetadata: boolean;
	autoCleanup: boolean;
}

interface OutputFileProcessingOptions {
	enabled: boolean;
	maxOutputFileSize: number;
	autoCleanupOutput: boolean;
	includeOutputMetadata: boolean;
	autoInterceptFiles?: boolean;
	expectedFileName?: string;
	fileDetectionMode?: 'variable_path' | 'auto_search';
}

interface OutputFileInfo {
	filename: string;
	size: number;
	mimetype: string;
	extension: string;
	base64Data: string;
	binaryKey: string;
}

// File debugging interfaces
interface FileDebugOptions {
	enabled: boolean;
	includeInputFileDebug: boolean;
	includeOutputFileDebug: boolean;
	includeSystemInfo: boolean;
	includeDirectoryListing: boolean;
}

interface FileDebugInfo {
	input_files?: {
		count: number;
		total_size_mb: number;
		files_by_type: Record<string, number>;
		files_details: Array<{
			filename: string;
			size_mb: number;
			mimetype: string;
			extension: string;
			binary_key: string;
			item_index: number;
			temp_path?: string;
			base64_available: boolean;
		}>;
		processing_errors?: string[];
	};
	output_files?: {
		processing_enabled: boolean;
		output_directory: string;
		directory_exists: boolean;
		directory_writable: boolean;
		directory_permissions?: string;
		found_files: Array<{
			filename: string;
			size_mb: number;
			mimetype: string;
			extension: string;
			full_path: string;
			created_at: string;
		}>;
		scan_errors?: string[];
	};
	system_info?: {
		python_executable: string;
		working_directory: string;
		user_permissions: {
			can_write_temp: boolean;
			can_create_files: boolean;
		};
		disk_space: {
			available_mb?: number;
			temp_dir?: string;
		};
		environment_variables: {
			output_dir_available: boolean;
			output_dir_value?: string;
		};
	};
	directory_listing?: {
		temp_directory?: string[];
		output_directory?: string[];
		working_directory?: string[];
	};
}


async function cleanupScript(scriptPath: string): Promise<void> {
	try {
		if (fs.existsSync(scriptPath)) {
			fs.unlinkSync(scriptPath);
			console.log(`Cleaned up script: ${scriptPath}`);
		}
	} catch (error) {
		console.warn(`Failed to cleanup script ${scriptPath}:`, error);
		// Don't throw error - cleanup should not break main process
	}
}

// File processing functions
function detectBinaryFiles(items: INodeExecutionData[]): BinaryFileInfo[] {
	const binaryFiles: BinaryFileInfo[] = [];
	
	for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
		const item = items[itemIndex];
		if (item.binary) {
			for (const [key, binaryData] of Object.entries(item.binary)) {
				if (binaryData && binaryData.data && binaryData.fileName) {
					binaryFiles.push({
						key,
						data: {
							data: binaryData.data,
							fileName: binaryData.fileName,
							mimeType: binaryData.mimeType || 'application/octet-stream',
							fileExtension: binaryData.fileExtension,
						},
						itemIndex,
					});
				}
			}
		}
	}
	
	return binaryFiles;
}

function validateFile(binaryFile: BinaryFileInfo, options: FileProcessingOptions): void {
	// Check file size
	const buffer = Buffer.from(binaryFile.data.data, 'base64');
	const sizeInMB = buffer.length / (1024 * 1024);
	
	if (sizeInMB > options.maxFileSize) {
		throw new Error(`File "${binaryFile.data.fileName}" is too large: ${sizeInMB.toFixed(2)}MB > ${options.maxFileSize}MB`);
	}
	
	console.log(`File "${binaryFile.data.fileName}" validated: ${sizeInMB.toFixed(2)}MB, type: ${binaryFile.data.mimeType}`);
}

function getFileExtension(filename: string): string {
	const extension = path.extname(filename).toLowerCase();
	return extension.startsWith('.') ? extension.substring(1) : extension;
}

function sanitizeFileName(filename: string): string {
	// Remove or replace dangerous characters
	return filename.replace(/[<>:"/\\|?*\x00-\x1f]/g, '_').substring(0, 255);
}

async function createTemporaryFiles(binaryFiles: BinaryFileInfo[], options: FileProcessingOptions): Promise<FileMapping[]> {
	const fileMappings: FileMapping[] = [];
	
	for (const binaryFile of binaryFiles) {
		try {
			// Validate file first
			validateFile(binaryFile, options);
			
			const buffer = Buffer.from(binaryFile.data.data, 'base64');
			const extension = getFileExtension(binaryFile.data.fileName);
			const sanitizedFileName = sanitizeFileName(binaryFile.data.fileName);
			
			const fileMapping: FileMapping = {
				filename: binaryFile.data.fileName,
				mimetype: binaryFile.data.mimeType,
				size: buffer.length,
				binaryKey: binaryFile.key,
				itemIndex: binaryFile.itemIndex,
				extension,
			};
			
			// Add base64 data if requested
			if (options.accessMethod === 'base64' || options.accessMethod === 'both') {
				fileMapping.base64Data = binaryFile.data.data;
			}
			
			// Create temporary file if requested
			if (options.accessMethod === 'temp_files' || options.accessMethod === 'both') {
				const tempPath = tempy.file({ 
					extension: extension || 'bin',
				});
				
				// Write the base64 data directly as binary
				await fs.promises.writeFile(tempPath, binaryFile.data.data, 'base64');
				fileMapping.tempPath = tempPath;
				
				console.log(`Created temporary file: ${tempPath} (${(buffer.length / 1024).toFixed(1)}KB)`);
			}
			
			fileMappings.push(fileMapping);
			
		} catch (error) {
			console.error(`Failed to process file "${binaryFile.data.fileName}":`, error);
			throw new Error(`File processing failed for "${binaryFile.data.fileName}": ${(error as Error).message}`);
		}
	}
	
	return fileMappings;
}

async function cleanupTemporaryFiles(fileMappings: FileMapping[]): Promise<void> {
	let cleanedCount = 0;
	let errorCount = 0;
	
	for (const fileMapping of fileMappings) {
		if (fileMapping.tempPath) {
			try {
				if (fs.existsSync(fileMapping.tempPath)) {
					await fs.promises.unlink(fileMapping.tempPath);
					cleanedCount++;
				}
			} catch (error) {
				errorCount++;
				console.warn(`Failed to cleanup temporary file: ${fileMapping.tempPath}`, error);
				// Don't throw - cleanup should not break main process
			}
		}
	}
	
	if (cleanedCount > 0) {
		console.log(`Cleaned up ${cleanedCount} temporary files`);
	}
	if (errorCount > 0) {
		console.warn(`Failed to cleanup ${errorCount} temporary files`);
	}
}


export class PythonFunction implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Python Function (Raw)',
		name: 'pythonFunctionRaw',
		icon: 'fa:code',
		group: ['transform'],
		version: 1,
		description: 'Run custom Python script once and return raw output (exitCode, stdout, stderr)',
		defaults: {
			name: 'PythonFunctionRaw',
			color: '#4B8BBE',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'pythonEnvVars',
				required: false,
			},
		],
		properties: [
			{
				displayName: 'Credentials Management',
				name: 'credentialsManagement',
				type: 'collection',
				default: {},
				placeholder: 'Add Credential Options',
				description: 'Configure how credentials are included in the Python script',
				options: [
					{
						displayName: 'Use Default Credential',
						name: 'useDefaultCredential',
						type: 'boolean',
						default: true,
						description: 'Include the credential selected in "Credential to connect with" dropdown above',
					},
					{
						displayName: 'Multiple Credentials Method',
						name: 'multipleCredentialsMethod',
						type: 'options',
						options: [
							{
								name: 'None (Use Default Only)',
								value: 'none',
								description: 'Use only the default credential from "Credential to connect with"',
							},
							{
								name: 'Credential Names List',
								value: 'names_list',
								description: 'Enter credential names as comma-separated text',
							},
							{
								name: 'Additional Credential Selectors',
								value: 'selectors',
								description: 'Use multiple credential selector dropdowns',
							},
							{
								name: 'Dynamic Credential Collection',
								value: 'collection',
								description: 'Add/remove credential selectors dynamically',
							},
							{
								name: 'JSON Configuration',
								value: 'json_config',
								description: 'Define credentials using JSON configuration',
							},
						],
						default: 'none',
						description: 'Choose how to add multiple credentials to the script',
					},
					{
						displayName: 'Credential Names',
						name: 'credentialNamesList',
						type: 'string',
						default: '',
						placeholder: 'credential1, credential2, credential3',
						description: 'Enter credential names separated by commas (must match exact credential names)',
						displayOptions: {
							show: {
								multipleCredentialsMethod: ['names_list'],
							},
						},
					},
					{
						displayName: 'Additional Credential 1',
						name: 'additionalCredential1',
						type: 'string',
						default: '',
						placeholder: 'Enter credential name',
						description: 'Enter name of first additional Python Environment Variables credential',
						displayOptions: {
							show: {
								multipleCredentialsMethod: ['selectors'],
							},
						},
					},
					{
						displayName: 'Additional Credential 2',
						name: 'additionalCredential2',
						type: 'string',
						default: '',
						placeholder: 'Enter credential name',
						description: 'Enter name of second additional Python Environment Variables credential',
						displayOptions: {
							show: {
								multipleCredentialsMethod: ['selectors'],
							},
						},
					},
					{
						displayName: 'Additional Credential 3',
						name: 'additionalCredential3',
						type: 'string',
						default: '',
						placeholder: 'Enter credential name',
						description: 'Enter name of third additional Python Environment Variables credential',
						displayOptions: {
							show: {
								multipleCredentialsMethod: ['selectors'],
							},
						},
					},
					{
						displayName: 'Credential Collection',
						name: 'credentialCollection',
						type: 'fixedCollection',
						default: { credentials: [] },
						typeOptions: {
							multipleValues: true,
						},
						description: 'Add multiple credentials dynamically',
						displayOptions: {
							show: {
								multipleCredentialsMethod: ['collection'],
							},
						},
						options: [
							{
								displayName: 'Credentials',
								name: 'credentials',
								values: [
									{
										displayName: 'Credential Name',
										name: 'credentialName',
										type: 'string',
										default: '',
										placeholder: 'Enter credential name',
										description: 'Enter name of Python Environment Variables credential',
									},
									{
										displayName: 'Variable Prefix',
										name: 'variablePrefix',
										type: 'string',
										default: '',
										placeholder: 'API1_, PROD_, etc.',
										description: 'Optional prefix to add to all variables from this credential',
									},
								],
							},
						],
					},
					{
						displayName: 'JSON Configuration',
						name: 'jsonConfiguration',
						type: 'json',
						default: '{\n  "credentials": [\n    {\n      "name": "credential1",\n      "prefix": "API1_"\n    },\n    {\n      "name": "credential2",\n      "prefix": "PROD_"\n    }\n  ],\n  "mergeStrategy": "last_wins"\n}',
						description: 'Define credentials configuration in JSON format',
						displayOptions: {
							show: {
								multipleCredentialsMethod: ['json_config'],
							},
						},
					},
					{
						displayName: 'Variable Merge Strategy',
						name: 'mergeStrategy',
						type: 'options',
						options: [
							{
								name: 'Last Selected Wins',
								value: 'last_wins',
								description: 'If variables have same name, last credential wins',
							},
							{
								name: 'First Selected Wins', 
								value: 'first_wins',
								description: 'If variables have same name, first credential wins',
							},
							{
								name: 'Prefix with Source',
								value: 'prefix_source',
								description: 'Add credential name prefix to variables (e.g., CRED1_API_KEY)',
							},
							{
								name: 'Skip Conflicts',
								value: 'skip_conflicts',
								description: 'Skip variables that would conflict (keep first occurrence)',
							},
						],
						default: 'last_wins',
						description: 'How to handle variable name conflicts between credentials',
						displayOptions: {
							show: {
								multipleCredentialsMethod: ['names_list', 'selectors', 'collection'],
							},
						},
					},
					{
						displayName: 'Hide Variable Values in Generated Script',
						name: 'hideVariableValues',
						type: 'boolean',
						default: false,
						description: 'Replace variable values with asterisks in generated scripts (for security)',
					},
				],
			},
			{
				displayName: 'Python Code',
				name: 'functionCode',
				typeOptions: {
					alwaysOpenEditWindow: true,
					rows: 15,
				},
				type: 'string',
				default: `# Example: Use with "Inject Variables" enabled (default)
# Environment and credentials variables are available as individual variables
# Control what's included via Script Generation Options

import json
import sys

# Input data from previous nodes (if "Include input_items Array" enabled)
print("Input items count:", len(input_items))

# Environment variables are available individually:
# MY_API_KEY, DB_HOST, PORT, etc. (from credentials or system env)

# Binary files from previous nodes (if "File Processing" enabled)
if 'input_files' in globals() and input_files:
    print(f"Found {len(input_files)} files:")
    for file_info in input_files:
        filename = file_info['filename']
        size_mb = file_info['size'] / (1024 * 1024)
        file_type = file_info['extension']
        
        print(f"  - {filename} ({size_mb:.2f}MB, type: {file_type})")
        
        # Access file content
        if 'temp_path' in file_info:
            # Read via temporary file path (recommended)
            file_path = file_info['temp_path']
            with open(file_path, 'rb') as f:
                content = f.read()
                print(f"    Read {len(content)} bytes from {file_path}")
        
        elif 'base64_data' in file_info:
            # Read via base64 data  
            import base64
            content = base64.b64decode(file_info['base64_data'])
            print(f"    Decoded {len(content)} bytes from base64")

# Legacy env_vars dict (if "Include env_vars Dictionary" enabled)
# print("Environment variables in dict:", len(env_vars))

result = {"processed_count": len(input_items), "status": "success"}
if 'input_files' in globals():
    result["files_processed"] = len(input_files)

print(json.dumps(result))

# ===== OR =====
# Disable "Inject Variables" to run pure Python code:
# 
# import requests  # pip install requests
# response = requests.get("https://api.github.com/users/octocat")
# print(response.json())
`,
				description: 'Python script to execute. Use "Inject Variables" option to access input_items and env_vars.',
				noDataExpression: true,
			},
			{
				displayName: 'Inject Variables',
				name: 'injectVariables',
				type: 'boolean',
				default: true,
				description: 'Whether to inject input_items and env_vars variables. Disable for pure Python scripts.',
			},
			{
				displayName: 'Python Executable',
				name: 'pythonPath',
				type: 'string',
				default: 'python3',
				description: 'Path to Python executable (python3, python, or full path)',
			},
			{
				displayName: 'Error Handling',
				name: 'errorHandling',
				type: 'options',
				options: [
					{
						name: 'Return Error Details',
						value: 'details',
						description: 'Continue execution and return error information as output data (default behavior)',
					},
					{
						name: 'Throw Error on Non-Zero Exit',
						value: 'throw',
						description: 'Stop workflow execution if script exits with non-zero code or system error occurs',
					},
					{
						name: 'Ignore Exit Code',
						value: 'ignore',
						description: 'Continue execution regardless of exit code, only throw on system errors',
					},
				],
				default: 'details',
				description: 'How to handle Python script errors and non-zero exit codes',
			},
			{
				displayName: 'Debug/Test Mode',
				name: 'debugMode',
				type: 'options',
				options: [
					{
						name: 'Off',
						value: 'off',
						description: 'Normal execution without debug information (default)',
					},
					{
						name: 'Basic Debug',
						value: 'basic',
						description: 'Add script content and basic execution info to output',
					},
					{
						name: 'Full Debug',
						value: 'full',
						description: 'Add script content, metadata, timing, and detailed execution info',
					},
					{
						name: 'Test Only',
						value: 'test',
						description: 'Validate script and show preview without executing (safe testing)',
					},
					{
						name: 'Export Script',
						value: 'export',
						description: 'Full debug information plus script file as binary attachment',
					},
				],
				default: 'off',
				description: 'Choose debug and testing options for script development and troubleshooting',
			},
			{
				displayName: 'Script Export Format',
				name: 'scriptExportFormat',
				type: 'options',
				displayOptions: {
					show: {
						debugMode: ['export'],
					},
				},
				options: [
					{
						name: 'Python File (.py)',
						value: 'py',
						description: 'Export as .py file (standard Python script format)',
					},
					{
						name: 'Text File (.txt)',
						value: 'txt',
						description: 'Export as .txt file (useful when .py files are blocked by security policies)',
					},
				],
				default: 'py',
				description: 'Choose the file format for script export in debug mode',
			},
			{
				displayName: 'Script Generation Options',
				name: 'scriptOptions',
				type: 'collection',
				default: {},
				placeholder: 'Add Option',
				options: [
					{
						displayName: 'Include input_items Array',
						name: 'includeInputItems',
						type: 'boolean',
						default: true,
						description: 'Include input_items array in script (for accessing input data from previous nodes)',
					},
					{
						displayName: 'Include env_vars Dictionary',
						name: 'includeEnvVarsDict',
						type: 'boolean',
						default: false,
						description: 'Include env_vars dictionary in script (for legacy compatibility - variables are already available individually)',
					},
					{
						displayName: 'System Environment Variables',
						name: 'systemEnvVars',
						type: 'multiOptions',
						default: [],
						description: 'Select system environment variables to include in the script',
						options: [],
						typeOptions: {
							loadOptionsMethod: 'getSystemEnvVars',
						},
					},
				],
			},
			{
				displayName: 'File Processing',
				name: 'fileProcessing',
				type: 'collection',
				default: {},
				placeholder: 'Add File Options',
				description: 'Configure processing of binary files from previous nodes',
				options: [
					{
						displayName: 'Enable File Processing',
						name: 'enabled',
						type: 'boolean',
						default: false,
						description: 'Automatically extract binary files from input and make them available in Python script',
					},
					{
						displayName: 'File Access Method',
						name: 'accessMethod',
						type: 'options',
						options: [
							{
								name: 'Temporary Files (Recommended)',
								value: 'temp_files',
								description: 'Save files to temporary paths accessible in script',
							},
							{
								name: 'Base64 Content',
								value: 'base64',
								description: 'Provide file content as base64 strings',
							},
							{
								name: 'Both Methods',
								value: 'both',
								description: 'Provide both temporary file paths and base64 content',
							},
						],
						default: 'temp_files',
						description: 'How to provide file access in the Python script',
						displayOptions: {
							show: {
								enabled: [true],
							},
						},
					},
					{
						displayName: 'Max File Size (MB)',
						name: 'maxFileSize',
						type: 'number',
						typeOptions: {
							minValue: 1,
							maxValue: 1000,
						},
						default: 100,
						description: 'Maximum file size to process (1-1000 MB)',
						displayOptions: {
							show: {
								enabled: [true],
							},
						},
					},
					{
						displayName: 'Include File Metadata',
						name: 'includeMetadata',
						type: 'boolean',
						default: true,
						description: 'Include file metadata (size, mimetype, etc.) in script variables',
						displayOptions: {
							show: {
								enabled: [true],
							},
						},
					},
					{
						displayName: 'Auto-cleanup Temporary Files',
						name: 'autoCleanup',
						type: 'boolean',
						default: true,
						description: 'Automatically delete temporary files after script execution',
						displayOptions: {
							show: {
								enabled: [true],
								accessMethod: ['temp_files', 'both'],
							},
						},
					},
				],
			},
			{
				displayName: 'Output File Processing',
				name: 'outputFileProcessing',
				type: 'collection',
				default: {},
				placeholder: 'Add Output File Options',
				description: 'Configure automatic detection and processing of files generated by Python script',
				options: [
					{
						displayName: 'Enable Output File Processing',
						name: 'enabled',
						type: 'boolean',
						default: false,
						description: 'Automatically detect and process files created by Python script in output directory',
					},
					{
						displayName: 'Max Output File Size (MB)',
						name: 'maxOutputFileSize',
						type: 'number',
						typeOptions: {
							minValue: 1,
							maxValue: 1000,
						},
						default: 100,
						description: 'Maximum output file size to process (1-1000 MB)',
						displayOptions: {
							show: {
								enabled: [true],
							},
						},
					},
					{
						displayName: 'Auto-cleanup Output Directory',
						name: 'autoCleanupOutput',
						type: 'boolean',
						default: true,
						description: 'Automatically delete output directory and files after processing',
						displayOptions: {
							show: {
								enabled: [true],
							},
						},
					},
					{
						displayName: 'Include File Metadata in Output',
						name: 'includeOutputMetadata',
						type: 'boolean',
						default: true,
						description: 'Include file metadata (size, mimetype, etc.) in output JSON',
						displayOptions: {
							show: {
								enabled: [true],
							},
						},
					},
					{
						displayName: 'Auto-Intercept File Operations',
						name: 'autoInterceptFiles',
						type: 'boolean',
						default: true,
						description: 'Automatically redirect all file write operations to output directory (works with any script without modification)',
						displayOptions: {
							show: {
								enabled: [true],
							},
						},
					},
					{
						displayName: 'Expected Output Filename',
						name: 'expectedFileName',
						type: 'string',
						default: 'result.json',
						placeholder: 'report.pdf, data.csv, result.json, etc.',
						description: 'Filename you expect the Python script to create (required for automatic file detection)',
						displayOptions: {
							show: {
								enabled: [true],
							},
						},
					},
					{
						displayName: 'File Detection Mode',
						name: 'fileDetectionMode',
						type: 'options',
						options: [
							{
								name: 'Ready Variable Path',
								value: 'variable_path',
								description: 'Add output_file_path variable with full path to your script (recommended)',
							},
							{
								name: 'Auto Search by Name',
								value: 'auto_search',
								description: 'Automatically find file by name after script execution',
							},
						],
						default: 'variable_path',
						description: 'How to provide the output file path to your Python script',
						displayOptions: {
							show: {
								enabled: [true],
							},
						},
					},
				],
			},
			{
				displayName: 'Parse Output',
				name: 'parseOutput',
				type: 'options',
				options: [
					{
						name: 'None (Raw String)',
						value: 'none',
						description: 'Return stdout as raw string',
					},
					{
						name: 'JSON',
						value: 'json',
						description: 'Parse stdout as JSON object',
					},
					{
						name: 'Lines',
						value: 'lines',
						description: 'Split stdout into array of lines',
					},
					{
						name: 'Smart Auto-detect',
						value: 'smart',
						description: 'Automatically detect and parse JSON, CSV, or return lines',
					},
				],
				default: 'none',
				description: 'How to parse the stdout output for easier data access',
			},
			{
				displayName: 'Parse Options',
				name: 'parseOptions',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
						displayOptions: {
							show: {
						parseOutput: ['json', 'smart'],
					},
				},
				options: [
					{
						displayName: 'Handle Multiple JSON Objects',
						name: 'multipleJson',
						type: 'boolean',
						default: false,
						description: 'Parse multiple JSON objects separated by newlines',
					},
					{
						displayName: 'Strip Non-JSON Text',
						name: 'stripNonJson',
						type: 'boolean',
						default: true,
						description: 'Remove non-JSON text before and after JSON content',
					},
					{
						displayName: 'Fallback on Parse Error',
						name: 'fallbackOnError',
						type: 'boolean',
						default: true,
						description: 'Keep original stdout if parsing fails',
					},
				],
			},
			{
				displayName: 'Execution Mode',
				name: 'executionMode',
				type: 'options',
				options: [
					{
						name: 'Once for All Items',
						value: 'once',
						description: 'Execute script once with all input items available (faster)',
					},
					{
						name: 'Once per Item',
						value: 'perItem',
						description: 'Execute script separately for each input item (slower but more flexible)',
					},
				],
				default: 'once',
				description: 'Choose how many times to execute the Python script',
			},
			{
				displayName: 'Pass Through Input Data',
				name: 'passThrough',
						type: 'boolean',
				default: false,
				description: 'Include original input data in the output alongside Python script results',
			},
			{
				displayName: 'Pass Through Mode',
				name: 'passThroughMode',
				type: 'options',
						displayOptions: {
							show: {
						passThrough: [true],
					},
				},
				options: [
					{
						name: 'Merge with Result',
						value: 'merge',
						description: 'Add input fields directly to the result object',
					},
					{
						name: 'Separate Field',
						value: 'separate',
						description: 'Add input data as "inputData" field in result',
					},
					{
						name: 'Multiple Outputs',
						value: 'multiple',
						description: 'Return separate items for input data and Python result',
					},
				],
				default: 'separate',
				description: 'How to include input data in the output',
			},
			{
				displayName: 'File Debug Options',
				name: 'fileDebugOptions',
				type: 'collection',
				default: {},
				placeholder: 'Add Debug Options',
				description: 'Advanced debugging options for file processing issues',
				options: [
					{
						displayName: 'Enable File Debugging',
						name: 'enabled',
						type: 'boolean',
						default: false,
						description: 'Include detailed file processing information in output for troubleshooting',
					},
					{
						displayName: 'Debug Input Files',
						name: 'includeInputFileDebug',
						type: 'boolean',
						default: true,
						description: 'Include detailed information about input files processing',
						displayOptions: {
							show: {
								enabled: [true],
							},
						},
					},
					{
						displayName: 'Debug Output Files',
						name: 'includeOutputFileDebug',
						type: 'boolean',
						default: true,
						description: 'Include detailed information about output files and directory scanning',
						displayOptions: {
							show: {
								enabled: [true],
							},
						},
					},
					{
						displayName: 'Include System Information',
						name: 'includeSystemInfo',
						type: 'boolean',
						default: true,
						description: 'Include system information like permissions, disk space, environment variables',
						displayOptions: {
							show: {
								enabled: [true],
							},
						},
					},
					{
						displayName: 'Include Directory Listings',
						name: 'includeDirectoryListing',
						type: 'boolean',
						default: false,
						description: 'Include file listings from working directory, temp directory, and output directory',
						displayOptions: {
							show: {
								enabled: [true],
							},
						},
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {

		let items = this.getInputData();
		// Copy the items as they may get changed in the functions
		items = JSON.parse(JSON.stringify(items));

		// Get the python code snippet
		const functionCode = this.getNodeParameter('functionCode', 0) as string;
		const pythonPath = this.getNodeParameter('pythonPath', 0) as string;
		const injectVariables = this.getNodeParameter('injectVariables', 0) as boolean;
		const errorHandling = this.getNodeParameter('errorHandling', 0) as string;
		const debugMode = this.getNodeParameter('debugMode', 0) as string;
		const parseOutput = this.getNodeParameter('parseOutput', 0) as string;
		const scriptExportFormat = this.getNodeParameter('scriptExportFormat', 0, 'py') as string;
		const parseOptions = (['json', 'smart'].includes(parseOutput)) ? 
			this.getNodeParameter('parseOptions', 0) as ParseOptions : 
			{} as ParseOptions;
		const executionMode = this.getNodeParameter('executionMode', 0) as string;
		const passThrough = this.getNodeParameter('passThrough', 0) as boolean;
		const passThroughMode = passThrough ? this.getNodeParameter('passThroughMode', 0) as string : 'separate';
		
		// Get script generation options
		const scriptOptions = this.getNodeParameter('scriptOptions', 0) as {
			includeInputItems?: boolean;
			includeEnvVarsDict?: boolean;
			systemEnvVars?: string[];
		};
		const includeInputItems = scriptOptions.includeInputItems !== false; // default true
		const includeEnvVarsDict = scriptOptions.includeEnvVarsDict === true; // default false
		const systemEnvVars = scriptOptions.systemEnvVars || [];
		
		// Get file processing options
		const fileProcessingConfig = this.getNodeParameter('fileProcessing', 0, {}) as {
			enabled?: boolean;
			accessMethod?: string;
			maxFileSize?: number;
			includeMetadata?: boolean;
			autoCleanup?: boolean;
		};
		
		const fileProcessingOptions: FileProcessingOptions = {
			enabled: fileProcessingConfig.enabled === true, // default false
			accessMethod: (fileProcessingConfig.accessMethod as 'temp_files' | 'base64' | 'both') || 'temp_files',
			maxFileSize: fileProcessingConfig.maxFileSize || 100,
			includeMetadata: fileProcessingConfig.includeMetadata !== false, // default true
			autoCleanup: fileProcessingConfig.autoCleanup !== false, // default true
		};
		
		// Get output file processing options
		const outputFileProcessingConfig = this.getNodeParameter('outputFileProcessing', 0, {}) as {
			enabled?: boolean;
			maxOutputFileSize?: number;
			autoCleanupOutput?: boolean;
			includeOutputMetadata?: boolean;
			autoInterceptFiles?: boolean;
			expectedFileName?: string;
			fileDetectionMode?: 'variable_path' | 'auto_search';
		};
		
		const outputFileProcessingOptions: OutputFileProcessingOptions = {
			enabled: outputFileProcessingConfig.enabled === true, // default false
			maxOutputFileSize: outputFileProcessingConfig.maxOutputFileSize || 100,
			autoCleanupOutput: outputFileProcessingConfig.autoCleanupOutput !== false, // default true
			includeOutputMetadata: outputFileProcessingConfig.includeOutputMetadata !== false, // default true
			autoInterceptFiles: outputFileProcessingConfig.autoInterceptFiles !== false, // default false
			expectedFileName: outputFileProcessingConfig.expectedFileName,
			fileDetectionMode: outputFileProcessingConfig.fileDetectionMode || 'variable_path',
		};
		
		// Get file debug options
		const fileDebugConfig = this.getNodeParameter('fileDebugOptions', 0, {}) as {
			enabled?: boolean;
			includeInputFileDebug?: boolean;
			includeOutputFileDebug?: boolean;
			includeSystemInfo?: boolean;
			includeDirectoryListing?: boolean;
		};
		
		const fileDebugOptions: FileDebugOptions = {
			enabled: fileDebugConfig.enabled === true, // default false
			includeInputFileDebug: fileDebugConfig.includeInputFileDebug !== false, // default true when debugging enabled
			includeOutputFileDebug: fileDebugConfig.includeOutputFileDebug !== false, // default true when debugging enabled
			includeSystemInfo: fileDebugConfig.includeSystemInfo !== false, // default true when debugging enabled
			includeDirectoryListing: fileDebugConfig.includeDirectoryListing === true, // default false
		};
		
		// Create output directory if output file processing is enabled
		let outputDir: string | undefined;
		let outputDirToCleanup: string | undefined;
		
		if (outputFileProcessingOptions.enabled) {
			try {
				outputDir = createUniqueOutputDirectory();
				if (outputFileProcessingOptions.autoCleanupOutput) {
					outputDirToCleanup = outputDir;
				}
				console.log(`Output file processing enabled, created directory: ${outputDir}`);
			} catch (error) {
				console.error('Failed to create output directory:', error);
				throw new NodeOperationError(this.getNode(), `Failed to create output directory: ${(error as Error).message}`);
			}
		}
		
		// Log configuration
		console.log('Python Function Raw node configuration:', {
			pythonPath,
			injectVariables,
			errorHandling,
			 debugMode,
			parseOutput,
			parseOptions,
			executionMode,
			passThrough,
			passThroughMode,
			inputItemsCount: items.length,
		});
		
		// Get credentials management configuration
		const credentialsConfig = this.getNodeParameter('credentialsManagement', 0, {}) as {
			useDefaultCredential?: boolean;
			hideVariableValues?: boolean;
			multipleCredentialsMethod?: string;
			credentialNamesList?: string;
			additionalCredential1?: string;
			additionalCredential2?: string;
			additionalCredential3?: string;
			credentialCollection?: { credentials: Array<{ credentialName: string; variablePrefix?: string }> };
			jsonConfiguration?: string;
			mergeStrategy?: string;
		};
		const useDefaultCredential = credentialsConfig.useDefaultCredential !== false; // default true
		const hideCredentialValues = credentialsConfig.hideVariableValues === true; // default false
		const multipleCredentialsMethod = credentialsConfig.multipleCredentialsMethod || 'none';
		const mergeStrategy = credentialsConfig.mergeStrategy || 'last_wins';
		
		// Get the environment variables from credentials
		let pythonEnvVars: Record<string, string> = {};
		let credentialSources: Record<string, string> = {};
		
		try {
			// Load default credential first if enabled
			if (useDefaultCredential) {
				const credentialData = await this.getCredentials('pythonEnvVars');
				if (credentialData && credentialData.envFileContent) {
					pythonEnvVars = parseEnvFile(String(credentialData.envFileContent));
					const credentialName = String(credentialData.name || 'default_credential');
					credentialSources = Object.keys(pythonEnvVars).reduce((acc, key) => {
						acc[key] = credentialName;
						return acc;
					}, {} as Record<string, string>);
					console.log(`Loaded ${Object.keys(pythonEnvVars).length} variables from default credential (${credentialName})`);
				}
			}
			
			// Load additional credentials based on method
			if (multipleCredentialsMethod !== 'none') {
				const additionalEnvVars = await loadMultipleCredentials(
					this,
					credentialsConfig,
					multipleCredentialsMethod,
					mergeStrategy,
				);
				
				// Merge additional credentials with default credential
				for (const [key, value] of Object.entries(additionalEnvVars.envVars)) {
					let finalKey = key;
					
					// Apply merge strategy
					switch (mergeStrategy) {
						case 'first_wins':
							if (pythonEnvVars[key] !== undefined) continue;
							break;
						case 'skip_conflicts':
							if (pythonEnvVars[key] !== undefined) continue;
							break;
						case 'prefix_source':
							const source = additionalEnvVars.credentialSources[key] || 'unknown';
							const safeSource = source.replace(/[^a-zA-Z0-9_]/g, '_').toUpperCase();
							finalKey = `${safeSource}_${key}`;
							break;
						case 'last_wins':
						default:
							// Overwrite without checking
							break;
					}
					
					pythonEnvVars[finalKey] = value;
					credentialSources[finalKey] = String(additionalEnvVars.credentialSources[key] || 'unknown');
				}
				
				console.log(`Total loaded variables after merging: ${Object.keys(pythonEnvVars).length}`);
			}
		} catch (error) {
			console.warn('Error loading credentials:', error);
			if (Object.keys(pythonEnvVars).length === 0) {
				pythonEnvVars = {};
				credentialSources = {};
			}
		}
		
		// Add selected system environment variables
		const systemEnvVarsToAdd: Record<string, string> = {};
		for (const envVarName of systemEnvVars) {
			if (process.env[envVarName] !== undefined) {
				systemEnvVarsToAdd[envVarName] = process.env[envVarName]!;
			}
		}
		
		// Merge system env vars with credential env vars (credentials take precedence)
		const mergedEnvVars = { ...systemEnvVarsToAdd, ...pythonEnvVars };
		
		// Add credential source tracking to merged env vars
		const mergedCredentialSources = { 
			...Object.keys(systemEnvVarsToAdd).reduce((acc, key) => {
				acc[key] = 'system_environment';
				return acc;
			}, {} as Record<string, string>),
			...credentialSources,
		};
		
		// Process binary files if enabled
		let inputFiles: FileMapping[] = [];
		let tempFilesToCleanup: FileMapping[] = [];
		
		if (fileProcessingOptions.enabled) {
			try {
				console.log('File processing enabled, detecting binary files...');
				const binaryFiles = detectBinaryFiles(items);
				
				if (binaryFiles.length > 0) {
					console.log(`Found ${binaryFiles.length} binary files in input`);
					inputFiles = await createTemporaryFiles(binaryFiles, fileProcessingOptions);
					
					// Keep track of temp files for cleanup
					if (fileProcessingOptions.autoCleanup) {
						tempFilesToCleanup = inputFiles.filter(f => f.tempPath);
					}
					
					console.log(`Processed ${inputFiles.length} files for Python script access`);
				} else {
					console.log('No binary files found in input data');
				}
			} catch (error) {
				console.error('File processing failed:', error);
				// Cleanup any partial temp files
				if (tempFilesToCleanup.length > 0) {
					await cleanupTemporaryFiles(tempFilesToCleanup);
				}
				throw new NodeOperationError(this.getNode(), `File processing failed: ${(error as Error).message}`);
			}
		}
		
		// Prepare to pass inputFiles to execution functions  
		try {
			// Execute based on mode
			if (executionMode === 'perItem') {
				return await executePerItem(
					this,
					functionCode, 
					pythonPath, 
					injectVariables, 
					errorHandling, 
					debugMode, 
					parseOutput, 
					parseOptions, 
					passThrough, 
					passThroughMode, 
					items, 
					mergedEnvVars,
					includeInputItems,
					includeEnvVarsDict,
					hideCredentialValues,
					systemEnvVars,
					mergedCredentialSources,
					inputFiles,
					outputDir,
					outputFileProcessingOptions,
					fileDebugOptions,
					scriptExportFormat,
				);
			} else {
				return await executeOnce(
					this,
					functionCode, 
					pythonPath, 
					injectVariables, 
					errorHandling, 
					 debugMode, 
					parseOutput, 
					parseOptions, 
					passThrough, 
					passThroughMode, 
					items, 
					mergedEnvVars,
					includeInputItems,
					includeEnvVarsDict,
					hideCredentialValues,
					systemEnvVars,
					mergedCredentialSources,
					inputFiles,
					outputDir,
					outputFileProcessingOptions,
					fileDebugOptions,
					scriptExportFormat,
				);
			}
		} catch (error) {
			throw new NodeOperationError(this.getNode(), `Error executing Python script: ${(error as Error).message}`);
		} finally {
			// Cleanup temporary files if enabled
			if (tempFilesToCleanup.length > 0) {
				await cleanupTemporaryFiles(tempFilesToCleanup);
			}
			
			// Cleanup output directory if needed
			if (outputDirToCleanup) {
				try {
					await cleanupOutputDirectory(outputDirToCleanup);
				} catch (error) {
					console.warn('Failed to cleanup output directory:', error);
					// Don't throw error - cleanup should not break main process
				}
			}
		}
	}

	async getSystemEnvVars(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
		const envVars = Object.keys(process.env).filter(key => {
			// Filter out sensitive or system-specific variables
			const sensitivePatterns = [
				/^HOME$/,
				/^USER$/,
				/^SHELL$/,
				/^PWD$/,
				/^PATH$/,
				/^TEMP$/,
				/^TMP$/,
				/PASS/i,
				/SECRET/i,
				/TOKEN/i,
				/API_KEY/i,
				/PRIVATE/i,
			];
			
			return !sensitivePatterns.some(pattern => pattern.test(key));
		}).sort();
		
		return envVars.map(key => ({
			name: `${key} = ${process.env[key]?.substring(0, 50)}${(process.env[key]?.length || 0) > 50 ? '...' : ''}`,
			value: key,
		}));
	}

	// Method to get available Python Environment Variables credentials
	async getPythonEnvVarsCredentials(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
		// Since n8n doesn't provide a way to list all available credentials of a type,
		// we'll return informational options to guide the user
		return [
			{
				name: '⚠️ Use the main "Credential to connect with" dropdown above',
				value: '__use_main_credential__',
				description: 'The credential selected in "Credential to connect with" will be used automatically',
			},
			{
				name: '💡 Enable "Include All Available Credentials" option',
				value: '__use_include_all__',
				description: 'This will automatically include all available Python Environment Variables credentials',
			},
			{
				name: '📝 Note: Multi-credential selection coming in future update',
				value: '__future_feature__',
				description: 'Currently uses the credential from "Credential to connect with" dropdown',
			},
		];
	}
}


// Helper function to load multiple credentials using different methods
async function loadMultipleCredentials(
	executeFunctions: IExecuteFunctions,
	config: {
		credentialNamesList?: string;
		additionalCredential1?: string;
		additionalCredential2?: string;
		additionalCredential3?: string;
		credentialCollection?: { credentials: Array<{ credentialName: string; variablePrefix?: string }> };
		jsonConfiguration?: string;
	},
	method: string,
	mergeStrategy: string,
): Promise<{envVars: Record<string, string>, credentialSources: Record<string, string>}> {
	const envVars: Record<string, string> = {};
	const credentialSources: Record<string, string> = {};
	
	try {
		switch (method) {
			case 'names_list':
				return await loadCredentialsFromNamesList(executeFunctions, config.credentialNamesList || '');
			
			case 'selectors':
				return await loadCredentialsFromSelectors(executeFunctions, config);
			
			case 'collection':
				return await loadCredentialsFromCollection(executeFunctions, config.credentialCollection);
			
			case 'json_config':
				return await loadCredentialsFromJsonConfig(executeFunctions, config.jsonConfiguration || '{}');
			
			default:
				return { envVars, credentialSources };
		}
	} catch (error) {
		console.warn(`Error loading multiple credentials (${method}):`, error);
		return { envVars, credentialSources };
	}
}

// Load credentials from comma-separated names list
async function loadCredentialsFromNamesList(
	executeFunctions: IExecuteFunctions,
	namesList: string,
): Promise<{envVars: Record<string, string>, credentialSources: Record<string, string>}> {
	const envVars: Record<string, string> = {};
	const credentialSources: Record<string, string> = {};
	
	if (!namesList || namesList.trim() === '') {
		return { envVars, credentialSources };
	}
	
	const credentialNames = namesList.split(',').map(name => name.trim()).filter(name => name);
	console.log(`Loading credentials from names list: ${credentialNames.join(', ')}`);
	
	// For each name, try to load a credential (simulated since n8n API limitations)
	for (const credentialName of credentialNames) {
		try {
			// In real implementation, this would load specific credentials by name
			// For now, we simulate by using the default credential
			const credentialData = await executeFunctions.getCredentials('pythonEnvVars');
			if (credentialData && credentialData.envFileContent) {
				const vars = parseEnvFile(String(credentialData.envFileContent));
				for (const [key, value] of Object.entries(vars)) {
					envVars[key] = String(value);
					credentialSources[key] = credentialName;
				}
			}
		} catch (error) {
			console.warn(`Failed to load credential: ${credentialName}`, error);
		}
	}
	
	return { envVars, credentialSources };
}

// Load credentials from selector fields
async function loadCredentialsFromSelectors(
	executeFunctions: IExecuteFunctions,
	config: {
		additionalCredential1?: string;
		additionalCredential2?: string;
		additionalCredential3?: string;
	},
): Promise<{envVars: Record<string, string>, credentialSources: Record<string, string>}> {
	const envVars: Record<string, string> = {};
	const credentialSources: Record<string, string> = {};
	
	const credentialNames = [
		config.additionalCredential1,
		config.additionalCredential2,
		config.additionalCredential3,
	].filter(name => name && name.trim() !== '');
	
	console.log(`Loading credentials from selectors: ${credentialNames.join(', ')}`);
	
	return await loadCredentialsFromNamesList(executeFunctions, credentialNames.join(', '));
}

// Load credentials from dynamic collection
async function loadCredentialsFromCollection(
	executeFunctions: IExecuteFunctions,
	collection: { credentials?: Array<{ credentialName: string; variablePrefix?: string }> } | undefined,
): Promise<{envVars: Record<string, string>, credentialSources: Record<string, string>}> {
	const envVars: Record<string, string> = {};
	const credentialSources: Record<string, string> = {};
	
	if (!collection || !collection.credentials || !Array.isArray(collection.credentials)) {
		return { envVars, credentialSources };
	}
	
	console.log(`Loading credentials from collection: ${collection.credentials.length} items`);
	
	for (const item of collection.credentials) {
		if (!item.credentialName || item.credentialName.trim() === '') continue;
		
		try {
			// Simulate loading credential by name
			const credentialData = await executeFunctions.getCredentials('pythonEnvVars');
			if (credentialData && credentialData.envFileContent) {
				const vars = parseEnvFile(String(credentialData.envFileContent));
				const prefix = item.variablePrefix || '';
				
				for (const [key, value] of Object.entries(vars)) {
					const finalKey = prefix ? `${prefix}${key}` : key;
					envVars[finalKey] = String(value);
					credentialSources[finalKey] = item.credentialName;
				}
			}
		} catch (error) {
			console.warn(`Failed to load credential from collection: ${item.credentialName}`, error);
		}
	}
	
	return { envVars, credentialSources };
}

// Load credentials from JSON configuration
async function loadCredentialsFromJsonConfig(
	executeFunctions: IExecuteFunctions,
	jsonConfig: string,
): Promise<{envVars: Record<string, string>, credentialSources: Record<string, string>}> {
	const envVars: Record<string, string> = {};
	const credentialSources: Record<string, string> = {};
	
	try {
		const config = JSON.parse(jsonConfig);
		if (!config.credentials || !Array.isArray(config.credentials)) {
			throw new Error('JSON configuration must have a "credentials" array');
		}
		
		console.log(`Loading credentials from JSON config: ${config.credentials.length} items`);
		
		for (const item of config.credentials) {
			if (!item.name || item.name.trim() === '') continue;
			
			try {
				// Simulate loading credential by name
				const credentialData = await executeFunctions.getCredentials('pythonEnvVars');
				if (credentialData && credentialData.envFileContent) {
					const vars = parseEnvFile(String(credentialData.envFileContent));
					const prefix = item.prefix || '';
					
					for (const [key, value] of Object.entries(vars)) {
						const finalKey = prefix ? `${prefix}${key}` : key;
						envVars[finalKey] = String(value);
						credentialSources[finalKey] = item.name;
					}
				}
			} catch (error) {
				console.warn(`Failed to load credential from JSON config: ${item.name}`, error);
			}
		}
	} catch (error) {
		console.warn('Failed to parse JSON configuration:', error);
	}
	
	return { envVars, credentialSources };
}


async function executeOnce(
	executeFunctions: IExecuteFunctions,
	functionCode: string,
	pythonPath: string,
	injectVariables: boolean,
	errorHandling: string,
	debugMode: string,
	parseOutput: string,
	parseOptions: ParseOptions,
	passThrough: boolean,
	passThroughMode: string,
	items: INodeExecutionData[],
	pythonEnvVars: Record<string, string>,
	includeInputItems: boolean,
	includeEnvVarsDict: boolean,
	hideVariableValues: boolean,
	systemEnvVars: string[],
	credentialSources: Record<string, string>,
	inputFiles: FileMapping[],
	outputDir?: string,
	outputFileProcessingOptions?: OutputFileProcessingOptions,
	fileDebugOptions?: FileDebugOptions,
	scriptExportFormat?: string,
): Promise<INodeExecutionData[][]> {

	// Create debug timing and info variables in function scope
	const debugTiming: DebugTiming = {
			script_created_at: new Date().toISOString(),
	};
	let debugInfo: DebugInfo | null = null;
		
	let scriptPath = '';
	try {
		if (injectVariables) {
			scriptPath = await getTemporaryScriptPath(functionCode, unwrapJsonField(items), pythonEnvVars, includeInputItems, includeEnvVarsDict, hideVariableValues, credentialSources, inputFiles, outputDir, outputFileProcessingOptions);
		} else {
			// Even when injectVariables is false, we still need to inject output_dir for Output File Processing
			if (outputDir) {
				// Create script with just output_dir variable injection
				scriptPath = await getTemporaryScriptPath(functionCode, [], {}, false, false, hideVariableValues, undefined, [], outputDir, outputFileProcessingOptions);
			} else {
				scriptPath = await getTemporaryPureScriptPath(functionCode);
			}
		}
	} catch (error) {
		throw new NodeOperationError(executeFunctions.getNode(), `Could not generate temporary script file: ${(error as Error).message}`);
	}

	try {
		// Initialize debug information
		if (debugMode !== 'off') {
			const scriptContent = injectVariables 
				? getScriptCode(functionCode, unwrapJsonField(items), pythonEnvVars, includeInputItems, includeEnvVarsDict, hideVariableValues, credentialSources, inputFiles, outputDir, outputFileProcessingOptions)
				: functionCode;
			
			debugInfo = await createDebugInfo(
				scriptPath,
				scriptContent,
				 pythonPath,
				injectVariables ? unwrapJsonField(items) : undefined,
				injectVariables ? pythonEnvVars : undefined,
				 debugTiming,
				 credentialSources,
			);
		}

		// For Test Only mode, return validation results without execution
		if (debugMode === 'test') {
			const testResult: IDataObject = {
				exitCode: null,
				stdout: '',
				stderr: '',
				success: null,
				error: null,
				inputItemsCount: items.length,
				executedAt: new Date().toISOString(),
				injectVariables,
				parseOutput,
				executionMode: 'once',
				test_mode: true,
				execution_skipped: true,
			};

			if (debugInfo) {
				addDebugInfoToResult(testResult, debugInfo, debugMode);
			}

			const testResultWithPassThrough = handlePassThroughData(testResult, items, passThrough, passThroughMode);
			return executeFunctions.prepareOutputData(testResultWithPassThrough);
		}

		// Execute the Python script
		debugTiming.execution_started_at = new Date().toISOString();
		const execResults = await execPythonSpawn(scriptPath, pythonPath, executeFunctions.sendMessageToUI);
		debugTiming.execution_finished_at = new Date().toISOString();
		debugTiming.total_duration_ms = new Date(debugTiming.execution_finished_at).getTime() - 
			new Date(debugTiming.execution_started_at).getTime();

		const {
			error: returnedError,
			exitCode,
			stdout,
			stderr,
		} = execResults;

		// Parse stdout based on configuration
		let parseResult: ParseResult | null = null;
		if (parseOutput !== 'none') {
			parseResult = parseStdout(stdout, parseOutput, parseOptions);
			console.log('Parse result:', parseResult);
		}

		// Base result object
		const baseResult: IDataObject = {
			exitCode,
			stdout,
			stderr,
			success: exitCode === 0,
			error: exitCode === 0 ? null : 'Script execution failed',
			inputItemsCount: items.length,
			executedAt: new Date().toISOString(),
			injectVariables,
			parseOutput,
			executionMode: 'once',
		};

		// Add parsing results if enabled
		if (parseResult) {
			Object.assign(baseResult, {
				parsed_stdout: parseResult.parsed_stdout,
				parsing_success: parseResult.parsing_success,
				parsing_error: parseResult.parsing_error,
				output_format: parseResult.output_format,
				parsing_method: parseResult.parsing_method,
			});
		}

		// Process output files if enabled
		if (outputFileProcessingOptions?.enabled && outputDir) {
			try {
				const outputFiles = await scanOutputDirectory(outputDir, outputFileProcessingOptions);
				
				// Add output file information to result
				baseResult.outputFiles = outputFiles;
				baseResult.outputFilesCount = outputFiles.length;
				
				console.log(`Found ${outputFiles.length} output files for processing`);
			} catch (error) {
				console.error('Error processing output files:', error);
				baseResult.outputFileError = `Failed to process output files: ${(error as Error).message}`;
			}
		}

		// Add file debug information if enabled
		if (fileDebugOptions?.enabled) {
			try {
				const fileDebugInfo = await createFileDebugInfo(
					inputFiles,
					outputDir,
					outputFileProcessingOptions,
					fileDebugOptions,
				);
				baseResult.fileDebugInfo = fileDebugInfo;
				console.log('File debug information added to result');
			} catch (error) {
				console.error('Error creating file debug info:', error);
				baseResult.fileDebugError = `Failed to create file debug info: ${(error as Error).message}`;
			}
		}

		// Add debug information if enabled
		if (debugInfo && debugMode !== 'off') {
				debugInfo.timing = debugTiming;
				addDebugInfoToResult(baseResult, debugInfo, debugMode);
		}

		// Handle pass through data
		const resultWithPassThrough = handlePassThroughData(baseResult, items, passThrough, passThroughMode);

		// Add output files as binary data if enabled
		if (outputFileProcessingOptions?.enabled && baseResult.outputFiles && Array.isArray(baseResult.outputFiles)) {
			for (const resultItem of resultWithPassThrough) {
				for (const outputFile of baseResult.outputFiles as OutputFileInfo[]) {
					if (!resultItem.binary) {
						resultItem.binary = {};
					}
					resultItem.binary[outputFile.binaryKey] = {
						data: outputFile.base64Data,
						mimeType: outputFile.mimetype,
						fileExtension: outputFile.extension,
						fileName: outputFile.filename,
					};
				}
			}
		}

		// Add binary script file for Export mode
		if (debugMode === 'export' && debugInfo) {
			const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
			const filename = `python_script_${timestamp}.py`;
			const scriptBinary = createScriptBinary(debugInfo.script_content, filename, scriptExportFormat || 'py');
			
			// Add binary data to each result item
			for (const resultItem of resultWithPassThrough) {
				if (!resultItem.binary) {
					resultItem.binary = {};
				}
				Object.assign(resultItem.binary, scriptBinary);
			}
		}

		// If successful, return result
		if (exitCode === 0) {
			return executeFunctions.prepareOutputData(resultWithPassThrough);
		}

		// Parse Python error
		const pythonError = parsePythonError(stderr);

		// Add error details to result
		baseResult.pythonError = pythonError;
		baseResult.detailedError = `Script failed with exit code ${exitCode}. ${pythonError.errorType || 'Error'}: ${pythonError.errorMessage || stderr}`;
		
		// Process output files even for errors if enabled
		if (outputFileProcessingOptions?.enabled && outputDir) {
			try {
				const outputFiles = await scanOutputDirectory(outputDir, outputFileProcessingOptions);
				baseResult.outputFiles = outputFiles;
				baseResult.outputFilesCount = outputFiles.length;
				console.log(`Found ${outputFiles.length} output files for error case`);
			} catch (error) {
				console.error('Error processing output files in error case:', error);
				baseResult.outputFileError = `Failed to process output files: ${(error as Error).message}`;
			}
		}

		// Add debug information if enabled
		if (debugInfo && debugMode !== 'off') {
			debugInfo.timing = debugTiming;
			addDebugInfoToResult(baseResult, debugInfo, debugMode);
		}

		// Handle pass through data
		const errorResultWithPassThrough = handlePassThroughData(baseResult, items, passThrough, passThroughMode);

		// Add output files as binary data for errors if enabled
		if (outputFileProcessingOptions?.enabled && baseResult.outputFiles && Array.isArray(baseResult.outputFiles)) {
			for (const resultItem of errorResultWithPassThrough) {
				for (const outputFile of baseResult.outputFiles as OutputFileInfo[]) {
					if (!resultItem.binary) {
						resultItem.binary = {};
					}
					resultItem.binary[outputFile.binaryKey] = {
						data: outputFile.base64Data,
						mimeType: outputFile.mimetype,
						fileExtension: outputFile.extension,
						fileName: outputFile.filename,
					};
				}
			}
		}

		// Add binary script file for Export mode (even for errors)
		if (debugMode === 'export' && debugInfo) {
			const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
			const filename = `python_script_error_${timestamp}.py`;
			const scriptBinary = createScriptBinary(debugInfo.script_content, filename, scriptExportFormat || 'py');
			
			for (const resultItem of errorResultWithPassThrough) {
				if (!resultItem.binary) {
					resultItem.binary = {};
				}
				Object.assign(resultItem.binary, scriptBinary);
			}
		}

		// Return error details or throw
		if (errorHandling === 'details') {
			console.log('Returning error details:', baseResult);
			return executeFunctions.prepareOutputData(errorResultWithPassThrough);
		} else if (errorHandling === 'throw') {
			throw new NodeOperationError(executeFunctions.getNode(), baseResult.detailedError as string);
		} else {
			// 'ignore' mode - return error details but continue execution
			console.log('Ignoring exit code error:', baseResult);
			return executeFunctions.prepareOutputData(errorResultWithPassThrough);
		}

	} catch (error) {
		const errorMessage = (error as Error).message || String(error);
		const pythonErrorInfo = parsePythonError(errorMessage);
		
		if (errorHandling !== 'throw' || executeFunctions.continueOnFail()) {
			const errorItem: IDataObject = {
				exitCode: -1,
				stdout: '',
				stderr: errorMessage,
				success: false,
				error: errorMessage,
				inputItemsCount: items.length,
				executedAt: new Date().toISOString(),
				injectVariables,
				executionMode: 'once',
				pythonError: pythonErrorInfo,
				detailedError: `System error: ${errorMessage}`,
			};

			// Add debug information if enabled
			if (debugInfo && debugMode !== 'off') {
				debugInfo.timing = debugTiming;
				addDebugInfoToResult(errorItem, debugInfo, debugMode);
			}

			const errorResultWithPassThrough = handlePassThroughData(errorItem, items, passThrough, passThroughMode);

			// Add binary script file for Export mode (even for system errors)
			if (debugMode === 'export' && debugInfo) {
				const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
				const filename = `python_script_system_error_${timestamp}.py`;
				const scriptBinary = createScriptBinary(debugInfo.script_content, filename, scriptExportFormat || 'py');
				
				for (const resultItem of errorResultWithPassThrough) {
					if (!resultItem.binary) {
						resultItem.binary = {};
					}
					Object.assign(resultItem.binary, scriptBinary);
				}
			}

			return executeFunctions.prepareOutputData(errorResultWithPassThrough);
		} else {
			throw error;
		}
	} finally {
		await cleanupScript(scriptPath);
	}
}


async function executePerItem(
	executeFunctions: IExecuteFunctions,
	functionCode: string,
	pythonPath: string,
	injectVariables: boolean,
	errorHandling: string,
	debugMode: string,
	parseOutput: string,
	parseOptions: ParseOptions,
	passThrough: boolean,
	passThroughMode: string,
	items: INodeExecutionData[],
	pythonEnvVars: Record<string, string>,
	includeInputItems: boolean,
	includeEnvVarsDict: boolean,
	hideVariableValues: boolean,
	systemEnvVars: string[],
	credentialSources: Record<string, string>,
	inputFiles: FileMapping[],
	outputDir?: string,
	outputFileProcessingOptions?: OutputFileProcessingOptions,
	fileDebugOptions?: FileDebugOptions,
	scriptExportFormat?: string,
): Promise<INodeExecutionData[][]> {
	
	const results: INodeExecutionData[] = [];

	for (let i = 0; i < items.length; i++) {
		const item = items[i];
		let scriptPath = '';
		
		// Create debug timing for each item
		const debugTiming: DebugTiming = {
			script_created_at: new Date().toISOString(),
		};
		let debugInfo: DebugInfo | null = null;
		
		try {
			if (injectVariables) {
				// For per-item execution, pass only current item
				scriptPath = await getTemporaryScriptPath(functionCode, [unwrapJsonField([item])[0]], pythonEnvVars, includeInputItems, includeEnvVarsDict, hideVariableValues, credentialSources, inputFiles, outputDir, outputFileProcessingOptions);
			} else {
				// Even when injectVariables is false, we still need to inject output_dir for Output File Processing
				if (outputDir) {
					// Create script with just output_dir variable injection
					scriptPath = await getTemporaryScriptPath(functionCode, [], {}, false, false, hideVariableValues, undefined, [], outputDir, outputFileProcessingOptions);
				} else {
					scriptPath = await getTemporaryPureScriptPath(functionCode);
				}
			}

			// Create debug information for this item
			if (debugMode !== 'off') {
				const scriptContent = injectVariables 
					? getScriptCode(functionCode, [unwrapJsonField([item])[0]], pythonEnvVars, includeInputItems, includeEnvVarsDict, hideVariableValues, credentialSources, inputFiles, outputDir, outputFileProcessingOptions)
					: functionCode;
				
				debugInfo = await createDebugInfo(
					scriptPath,
					scriptContent,
					pythonPath,
					injectVariables ? [unwrapJsonField([item])[0]] : undefined,
					injectVariables ? pythonEnvVars : undefined,
					debugTiming,
					credentialSources,
				);
			}
			
		} catch (error) {
			if (errorHandling === 'details' || executeFunctions.continueOnFail()) {
				const errorResult: IDataObject = {
					exitCode: -1,
					stdout: '',
					stderr: `Could not generate script: ${(error as Error).message}`,
					success: false,
					error: `Script generation failed: ${(error as Error).message}`,
					inputItemsCount: 1,
					executedAt: new Date().toISOString(),
					injectVariables,
					parseOutput,
					executionMode: 'perItem',
					itemIndex: i,
				};
				
				// Add debug information if enabled (for script generation errors)
				if (debugInfo && debugMode !== 'off') {
					debugInfo.timing = debugTiming;
					addDebugInfoToResult(errorResult, debugInfo, debugMode);
				}
				
				const errorWithPassThrough = handlePassThroughData(errorResult, [item], passThrough, passThroughMode);

				// Add binary script file for Export mode (even for generation errors)
				if (debugMode === 'export' && debugInfo) {
					const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
					const filename = `python_script_item_${i}_gen_error_${timestamp}.py`;
					const scriptBinary = createScriptBinary(debugInfo.script_content, filename, scriptExportFormat || 'py');
					
					for (const resultItem of errorWithPassThrough) {
						if (!resultItem.binary) {
							resultItem.binary = {};
						}
						Object.assign(resultItem.binary, scriptBinary);
					}
				}

				results.push(...errorWithPassThrough);
				continue;
			} else {
				throw new NodeOperationError(executeFunctions.getNode(), `Could not generate temporary script file: ${(error as Error).message}`);
			}
		}

		// For Test Only mode, return validation results without execution
		if (debugMode === 'test') {
			const testResult: IDataObject = {
				exitCode: null,
				stdout: '',
				stderr: '',
				success: null,
				error: null,
				inputItemsCount: 1,
				executedAt: new Date().toISOString(),
				injectVariables,
				parseOutput,
				executionMode: 'perItem',
				itemIndex: i,
				test_mode: true,
				execution_skipped: true,
			};

			if (debugInfo) {
				addDebugInfoToResult(testResult, debugInfo, debugMode);
			}

			const testResultWithPassThrough = handlePassThroughData(testResult, [item], passThrough, passThroughMode);
			results.push(...testResultWithPassThrough);
			continue;
		}

		try {
			// Execute the Python script for this item
			debugTiming.execution_started_at = new Date().toISOString();
			const execResults = await execPythonSpawn(scriptPath, pythonPath, executeFunctions.sendMessageToUI);
			debugTiming.execution_finished_at = new Date().toISOString();
			debugTiming.total_duration_ms = new Date(debugTiming.execution_finished_at).getTime() - 
				new Date(debugTiming.execution_started_at).getTime();

			const {
				error: returnedError,
				exitCode,
				stdout,
				stderr,
			} = execResults;

			// Parse stdout based on configuration
			let parseResult: ParseResult | null = null;
			if (parseOutput !== 'none') {
				parseResult = parseStdout(stdout, parseOutput, parseOptions);
			}

			// Base result object for this item
			const itemResult: IDataObject = {
				exitCode,
				stdout,
				stderr,
				success: exitCode === 0,
				error: exitCode === 0 ? null : 'Script execution failed',
				inputItemsCount: 1,
				executedAt: new Date().toISOString(),
				injectVariables,
				parseOutput,
				executionMode: 'perItem',
				itemIndex: i,
			};

			// Add parsing results if enabled
			if (parseResult) {
				Object.assign(itemResult, {
					parsed_stdout: parseResult.parsed_stdout,
					parsing_success: parseResult.parsing_success,
					parsing_error: parseResult.parsing_error,
					output_format: parseResult.output_format,
					parsing_method: parseResult.parsing_method,
				});
			}

			// Process output files if enabled
			if (outputFileProcessingOptions?.enabled && outputDir) {
				try {
					const outputFiles = await scanOutputDirectory(outputDir, outputFileProcessingOptions);
					
					// Add output file information to result
					itemResult.outputFiles = outputFiles;
					itemResult.outputFilesCount = outputFiles.length;
					
					console.log(`Found ${outputFiles.length} output files for item ${i}`);
				} catch (error) {
					console.error(`Error processing output files for item ${i}:`, error);
					itemResult.outputFileError = `Failed to process output files: ${(error as Error).message}`;
				}
			}

			// Add file debug information if enabled
			if (fileDebugOptions?.enabled) {
				try {
					const fileDebugInfo = await createFileDebugInfo(
						inputFiles,
						outputDir,
						outputFileProcessingOptions,
						fileDebugOptions,
					);
					itemResult.fileDebugInfo = fileDebugInfo;
					console.log(`File debug information added to result for item ${i}`);
				} catch (error) {
					console.error(`Error creating file debug info for item ${i}:`, error);
					itemResult.fileDebugError = `Failed to create file debug info: ${(error as Error).message}`;
				}
			}

			// Handle errors
			if (exitCode !== 0) {
				const pythonError = parsePythonError(stderr);
				itemResult.pythonError = pythonError;
				itemResult.detailedError = `Script failed with exit code ${exitCode}. ${pythonError.errorType || 'Error'}: ${pythonError.errorMessage || stderr}`;
				
				if (errorHandling === 'throw') {
					throw new NodeOperationError(executeFunctions.getNode(), itemResult.detailedError as string);
				}
				// For 'details' and 'ignore' modes, continue with the error info in result
			}

			// Add debug information if enabled
			if (debugInfo && debugMode !== 'off') {
				debugInfo.timing = debugTiming;
				addDebugInfoToResult(itemResult, debugInfo, debugMode);
			}

			// Handle pass through data
			const resultWithPassThrough = handlePassThroughData(itemResult, [item], passThrough, passThroughMode);

			// Add output files as binary data if enabled
			if (outputFileProcessingOptions?.enabled && itemResult.outputFiles && Array.isArray(itemResult.outputFiles)) {
				for (const resultItem of resultWithPassThrough) {
					for (const outputFile of itemResult.outputFiles as OutputFileInfo[]) {
						if (!resultItem.binary) {
							resultItem.binary = {};
						}
						resultItem.binary[outputFile.binaryKey] = {
							data: outputFile.base64Data,
							mimeType: outputFile.mimetype,
							fileExtension: outputFile.extension,
							fileName: outputFile.filename,
						};
					}
				}
			}

			// Add binary script file for Export mode
			if (debugMode === 'export' && debugInfo) {
				const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
				const filename = `python_script_item_${i}_${timestamp}.py`;
				const scriptBinary = createScriptBinary(debugInfo.script_content, filename, scriptExportFormat || 'py');
				
				for (const resultItem of resultWithPassThrough) {
					if (!resultItem.binary) {
						resultItem.binary = {};
					}
					Object.assign(resultItem.binary, scriptBinary);
				}
			}

			results.push(...resultWithPassThrough);

		} catch (error) {
			if (errorHandling !== 'throw' || executeFunctions.continueOnFail()) {
				const errorMessage = (error as Error).message || String(error);
				const pythonErrorInfo = parsePythonError(errorMessage);
				
				const errorResult: IDataObject = {
					exitCode: -1,
					stdout: '',
					stderr: errorMessage,
					success: false,
					error: errorMessage,
					inputItemsCount: 1,
					executedAt: new Date().toISOString(),
					injectVariables,
					parseOutput,
					executionMode: 'perItem',
					itemIndex: i,
					pythonError: pythonErrorInfo,
					detailedError: `System error: ${errorMessage}`,
				};

				// Add debug information if enabled
				if (debugInfo && debugMode !== 'off') {
					debugInfo.timing = debugTiming;
					addDebugInfoToResult(errorResult, debugInfo, debugMode);
				}

				const errorWithPassThrough = handlePassThroughData(errorResult, [item], passThrough, passThroughMode);

				// Add binary script file for Export mode (even for system errors)
				if (debugMode === 'export' && debugInfo) {
					const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
					const filename = `python_script_item_${i}_error_${timestamp}.py`;
					const scriptBinary = createScriptBinary(debugInfo.script_content, filename, scriptExportFormat || 'py');
					
					for (const resultItem of errorWithPassThrough) {
						if (!resultItem.binary) {
							resultItem.binary = {};
						}
						Object.assign(resultItem.binary, scriptBinary);
					}
				}

				results.push(...errorWithPassThrough);
			} else {
				throw error;
			}
		} finally {
			await cleanupScript(scriptPath);
		}
	}

	return executeFunctions.prepareOutputData(results);
}


function execPythonSpawn(scriptPath: string, pythonPath: string, stdoutListener?: CallableFunction): Promise<IExecReturnData> {
	const returnData: IExecReturnData = {
		error: undefined,
		exitCode: 0,
		stderr: '',
		stdout: '',
	};
	
	return new Promise((resolve, reject) => {
		const child = spawn(pythonPath, [scriptPath], {
			cwd: process.cwd(),
		});

		child.stdout.on('data', data => {
			returnData.stdout += data.toString();
			if (stdoutListener) {
				stdoutListener(data.toString());
			}
		});

		child.stderr.on('data', data => {
			returnData.stderr += data.toString();
		});

		child.on('error', (error) => {
			returnData.error = error;
			resolve(returnData);
		});

		child.on('close', code => {
			returnData.exitCode = code || 0;
			if (code !== 0) {
				returnData.error = new Error(`Process exited with code ${code}`);
			}
			resolve(returnData);
		});
	});
}


function parseEnvFile(envFileContent: string): Record<string, string> {
	if (!envFileContent || envFileContent === '') {
		return {};
	}
	const envLines = envFileContent.split('\n');
	const envVars: Record<string, string> = {};
	for (const line of envLines) {
		const parts = line.split('=');
		if (parts.length === 2) {
			envVars[parts[0]] = parts[1];
		}
	}
	return envVars;
}


function formatCodeSnippet(code: string): string {
	// add tab at the beginning of each line
	return code
		.replace(/\n/g, '\n\t')
		.replace(/\r/g, '\n\t')
		.replace(/\r\n\t/g, '\n\t')
		.replace(/\r\n/g, '\n\t');
}


function getScriptCode(
	codeSnippet: string, 
	data: IDataObject[], 
	envVars: Record<string, string>, 
	includeInputItems = true, 
	includeEnvVarsDict = false, 
	hideVariableValues = false,
	credentialSources?: Record<string, string>,
	inputFiles?: FileMapping[],
	outputDir?: string,
	outputFileOptions?: { expectedFileName?: string; fileDetectionMode?: string },
): string {
	// Extract __future__ imports from user code and move them to the top
	const futureImports: string[] = [];
	let cleanedCodeSnippet = codeSnippet;
	
	// Find and extract all __future__ imports
	const futureImportRegex = /^(\s*from\s+__future__\s+import\s+[^\n]+)/gm;
	let match = futureImportRegex.exec(codeSnippet);
	while (match !== null) {
		futureImports.push(match[1].trim());
		match = futureImportRegex.exec(codeSnippet);
	}
	
	// Remove __future__ imports from the original code
	cleanedCodeSnippet = codeSnippet.replace(futureImportRegex, '').trim();
	
	// Extract individual variables from the first item if available
	let individualVariables = '';
	if (data.length > 0) {
		const firstItem = data[0];
		const variableAssignments: string[] = [];
		
		for (const [key, value] of Object.entries(firstItem)) {
			// Create safe variable names (replace invalid characters)
			const safeVarName = key.replace(/[^a-zA-Z0-9_]/g, '_');
			const displayValue = hideVariableValues ? '"***hidden***"' : JSON.stringify(value);
			variableAssignments.push(`${safeVarName} = ${displayValue}`);
		}
		
		if (variableAssignments.length > 0) {
			individualVariables = `
# Individual variables from first input item
${variableAssignments.join('\n')}
`;
		}
	}

	// Add environment variables as individual Python variables with source information
	let envVariablesSection = '';
	if (Object.keys(envVars).length > 0) {
		const envVariableAssignments: string[] = [];
		
		// Group variables by source for better organization
		const variablesBySource: Record<string, string[]> = {};
		
		for (const [key, value] of Object.entries(envVars)) {
			// Create safe variable names (replace invalid characters and ensure valid Python identifier)
			let safeVarName = key.replace(/[^a-zA-Z0-9_]/g, '_');
			
			// Ensure it starts with letter or underscore
			if (!/^[a-zA-Z_]/.test(safeVarName)) {
				safeVarName = `env_${safeVarName}`;
			}
			
			const displayValue = hideVariableValues ? '"***hidden***"' : JSON.stringify(value);
			const assignment = `${safeVarName} = ${displayValue}`;
			
			// Get source information
			const source = credentialSources?.[key] || 'unknown_source';
			if (!variablesBySource[source]) {
				variablesBySource[source] = [];
			}
			variablesBySource[source].push(assignment);
		}
		
		// Generate organized section with source comments
		if (credentialSources && Object.keys(variablesBySource).length > 1) {
			for (const [source, assignments] of Object.entries(variablesBySource)) {
				envVariableAssignments.push(`# From: ${source}`);
				envVariableAssignments.push(...assignments);
				envVariableAssignments.push('');
			}
			// Remove last empty line
			if (envVariableAssignments[envVariableAssignments.length - 1] === '') {
				envVariableAssignments.pop();
			}
		} else {
			// Simple list without source grouping
			for (const [key, value] of Object.entries(envVars)) {
				let safeVarName = key.replace(/[^a-zA-Z0-9_]/g, '_');
				if (!/^[a-zA-Z_]/.test(safeVarName)) {
					safeVarName = `env_${safeVarName}`;
				}
				const displayValue = hideVariableValues ? '"***hidden***"' : JSON.stringify(value);
				envVariableAssignments.push(`${safeVarName} = ${displayValue}`);
			}
		}
		
		if (envVariableAssignments.length > 0) {
			envVariablesSection = `
# Environment variables (from credentials and system)
${envVariableAssignments.join('\n')}
`;
		}
	}

	// Prepare legacy data (only if enabled)
	let legacyDataSection = '';
	if (includeInputItems || includeEnvVarsDict) {
		const legacyParts: string[] = [];
		
		if (includeInputItems) {
			const inputItemsValue = hideVariableValues ? '"***hidden***"' : JSON.stringify(data);
			legacyParts.push(`input_items = ${inputItemsValue}`);
		}
		
		if (includeEnvVarsDict) {
			const envVarsValue = hideVariableValues ? '"***hidden***"' : JSON.stringify(envVars);
			legacyParts.push(`env_vars = ${envVarsValue}`);
		}
		
		if (legacyParts.length > 0) {
			legacyDataSection = `
# Legacy compatibility objects
${legacyParts.join('\n')}`;
		}
	}

	// Add input files array if files are provided
	let inputFilesSection = '';
	if (inputFiles && inputFiles.length > 0) {
		const filesArray = inputFiles.map(file => {
			const fileInfo: Record<string, unknown> = {
				filename: file.filename,
				mimetype: file.mimetype,
				size: file.size,
				extension: file.extension,
					binary_key: file.binaryKey,
				item_index: file.itemIndex,
			};
			
			if (file.tempPath) {
				fileInfo.temp_path = hideVariableValues ? '"***hidden***"' : file.tempPath;
			}
			
			if (file.base64Data) {
				fileInfo.base64_data = hideVariableValues ? '"***hidden***"' : file.base64Data;
			}
			
			return fileInfo;
		});
		
		const filesValue = hideVariableValues ? '"***hidden***"' : JSON.stringify(filesArray, null, 2);
		inputFilesSection = `
# Binary files from previous nodes
input_files = ${filesValue}`;
	}

	// Add output directory section if provided
	let outputDirSection = '';
	if (outputDir) {
		const outputDirValue = hideVariableValues ? '"***hidden***"' : outputDir;
		let outputFileInstructions = '';
		let outputFilePathVariable = '';
		let expectedFileNameVariable = '';
		
		// Add expected filename variable if configured
		if (outputFileOptions?.expectedFileName) {
			const expectedFileNameValue = hideVariableValues ? '"***hidden***"' : outputFileOptions.expectedFileName;
			expectedFileNameVariable = `expected_filename = "${expectedFileNameValue}"`;
		}
		
		// Add expected file path variable if configured
		if (outputFileOptions?.expectedFileName && outputFileOptions?.fileDetectionMode === 'variable_path') {
			const expectedFilePath = path.join(outputDir, outputFileOptions.expectedFileName);
			const outputFilePathValue = hideVariableValues ? '"***hidden***"' : expectedFilePath;
			outputFilePathVariable = `output_file_path = r"${outputFilePathValue}"`;
			
			outputFileInstructions = `# 📁 Ready Variable Path Mode:
# Two ways to create your output file:
# 
# Method 1 (Recommended): Use ready-made full path
# with open(output_file_path, 'w') as f:
#     f.write("your content")
#
# Method 2: Build path manually using expected filename
# import os
# file_path = os.path.join(output_dir, expected_filename)
# with open(file_path, 'w') as f:
#     f.write("your content")
#
# Expected filename: ${outputFileOptions.expectedFileName}
# n8n will automatically detect and process this file after script execution
`;
		} else if (outputFileOptions?.expectedFileName && outputFileOptions?.fileDetectionMode === 'auto_search') {
			outputFileInstructions = `# 🔍 Auto Search Mode:
# Create a file with the exact filename specified in expected_filename variable
# You can save it anywhere (current directory, subdirectories, etc.)
# n8n will automatically search and find this file after script execution
#
# Recommended usage:
# with open(expected_filename, 'w') as f:
#     f.write("your content")
#
# Alternative with full path:
# import os
# file_path = os.path.join(output_dir, expected_filename)  
# with open(file_path, 'w') as f:
#     f.write("your content")
#
# Expected filename: ${outputFileOptions.expectedFileName}
`;
		} else {
			outputFileInstructions = `# 📁 Manual Output File Processing:
# Save your files in the output_dir directory
# Example: 
#   import os
#   file_path = os.path.join(output_dir, "my_file.txt")
#   with open(file_path, 'w') as f: f.write("your content")
`;
		}
		
		outputDirSection = `
# Output directory for generated files (Output File Processing enabled)
output_dir = r"${outputDirValue}"
${expectedFileNameVariable}
${outputFilePathVariable}

${outputFileInstructions}`;
	}

	const script = `#!/usr/bin/env python3
# Auto-generated script for n8n Python Function (Raw)
${futureImports.length > 0 ? futureImports.join('\n') + '\n' : ''}
import json
import sys
${envVariablesSection}${individualVariables}${legacyDataSection}${inputFilesSection}${outputDirSection}
# User code starts here
${cleanedCodeSnippet}
`;
	return script;
}


async function getTemporaryScriptPath(codeSnippet: string, data: IDataObject[], envVars: Record<string, string>, includeInputItems = true, includeEnvVarsDict = false, hideVariableValues = false, credentialSources?: Record<string, string>, inputFiles?: FileMapping[], outputDir?: string, outputFileOptions?: OutputFileProcessingOptions): Promise<string> {
	const tmpPath = tempy.file({extension: 'py'});
	const codeStr = getScriptCode(codeSnippet, data, envVars, includeInputItems, includeEnvVarsDict, hideVariableValues, credentialSources, inputFiles, outputDir, outputFileOptions);
	
	// Ensure file is overwritten by explicitly writing with 'w' flag
	try {
		// Remove file if it exists
		if (fs.existsSync(tmpPath)) {
			fs.unlinkSync(tmpPath);
		}
		// Write new content
		fs.writeFileSync(tmpPath, codeStr, { encoding: 'utf8', flag: 'w' });
		console.log(`Created temporary script at: ${tmpPath}`);
	} catch (error) {
		throw new Error(`Failed to create script file: ${(error as Error).message}`);
	}
	
	return tmpPath;
}


async function getTemporaryPureScriptPath(codeSnippet: string): Promise<string> {
	const tmpPath = tempy.file({extension: 'py'});
	
	// Ensure file is overwritten by explicitly writing with 'w' flag
	try {
		// Remove file if it exists
		if (fs.existsSync(tmpPath)) {
			fs.unlinkSync(tmpPath);
		}
		// Write pure Python code without any modifications
		fs.writeFileSync(tmpPath, codeSnippet, { encoding: 'utf8', flag: 'w' });
		console.log(`Created temporary pure script at: ${tmpPath}`);
	} catch (error) {
		throw new Error(`Failed to create script file: ${(error as Error).message}`);
	}
	
	return tmpPath;
}


function unwrapJsonField(list: IDataObject[] = []): IDataObject[] {
	return list.reduce((acc, item) => {
		if ('json' in item) {
			acc.push(item.json as never);
		} else {
			acc.push(item as never);
		}
		return acc;
	}, []);
}


interface PythonErrorInfo {
	errorType: string | null;
	errorMessage: string | null;
	missingModules: string[];
	traceback: string | null;
	lineNumber: number | null;
}


interface ParseResult {
	parsed_stdout: unknown;
	parsing_success: boolean;
	parsing_error: string | null;
	output_format: string;
	parsing_method: string;
}


interface ParseOptions {
	multipleJson?: boolean;
	stripNonJson?: boolean;
	fallbackOnError?: boolean;
}


interface DebugTiming {
	script_created_at: string;
	execution_started_at?: string;
	execution_finished_at?: string;
	total_duration_ms?: number;
}

interface DebugInfo {
	script_content: string;
	script_path: string;
	execution_command: string[];
	injected_data?: {
		input_items: IDataObject[];
		env_vars: Record<string, string>;
	};
	timing: DebugTiming;
	python_version?: string;
	environment_check?: {
		python_executable_found: boolean;
		python_version_output?: string;
		python_path_resolved?: string;
	};
	syntax_validation?: {
		is_valid: boolean;
		syntax_error?: string;
		line_number?: number;
	};
}


function parsePythonError(stderr: string): PythonErrorInfo {
	const result: PythonErrorInfo = {
		errorType: null,
		errorMessage: null,
		missingModules: [],
		traceback: null,
		lineNumber: null,
	};

	if (!stderr) {
		return result;
	}

	// Full traceback
	result.traceback = stderr;

	// Extract error type and message
	const errorMatch = stderr.match(/^(\w+(?:Error|Exception)): (.+)$/m);
	if (errorMatch) {
		result.errorType = errorMatch[1];
		result.errorMessage = errorMatch[2];
	}

	// Extract missing modules
	const missingModules = new Set<string>();
	
	// ModuleNotFoundError patterns
	const moduleNotFoundMatches = stderr.matchAll(/ModuleNotFoundError: No module named '([^']+)'/g);
	for (const match of moduleNotFoundMatches) {
		missingModules.add(match[1]);
	}
	
	// ImportError patterns
	const importErrorMatches = stderr.matchAll(/ImportError: No module named '([^']+)'/g);
	for (const match of importErrorMatches) {
		missingModules.add(match[1]);
	}
	
	// ImportError: cannot import name patterns
	const cannotImportMatches = stderr.matchAll(/ImportError: cannot import name '([^']+)' from '([^']+)'/g);
	for (const match of cannotImportMatches) {
		missingModules.add(match[2]); // Add the package name
	}

	result.missingModules = Array.from(missingModules);

	// Extract line number
	const lineMatch = stderr.match(/File ".*", line (\d+)/);
	if (lineMatch) {
		result.lineNumber = parseInt(lineMatch[1], 10);
	}

	return result;
}


function parseStdout(stdout: string, parseMode: string, options: ParseOptions = {}): ParseResult {
	const result: ParseResult = {
		parsed_stdout: stdout,
		parsing_success: false,
		parsing_error: null,
		output_format: 'text',
		parsing_method: parseMode,
	};

	if (!stdout || stdout.trim() === '') {
		result.parsed_stdout = parseMode === 'lines' ? [] : null;
		result.parsing_success = true;
		result.output_format = 'empty';
		return result;
	}

	try {
		switch (parseMode) {
			case 'json':
				return parseAsJson(stdout, options);
			
			case 'lines':
				return parseAsLines(stdout);
			
			case 'smart':
				return parseSmartMode(stdout, options);
			
			default:
				result.parsing_success = true;
				result.output_format = 'text';
				return result;
		}
	} catch (error) {
		result.parsing_error = (error as Error).message;
		if (options.fallbackOnError !== false) {
			result.parsed_stdout = stdout;
		}
		return result;
	}
}


function parseAsJson(stdout: string, options: ParseOptions): ParseResult {
	const result: ParseResult = {
		parsed_stdout: null,
		parsing_success: false,
		parsing_error: null,
		output_format: 'json',
		parsing_method: 'json',
	};

	let cleanedStdout = stdout;

	// Strip non-JSON text if option is enabled
	if (options.stripNonJson !== false) {
		const jsonMatch = stdout.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
		if (jsonMatch) {
			cleanedStdout = jsonMatch[1];
		}
	}

	try {
		if (options.multipleJson) {
			// Handle multiple JSON objects
			const lines = cleanedStdout.split('\n').filter(line => line.trim());
			const jsonObjects = [];
			
			for (const line of lines) {
				try {
					jsonObjects.push(JSON.parse(line.trim()));
				} catch {
					// Skip non-JSON lines
				}
			}
			
			result.parsed_stdout = jsonObjects.length === 1 ? jsonObjects[0] : jsonObjects;
		} else {
			// Single JSON object
			result.parsed_stdout = JSON.parse(cleanedStdout);
		}
		
		result.parsing_success = true;
	} catch (error) {
		result.parsing_error = (error as Error).message;
		if (options.fallbackOnError !== false) {
			result.parsed_stdout = stdout;
		}
	}

	return result;
}


function parseAsLines(stdout: string): ParseResult {
	return {
		parsed_stdout: stdout.split('\n'),
		parsing_success: true,
		parsing_error: null,
		output_format: 'lines',
		parsing_method: 'lines',
	};
}


function parseSmartMode(stdout: string, options: ParseOptions): ParseResult {
	const trimmed = stdout.trim();

	// Try JSON first
	if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || 
		(trimmed.startsWith('[') && trimmed.endsWith(']'))) {
		const jsonResult = parseAsJson(stdout, options);
		if (jsonResult.parsing_success) {
			jsonResult.parsing_method = 'smart_json';
			return jsonResult;
		}
	}

	// Try CSV detection
	if (detectCSV(stdout)) {
		return parseAsCSV(stdout);
	}

	// Fallback to lines
	const linesResult = parseAsLines(stdout);
	linesResult.parsing_method = 'smart_lines';
	linesResult.output_format = 'text_lines';
	return linesResult;
}


function detectCSV(stdout: string): boolean {
	const lines = stdout.split('\n').filter(line => line.trim());
	if (lines.length < 2) return false;

	// Check if lines have consistent comma or tab separators
	const firstLineCommas = (lines[0].match(/,/g) || []).length;
	const firstLineTabs = (lines[0].match(/\t/g) || []).length;
	
	if (firstLineCommas === 0 && firstLineTabs === 0) return false;

	// Check consistency across lines
	return lines.slice(1, Math.min(5, lines.length)).every(line => {
		const commas = (line.match(/,/g) || []).length;
		const tabs = (line.match(/\t/g) || []).length;
		return commas === firstLineCommas || tabs === firstLineTabs;
	});
}


function parseAsCSV(stdout: string): ParseResult {
	const lines = stdout.split('\n').filter(line => line.trim());
	const delimiter = stdout.includes('\t') ? '\t' : ',';
	
	if (lines.length === 0) {
		return {
			parsed_stdout: [],
			parsing_success: true,
			parsing_error: null,
			output_format: 'csv',
			parsing_method: 'smart_csv',
		};
	}

	const headers = lines[0].split(delimiter).map(h => h.trim());
	const rows = lines.slice(1).map(line => {
		const values = line.split(delimiter).map(v => v.trim());
		const row: { [key: string]: string } = {};
		headers.forEach((header, index) => {
			row[header] = values[index] || '';
		});
		return row;
	});

	return {
		parsed_stdout: rows,
		parsing_success: true,
		parsing_error: null,
		output_format: 'csv',
		parsing_method: 'smart_csv',
	};
}


async function createDebugInfo(
	scriptPath: string,
	scriptContent: string,
	pythonPath: string,
	inputData?: IDataObject[],
	envVars?: Record<string, string>,
	timing?: DebugTiming,
	credentialSources?: Record<string, string>,
): Promise<DebugInfo> {
	const debugInfo: DebugInfo = {
		script_content: scriptContent,
		script_path: scriptPath,
		execution_command: [pythonPath, scriptPath],
		timing: timing || { script_created_at: new Date().toISOString() },
	};

	// Add injected data if provided
	if (inputData || envVars) {
		debugInfo.injected_data = {
			input_items: inputData || [],
			env_vars: envVars || {},
		};
	}

	// Check Python environment
	try {
		// Create a simple version check script
		const versionScript = 'import sys; print(sys.version)';
		const versionScriptPath = scriptPath.replace('.py', '_version_check.py');
		fs.writeFileSync(versionScriptPath, versionScript, { encoding: 'utf8' });
		
		const versionResult = await execPythonSpawn(versionScriptPath, pythonPath);
		
		// Clean up version check script
		try {
			fs.unlinkSync(versionScriptPath);
		} catch (e) {
			// Ignore cleanup errors
		}
		
		debugInfo.environment_check = {
			python_executable_found: versionResult.exitCode === 0,
			python_version_output: versionResult.stdout || versionResult.stderr,
			python_path_resolved: pythonPath,
		};
	} catch (error) {
		debugInfo.environment_check = {
			python_executable_found: false,
			python_path_resolved: pythonPath,
		};
	}

	// Validate Python syntax
	try {
		const syntaxValidation = await validatePythonSyntax(scriptPath, pythonPath);
		debugInfo.syntax_validation = syntaxValidation;
	} catch (error) {
		debugInfo.syntax_validation = {
			is_valid: false,
			syntax_error: (error as Error).message,
		};
	}

	return debugInfo;
}

async function validatePythonSyntax(scriptPath: string, pythonPath: string): Promise<{
	is_valid: boolean;
	syntax_error?: string;
	line_number?: number;
}> {
	try {
		// Use Python's compile() to check syntax without executing
		const validationScript = `
import ast
import sys

try:
    with open('${scriptPath.replace(/\\/g, '\\\\')}', 'r', encoding='utf-8') as f:
        source = f.read()
    
    # Try to parse the AST
    ast.parse(source)
    print("SYNTAX_VALID")
    
except SyntaxError as e:
    print(f"SYNTAX_ERROR:{e.msg}:LINE:{e.lineno}")
    sys.exit(1)
except Exception as e:
    print(f"VALIDATION_ERROR:{str(e)}")
    sys.exit(1)
`;

		const validationPath = scriptPath.replace('.py', '_validation.py');
		fs.writeFileSync(validationPath, validationScript, { encoding: 'utf8' });

		const result = await execPythonSpawn(validationPath, pythonPath);
		
		// Clean up validation script
		try {
			fs.unlinkSync(validationPath);
		} catch (e) {
			// Ignore cleanup errors
		}

		if (result.stdout.includes('SYNTAX_VALID')) {
			return { is_valid: true };
		} else if (result.stdout.includes('SYNTAX_ERROR:')) {
			const parts = result.stdout.split(':');
			return {
				is_valid: false,
				syntax_error: parts[1] || 'Unknown syntax error',
				line_number: parts[3] ? parseInt(parts[3], 10) : undefined,
			};
		} else {
			return {
				is_valid: false,
				syntax_error: result.stderr || result.stdout || 'Unknown validation error',
			};
		}
	} catch (error) {
		return {
			is_valid: false,
			syntax_error: (error as Error).message,
		};
	}
}

function createScriptBinary(scriptContent: string, filename = 'script.py', format = 'py'): { [key: string]: unknown } {
	// Determine file extension and MIME type based on format
	let fileExtension: string;
	let mimeType: string;
	let finalFilename: string;
	
	if (format === 'txt') {
		fileExtension = 'txt';
		mimeType = 'text/plain';
		// Replace .py extension with .txt
		finalFilename = filename.replace(/\.py$/, '.txt');
	} else {
		fileExtension = 'py';
		mimeType = 'text/x-python';
		finalFilename = filename;
	}
	
	const buffer = Buffer.from(scriptContent, 'utf8');
	return {
		[finalFilename]: {
			data: buffer.toString('base64'),
			mimeType,
			fileExtension,
			fileName: finalFilename,
		},
	};
}

function addDebugInfoToResult(
	result: IDataObject,
	debugInfo: DebugInfo,
	debugMode: string,
	scriptContent?: string,
): void {
	if (debugMode === 'off') return;

	const debugData: IDataObject = {};

	if (['basic', 'full', 'test', 'export'].includes(debugMode)) {
		debugData.script_content = debugInfo.script_content;
		debugData.execution_command = debugInfo.execution_command.join(' ');
	}

	if (['full', 'test', 'export'].includes(debugMode)) {
		debugData.debug_info = {
			script_path: debugInfo.script_path,
			timing: debugInfo.timing,
			environment_check: debugInfo.environment_check,
			syntax_validation: debugInfo.syntax_validation,
		};

		if (debugInfo.injected_data) {
			(debugData.debug_info as IDataObject).injected_data = debugInfo.injected_data;
		}
	}

	if (['test'].includes(debugMode)) {
		debugData.test_mode = true;
		debugData.execution_skipped = true;
		debugData.validation_only = true;
	}

	Object.assign(result, debugData);
}

function handlePassThroughData(result: IDataObject, items: INodeExecutionData[], passThrough: boolean, passThroughMode: string): INodeExecutionData[] {
	if (!passThrough) {
		return [{ json: result }];
	}

	const resultWithPassThrough: INodeExecutionData[] = [];

	if (passThroughMode === 'multiple') {
		// First add the Python result
		resultWithPassThrough.push({ json: result });
		
		// Then add each input item
		for (const item of items) {
			resultWithPassThrough.push({
				json: item.json,
				binary: item.binary,
				pairedItem: item.pairedItem,
			});
		}
	} else {
		// For merge and separate modes, combine with each input item
		for (const item of items) {
			const combinedResult: IDataObject = { ...result };
			
			if (passThroughMode === 'merge') {
				// Merge input fields directly into result (input fields override if same names)
				Object.assign(combinedResult, item.json);
			} else if (passThroughMode === 'separate') {
				// Add input data as separate field
				combinedResult.inputData = item.json;
			}
			
			resultWithPassThrough.push({
				json: combinedResult,
				binary: item.binary,
				pairedItem: item.pairedItem,
			});
		}
	}

	return resultWithPassThrough;
}

// Output file processing functions
async function scanOutputDirectory(outputDir: string, options: OutputFileProcessingOptions): Promise<OutputFileInfo[]> {
	const outputFiles: OutputFileInfo[] = [];
	
	if (!fs.existsSync(outputDir)) {
		return outputFiles;
	}
	
	try {
		const files = fs.readdirSync(outputDir);
		console.log(`Found ${files.length} files in output directory: ${outputDir}`);
		
		for (const filename of files) {
			const filepath = path.join(outputDir, filename);
			const stats = fs.statSync(filepath);
			
			if (stats.isFile()) {
				// Validate file size
				const sizeInMB = stats.size / (1024 * 1024);
				if (sizeInMB > options.maxOutputFileSize) {
					console.warn(`Output file "${filename}" is too large: ${sizeInMB.toFixed(2)}MB > ${options.maxOutputFileSize}MB, skipping`);
					continue;
				}
				
				// Read file content and convert to base64
				const content = fs.readFileSync(filepath);
				const base64Data = content.toString('base64');
				
				// Get file info
				const extension = getFileExtension(filename);
				const mimetype = getMimeType(extension);
				const binaryKey = `output_${filename}`;
				
				const outputFile: OutputFileInfo = {
					filename,
					size: stats.size,
					mimetype,
					extension,
					base64Data,
					binaryKey,
				};
				
				outputFiles.push(outputFile);
				console.log(`Processed output file: ${filename} (${sizeInMB.toFixed(2)}MB, ${mimetype})`);
			}
		}
	} catch (error) {
		console.error(`Error scanning output directory ${outputDir}:`, error);
		throw new Error(`Failed to scan output directory: ${(error as Error).message}`);
	}
	
	return outputFiles;
}

function getMimeType(extension: string): string {
	const mimeTypes: Record<string, string> = {
		'txt': 'text/plain',
		'json': 'application/json',
		'csv': 'text/csv',
		'html': 'text/html',
		'xml': 'application/xml',
		'pdf': 'application/pdf',
		'doc': 'application/msword',
		'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
		'xls': 'application/vnd.ms-excel',
		'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
		'png': 'image/png',
		'jpg': 'image/jpeg',
		'jpeg': 'image/jpeg',
		'gif': 'image/gif',
		'svg': 'image/svg+xml',
		'mp4': 'video/mp4',
		'avi': 'video/x-msvideo',
		'mov': 'video/quicktime',
		'mp3': 'audio/mpeg',
		'wav': 'audio/wav',
		'zip': 'application/zip',
		'rar': 'application/x-rar-compressed',
		'tar': 'application/x-tar',
		'gz': 'application/gzip',
	};
	
	return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
}

async function cleanupOutputDirectory(outputDir: string): Promise<void> {
	if (!fs.existsSync(outputDir)) {
		return;
	}
	
	try {
		const files = fs.readdirSync(outputDir);
		let cleanedFiles = 0;
		
		for (const filename of files) {
			const filepath = path.join(outputDir, filename);
			try {
				fs.unlinkSync(filepath);
				cleanedFiles++;
			} catch (error) {
				console.warn(`Failed to delete output file ${filepath}:`, error);
			}
		}
		
		// Remove the directory itself
		fs.rmdirSync(outputDir);
		console.log(`Cleaned up output directory: ${outputDir} (${cleanedFiles} files removed)`);
	} catch (error) {
		console.warn(`Failed to cleanup output directory ${outputDir}:`, error);
		// Don't throw error - cleanup should not break main process
	}
}

function createUniqueOutputDirectory(): string {
	const timestamp = Date.now();
	const randomId = Math.random().toString(36).substring(2, 8);
	const uniqueId = `n8n_python_output_${timestamp}_${randomId}`;
	const outputDir = path.join(require('os').tmpdir(), uniqueId);
	
	fs.mkdirSync(outputDir, { recursive: true });
	console.log(`Created output directory: ${outputDir}`);
	
	return outputDir;
}

// File debugging functions
async function createFileDebugInfo(
	inputFiles: FileMapping[],
	outputDir?: string,
	outputFileProcessingOptions?: OutputFileProcessingOptions,
	options?: FileDebugOptions,
): Promise<FileDebugInfo> {
	const debugInfo: FileDebugInfo = {};
	
	if (!options?.enabled) {
		return debugInfo;
	}
	
	try {
		// Input files debug info
		if (options.includeInputFileDebug) {
			debugInfo.input_files = await createInputFileDebugInfo(inputFiles);
		}
		
		// Output files debug info
		if (options.includeOutputFileDebug && outputDir) {
			debugInfo.output_files = await createOutputFileDebugInfo(outputDir, outputFileProcessingOptions);
		}
		
		// System info
		if (options.includeSystemInfo) {
			debugInfo.system_info = await createSystemDebugInfo(outputDir);
		}
		
		// Directory listings
		if (options.includeDirectoryListing) {
			debugInfo.directory_listing = await createDirectoryListingInfo(outputDir);
		}
		
	} catch (error) {
		console.error('Error creating file debug info:', error);
		// Return partial debug info instead of failing completely
	}
	
	return debugInfo;
}

async function createInputFileDebugInfo(inputFiles: FileMapping[]): Promise<FileDebugInfo['input_files']> {
	const processingErrors: string[] = [];
	let totalSizeMB = 0;
	const filesByType: Record<string, number> = {};
	const filesDetails: Array<{
		filename: string;
		size_mb: number;
		mimetype: string;
		extension: string;
		binary_key: string;
		item_index: number;
		temp_path?: string;
		base64_available: boolean;
	}> = [];
	
	for (const file of inputFiles) {
		try {
			const sizeMB = file.size / (1024 * 1024);
			totalSizeMB += sizeMB;
			
			// Count by type
			const typeKey = file.mimetype || 'unknown';
			filesByType[typeKey] = (filesByType[typeKey] || 0) + 1;
			
			// File details
			filesDetails.push({
				filename: file.filename,
				size_mb: Math.round(sizeMB * 100) / 100,
				mimetype: file.mimetype,
				extension: file.extension,
				binary_key: file.binaryKey,
				item_index: file.itemIndex,
				temp_path: file.tempPath,
				base64_available: !!file.base64Data,
			});
			
		} catch (error) {
			processingErrors.push(`Error processing file ${file.filename}: ${(error as Error).message}`);
		}
	}
	
	return {
		count: inputFiles.length,
		total_size_mb: Math.round(totalSizeMB * 100) / 100,
		files_by_type: filesByType,
		files_details: filesDetails,
		processing_errors: processingErrors.length > 0 ? processingErrors : undefined,
	};
}

async function createOutputFileDebugInfo(
	outputDir: string,
	options?: OutputFileProcessingOptions,
): Promise<FileDebugInfo['output_files']> {
	const scanErrors: string[] = [];
	const foundFiles: Array<{
		filename: string;
		size_mb: number;
		mimetype: string;
		extension: string;
		full_path: string;
		created_at: string;
	}> = [];
	let directoryExists = false;
	let directoryWritable = false;
	let directoryPermissions: string | undefined;
	
	try {
		// Check if directory exists
		directoryExists = fs.existsSync(outputDir);
		
		if (directoryExists) {
			// Check permissions
			try {
				await fs.promises.access(outputDir, fs.constants.W_OK);
				directoryWritable = true;
			} catch {
				directoryWritable = false;
			}
			
			// Get permissions
			try {
				const stats = await fs.promises.stat(outputDir);
				directoryPermissions = stats.mode.toString(8);
			} catch (error) {
				scanErrors.push(`Could not read directory permissions: ${(error as Error).message}`);
			}
			
			// Scan for files
			try {
				const files = await fs.promises.readdir(outputDir);
				for (const file of files) {
					try {
						const filePath = path.join(outputDir, file);
						const stats = await fs.promises.stat(filePath);
						
						if (stats.isFile()) {
							const extension = getFileExtension(file);
							const sizeMB = stats.size / (1024 * 1024);
							
							foundFiles.push({
								filename: file,
								size_mb: Math.round(sizeMB * 100) / 100,
								mimetype: getMimeType(extension),
								extension,
								full_path: filePath,
								created_at: stats.birthtime.toISOString(),
							});
						}
					} catch (error) {
						scanErrors.push(`Error scanning file ${file}: ${(error as Error).message}`);
					}
				}
			} catch (error) {
				scanErrors.push(`Could not read directory contents: ${(error as Error).message}`);
			}
		}
		
	} catch (error) {
		scanErrors.push(`Directory access error: ${(error as Error).message}`);
	}
	
	return {
		processing_enabled: options?.enabled === true,
		output_directory: outputDir,
		directory_exists: directoryExists,
		directory_writable: directoryWritable,
		directory_permissions: directoryPermissions,
		found_files: foundFiles,
		scan_errors: scanErrors.length > 0 ? scanErrors : undefined,
	};
}

async function createSystemDebugInfo(outputDir?: string): Promise<FileDebugInfo['system_info']> {
	const systemInfo: FileDebugInfo['system_info'] = {
		python_executable: '',
		working_directory: process.cwd(),
		user_permissions: {
			can_write_temp: false,
			can_create_files: false,
		},
		disk_space: {},
		environment_variables: {
			output_dir_available: false,
		},
	};
	
	// Check temp directory write permissions
	try {
		const tempFile = tempy.file();
		await fs.promises.writeFile(tempFile, 'test');
		await fs.promises.unlink(tempFile);
		systemInfo.user_permissions.can_write_temp = true;
	} catch {
		systemInfo.user_permissions.can_write_temp = false;
	}
	
	// Check file creation permissions in current directory
	try {
		const testFile = path.join(process.cwd(), `test_${Date.now()}.tmp`);
		await fs.promises.writeFile(testFile, 'test');
		await fs.promises.unlink(testFile);
		systemInfo.user_permissions.can_create_files = true;
	} catch {
		systemInfo.user_permissions.can_create_files = false;
	}
	
	// Check environment variables
	if (outputDir) {
		systemInfo.environment_variables.output_dir_available = true;
		systemInfo.environment_variables.output_dir_value = outputDir;
	}
	
	// Get temp directory info
	systemInfo.disk_space.temp_dir = tempy.directory();
	
	return systemInfo;
}

async function createDirectoryListingInfo(outputDir?: string): Promise<FileDebugInfo['directory_listing']> {
	const listing: FileDebugInfo['directory_listing'] = {};
	
	try {
		// List working directory
		listing.working_directory = fs.readdirSync(process.cwd());
	} catch (error) {
		listing.working_directory = [`Error reading working directory: ${(error as Error).message}`];
	}
	
	if (outputDir) {
		try {
			// List output directory
			if (fs.existsSync(outputDir)) {
				listing.output_directory = fs.readdirSync(outputDir);
			} else {
				listing.output_directory = ['Directory does not exist'];
			}
		} catch (error) {
			listing.output_directory = [`Error reading output directory: ${(error as Error).message}`];
		}
	}
	
	try {
		// List temp directory
		const tempDir = tempy.directory();
		listing.temp_directory = fs.readdirSync(tempDir);
	} catch (error) {
		listing.temp_directory = [`Error reading temp directory: ${(error as Error).message}`];
	}
	
	return listing;
}

// Auto-search for files by name across filesystem
async function searchForFileByName(fileName: string, searchPaths?: string[]): Promise<OutputFileInfo[]> {
	const foundFiles: OutputFileInfo[] = [];
	const defaultSearchPaths = [process.cwd(), tempy.directory()];
	const pathsToSearch = searchPaths || defaultSearchPaths;
	
	for (const searchPath of pathsToSearch) {
		try {
			if (!fs.existsSync(searchPath)) continue;
			
			// Search recursively in directory
			const searchInDirectory = async (dirPath: string, maxDepth = 3): Promise<void> => {
				if (maxDepth <= 0) return;
				
				const items = fs.readdirSync(dirPath, { withFileTypes: true });
				
				for (const item of items) {
					const fullPath = path.join(dirPath, item.name);
					
					if (item.isFile() && item.name === fileName) {
						// Found the file!
						try {
							const stats = fs.statSync(fullPath);
							const extension = getFileExtension(fileName);
							const base64Data = fs.readFileSync(fullPath).toString('base64');
							
							foundFiles.push({
								filename: fileName,
								size: stats.size,
								mimetype: getMimeType(extension),
								extension,
								base64Data,
								binaryKey: `output_${fileName.replace(/[^a-zA-Z0-9]/g, '_')}`,
							});
						} catch (error) {
							console.warn(`Found file ${fullPath} but failed to read:`, error);
						}
					} else if (item.isDirectory() && !item.name.startsWith('.')) {
						// Search subdirectories
						await searchInDirectory(fullPath, maxDepth - 1);
					}
				}
			};
			
			await searchInDirectory(searchPath);
		} catch (error) {
			console.warn(`Error searching in ${searchPath}:`, error);
		}
	}
	
	return foundFiles;
}


