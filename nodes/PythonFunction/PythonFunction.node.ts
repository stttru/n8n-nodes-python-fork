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
				default: `# This script runs once and receives input data as 'input_items' variable
# Available variables:
# - input_items: list of all input data
# - env_vars: dict of environment variables

import json
import sys

# Your Python code here
print("Input items count:", len(input_items))
for i, item in enumerate(input_items):
    print(f"Item {i}: {item}")

# Example: process data and print results
result = {"processed_count": len(input_items), "status": "success"}
print(json.dumps(result))

# Exit with success
sys.exit(0)
`,
				description: 'Pure Python script that will be executed once. Input data available as input_items variable.',
				noDataExpression: true,
			},
			{
				displayName: 'Python Executable',
				name: 'pythonPath',
				type: 'string',
				default: 'python3',
				description: 'Path to Python executable (python3, python, or full path)',
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
		
		// Get the environment variables
		let pythonEnvVars: Record<string, string> = {};
		try {
			pythonEnvVars = parseEnvFile(String((await this.getCredentials('pythonEnvVars'))?.envFileContent || ''));
		} catch (_) {
		}
		
		let scriptPath = '';
		try {
			scriptPath = await getTemporaryScriptPath(functionCode, unwrapJsonField(items), pythonEnvVars);
		} catch (error) {
			throw new NodeOperationError(this.getNode(), `Could not generate temporary script file: ${(error as Error).message}`);
		}

		try {
			// Execute the Python script
			const execResults = await execPythonSpawn(scriptPath, pythonPath, this.sendMessageToUI);
			const {
				error: returnedError,
				exitCode,
				stdout,
				stderr,
			} = execResults;

			// Create result item with raw output
			const resultItem: INodeExecutionData = {
				json: {
					exitCode: exitCode,
					stdout: stdout,
					stderr: stderr,
					success: exitCode === 0,
					error: returnedError ? returnedError.message : null,
					inputItemsCount: items.length,
					executedAt: new Date().toISOString(),
				}
			};

			// If execution failed and continueOnFail is false, throw error
			if (returnedError !== undefined && !this.continueOnFail()) {
				throw new NodeOperationError(
					this.getNode(), 
					`Python script failed with exit code ${exitCode}: ${returnedError.message}`
				);
			}

			return this.prepareOutputData([resultItem]);

		} catch (error) {
			if (this.continueOnFail()) {
				const errorItem: INodeExecutionData = {
					json: {
						exitCode: -1,
						stdout: '',
						stderr: (error as Error).message || String(error),
						success: false,
						error: (error as Error).message || String(error),
						inputItemsCount: items.length,
						executedAt: new Date().toISOString(),
					}
				};
				return this.prepareOutputData([errorItem]);
			} else {
				throw error;
			}
		}
	}
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
	const script = `#!/usr/bin/env python3
# Auto-generated script for n8n Python Function (Raw)
import json
import sys

# Input data and environment variables
input_items = ${JSON.stringify(data)}
env_vars = ${JSON.stringify(envVars)}

# User code starts here
${codeSnippet}
`;
	return script;
}


async function getTemporaryScriptPath(codeSnippet: string, data: IDataObject[], envVars: Record<string, string>): Promise<string> {
	const tmpPath = tempy.file({extension: 'py'});
	const codeStr = getScriptCode(codeSnippet, data, envVars);
	// write code to file
	fs.writeFileSync(tmpPath, codeStr);
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

