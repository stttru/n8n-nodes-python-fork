import {IExecuteFunctions} from 'n8n-core';
import {
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';
import {spawn} from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import * as tempy from 'tempy';


export interface IExecReturnData {
	exitCode: number;
	error?: Error;
	stderr: string;
	stdout: string;
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
				displayName: 'Python Code',
				name: 'functionCode',
				typeOptions: {
					alwaysOpenEditWindow: true,
					rows: 15,
				},
				type: 'string',
				default: `# Example: Use with "Inject Variables" enabled (default)
# Available variables: input_items, env_vars

import json
import sys

print("Input items count:", len(input_items))
print("Environment variables:", len(env_vars))

result = {"processed_count": len(input_items), "status": "success"}
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
		const parseOptions = (['json', 'smart'].includes(parseOutput)) ? 
			this.getNodeParameter('parseOptions', 0) as ParseOptions : 
			{} as ParseOptions;
		const executionMode = this.getNodeParameter('executionMode', 0) as string;
		const passThrough = this.getNodeParameter('passThrough', 0) as boolean;
		const passThroughMode = passThrough ? this.getNodeParameter('passThroughMode', 0) as string : 'separate';
		
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
		
		// Get the environment variables
		let pythonEnvVars: Record<string, string> = {};
		try {
			pythonEnvVars = parseEnvFile(String((await this.getCredentials('pythonEnvVars'))?.envFileContent || ''));
		} catch (_) {
		}
		
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
				pythonEnvVars,
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
				pythonEnvVars,
			);
		}
	}
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
): Promise<INodeExecutionData[][]> {

	// Create debug timing and info variables in function scope
	let debugTiming: DebugTiming = {
		script_created_at: new Date().toISOString(),
	};
	let debugInfo: DebugInfo | null = null;
		
	let scriptPath = '';
	try {
		if (injectVariables) {
			scriptPath = await getTemporaryScriptPath(functionCode, unwrapJsonField(items), pythonEnvVars);
		} else {
			scriptPath = await getTemporaryPureScriptPath(functionCode);
		}
	} catch (error) {
		throw new NodeOperationError(executeFunctions.getNode(), `Could not generate temporary script file: ${(error as Error).message}`);
	}

	try {
		// Initialize debug information
		if (debugMode !== 'off') {
			const scriptContent = injectVariables 
				? getScriptCode(functionCode, unwrapJsonField(items), pythonEnvVars)
				: functionCode;
			
			debugInfo = await createDebugInfo(
				scriptPath,
				scriptContent,
				pythonPath,
				injectVariables ? unwrapJsonField(items) : undefined,
				injectVariables ? pythonEnvVars : undefined,
				debugTiming
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

		// Add debug information if enabled
		if (debugInfo && debugMode !== 'off') {
			debugInfo.timing = debugTiming;
			addDebugInfoToResult(baseResult, debugInfo, debugMode);
		}

		// Handle pass through data
		const resultWithPassThrough = handlePassThroughData(baseResult, items, passThrough, passThroughMode);

		// Add binary script file for Export mode
		if (debugMode === 'export' && debugInfo) {
			const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
			const filename = `python_script_${timestamp}.py`;
			const scriptBinary = createScriptBinary(debugInfo.script_content, filename);
			
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

		// Add debug information if enabled
		if (debugInfo && debugMode !== 'off') {
			debugInfo.timing = debugTiming;
			addDebugInfoToResult(baseResult, debugInfo, debugMode);
		}

		// Handle pass through for errors too
		const errorResultWithPassThrough = handlePassThroughData(baseResult, items, passThrough, passThroughMode);

		// Add binary script file for Export mode (even for errors)
		if (debugMode === 'export' && debugInfo) {
			const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
			const filename = `python_script_error_${timestamp}.py`;
			const scriptBinary = createScriptBinary(debugInfo.script_content, filename);
			
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
				const scriptBinary = createScriptBinary(debugInfo.script_content, filename);
				
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
				scriptPath = await getTemporaryScriptPath(functionCode, [unwrapJsonField([item])[0]], pythonEnvVars);
			} else {
				scriptPath = await getTemporaryPureScriptPath(functionCode);
			}

			// Create debug information for this item
			if (debugMode !== 'off') {
				const scriptContent = injectVariables 
					? getScriptCode(functionCode, [unwrapJsonField([item])[0]], pythonEnvVars)
					: functionCode;
				
				debugInfo = await createDebugInfo(
					scriptPath,
					scriptContent,
					pythonPath,
					injectVariables ? [unwrapJsonField([item])[0]] : undefined,
					injectVariables ? pythonEnvVars : undefined,
					debugTiming
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
					const scriptBinary = createScriptBinary(debugInfo.script_content, filename);
					
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

			// Add binary script file for Export mode
			if (debugMode === 'export' && debugInfo) {
				const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
				const filename = `python_script_item_${i}_${timestamp}.py`;
				const scriptBinary = createScriptBinary(debugInfo.script_content, filename);
				
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
					const scriptBinary = createScriptBinary(debugInfo.script_content, filename);
					
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


function getScriptCode(codeSnippet: string, data: IDataObject[], envVars: Record<string, string>): string {
	// Extract __future__ imports from user code and move them to the top
	const futureImports: string[] = [];
	let cleanedCodeSnippet = codeSnippet;
	
	// Find and extract all __future__ imports
	const futureImportRegex = /^(\s*from\s+__future__\s+import\s+[^\n]+)/gm;
	let match;
	while ((match = futureImportRegex.exec(codeSnippet)) !== null) {
		futureImports.push(match[1].trim());
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
			variableAssignments.push(`${safeVarName} = ${JSON.stringify(value)}`);
		}
		
		if (variableAssignments.length > 0) {
			individualVariables = `
# Individual variables from first input item
${variableAssignments.join('\n')}
`;
		}
	}

	const script = `#!/usr/bin/env python3
# Auto-generated script for n8n Python Function (Raw)
${futureImports.length > 0 ? futureImports.join('\n') + '\n' : ''}
import json
import sys

# Input data and environment variables
input_items = ${JSON.stringify(data)}
env_vars = ${JSON.stringify(envVars)}
${individualVariables}
# User code starts here
${cleanedCodeSnippet}
`;
	return script;
}


async function getTemporaryScriptPath(codeSnippet: string, data: IDataObject[], envVars: Record<string, string>): Promise<string> {
	const tmpPath = tempy.file({extension: 'py'});
	const codeStr = getScriptCode(codeSnippet, data, envVars);
	
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
	timing?: DebugTiming
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

function createScriptBinary(scriptContent: string, filename: string = 'script.py'): { [key: string]: any } {
	const buffer = Buffer.from(scriptContent, 'utf8');
	return {
		[filename]: {
			data: buffer.toString('base64'),
			mimeType: 'text/x-python',
			fileExtension: 'py',
			fileName: filename,
		},
	};
}

function addDebugInfoToResult(
	result: IDataObject,
	debugInfo: DebugInfo,
	debugMode: string,
	scriptContent?: string
): void {
	if (debugMode === 'off') return;

	const debugData: any = {};

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
			debugData.debug_info.injected_data = debugInfo.injected_data;
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


