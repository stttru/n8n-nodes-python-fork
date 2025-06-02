# Change Log

- fix optional credentials issue in recent n8n versions.

# Changelog

All notable changes to this project will be documented in this file.

## [1.11.0] - 2025-01-XX

### 🎯 Major New Feature: Output File Processing
- **File Generation Support**: Python scripts can now generate files that are automatically detected and included in n8n workflow output
- **Unique Output Directory**: Each script execution gets a unique temporary directory accessible via `output_dir` variable
- **Automatic File Detection**: n8n scans the output directory after script execution and converts files to binary data
- **Universal File Support**: Support for any file type (images, PDFs, documents, videos, audio, data exports, etc.)
- **Smart MIME Type Detection**: Automatic MIME type detection for common file extensions

### 🔧 Configuration Options
- **Enable Output File Processing**: Toggle to activate file generation detection (default: disabled)
- **Max Output File Size**: Configurable size limit from 1-1000 MB (default: 100 MB)
- **Auto-cleanup Output Directory**: Automatic cleanup of temporary files and directories (default: enabled)
- **Include File Metadata**: Option to include file metadata in output JSON (default: enabled)

### 📁 File Processing Features
- **Binary Data Integration**: Generated files appear as binary data in n8n output with keys like `output_filename.ext`
- **Metadata Information**: File size, MIME type, extension, and binary key information in JSON output
- **Comprehensive File Support**: Text, JSON, CSV, HTML, PDF, images, videos, audio, archives, and more
- **Size Validation**: Automatic file size checking with configurable limits
- **Error Handling**: Graceful handling of file processing errors

### 🐍 Python Script Integration
```python
# output_dir variable automatically provided
import os
import json

# Create text report
report_path = os.path.join(output_dir, 'report.txt')
with open(report_path, 'w') as f:
    f.write("Generated report content")

# Create JSON data export  
data_path = os.path.join(output_dir, 'data.json')
with open(data_path, 'w') as f:
    json.dump({"results": "processed_data"}, f)
```

### 🎨 Use Cases
- **Report Generation**: Create PDF reports, charts, and visualizations
- **Data Export**: Export processed data to CSV, Excel, JSON formats
- **Image Processing**: Generate thumbnails, charts, processed images
- **Document Creation**: Create Word documents, presentations, templates
- **Video Processing**: Generate video thumbnails, metadata files
- **API Response Caching**: Save API responses as files for later use

### 🔄 Integration with Existing Features
- **Combined with Input File Processing**: Process input files and generate output files in the same script
- **Environment Variables**: Use credentials and environment variables in file generation
- **Debug Mode**: Generated files included in debug exports
- **Error Handling**: File generation errors handled according to error handling settings

### 📚 Documentation
- **Comprehensive Guide**: New OUTPUT_FILE_PROCESSING_GUIDE.md with examples and best practices
- **Advanced Examples**: Image generation, PDF creation, data export, video processing
- **Troubleshooting**: Common issues and debugging techniques
- **Integration Examples**: Combined usage with other node features

### 🛡️ Security & Performance
- **Isolated Directories**: Each execution uses a unique temporary directory
- **Automatic Cleanup**: Temporary files and directories automatically removed
- **Size Limits**: Configurable file size limits to prevent resource exhaustion
- **Permission Handling**: Proper file permission management

### 🔧 Technical Implementation
- **New Interfaces**: `OutputFileProcessingOptions`, `OutputFileInfo`
- **Core Functions**: `scanOutputDirectory()`, `getMimeType()`, `cleanupOutputDirectory()`, `createUniqueOutputDirectory()`
- **Enhanced Script Generation**: `output_dir` variable injection when output processing enabled
- **Binary Data Handling**: Automatic base64 conversion and binary data attachment

### 📈 Version Compatibility
- **Backward Compatible**: Existing workflows continue to work without changes
- **Optional Feature**: Output file processing is disabled by default
- **No Breaking Changes**: All existing functionality preserved

## [1.9.5] - 2024-12-XX

### Added
- **Multiple Credentials Methods**: Implemented 5 different approaches for adding multiple Python Environment Variables
  - **None (Default)**: Use only the credential from "Credential to connect with"
  - **Credential Names List**: Enter credential names as comma-separated text
  - **Additional Credential Selectors**: Use 3 additional credential name input fields
  - **Dynamic Credential Collection**: Add/remove credential entries with optional variable prefixes
  - **JSON Configuration**: Define credentials using structured JSON format
- **Enhanced Merge Strategies**: Added 4 merge strategies for handling variable conflicts
  - `last_wins`: Later credentials override earlier ones (default)
  - `first_wins`: Earlier credentials take precedence
  - `prefix_source`: Add credential name prefix to variables
  - `skip_conflicts`: Skip conflicting variables, keep first occurrence
- **Variable Prefixing**: Support for custom prefixes in Dynamic Collection and JSON Configuration methods
- **Comprehensive Error Handling**: Graceful fallbacks when credentials cannot be loaded

### Fixed
- **UI Blocking Issue**: Removed problematic loadOptions methods that caused interface blocking
- **TypeScript Errors**: Fixed all type safety issues and linting errors
- **Credential Loading**: Improved credential loading logic with better error handling

### Changed
- **Simplified Interface**: Replaced complex multi-select dropdown with user-friendly configuration options
- **Enhanced Documentation**: Updated with examples for all 5 credential methods
- **Better Logging**: Added detailed console output for credential loading debugging

### Technical Details
- Removed dependency on n8n's loadOptions API which was causing UI blocking
- Implemented modular credential loading functions for each method
- Added comprehensive type definitions for all configuration options
- Maintains 100% backward compatibility with existing workflows

## [1.9.4] - 2024-12-XX

### Fixed
- **Critical Fix**: Resolved "Error fetching options from Python Function (Raw)" for Python Environment Variables dropdown
- **Credentials Loading**: Fixed credential loading logic to properly handle default credential from "Credential to connect with"
- **Improved Error Handling**: Better handling of credentials when no specific credentials are selected
- **UI Improvements**: Updated dropdown options to provide clearer guidance for users

### Changed
- Enhanced credential selection logic with better fallbacks
- Improved helper value filtering to prevent UI errors
- Updated loadOptions method to avoid n8n API limitations

### Technical Details
- Fixed `getPythonEnvVarsCredentials` method to return proper informational options
- Enhanced `loadMultipleCredentialsWithStrategy` function with better error handling
- Improved fallback logic to default credential when no specific credentials selected
- Added filtering for helper/informational values in credential selection

## [1.9.3] - 2024-12-XX

### Documentation
- Translated all Russian text to English for full project localization
- Updated documentation files: PUBLISH_INSTRUCTIONS.md, DEVELOPMENT_SETUP.md, test_python_setup.py
- Ensured complete English-only codebase

## [1.9.2] - 2024-12-XX

### Fixed  
- Updated README.md with comprehensive v1.9.0 multiple credentials documentation
- Added usage examples for multiple credentials functionality
- Enhanced version history and feature descriptions

## [1.9.1] - 2024-12-XX

### Documentation
- Updated README.md with comprehensive v1.9.0 multiple credentials documentation
- Added usage examples for multiple credentials functionality  
- Enhanced version history and feature descriptions

## [1.9.0] - 2024-12-XX

### Added
- **Multiple Credentials Support**: New "Credentials Management" section above Python Code field
  - Select multiple Python Environment Variables credentials from dropdown
  - "Include All Available Credentials" option for automatic inclusion
  - Three merge strategies for handling variable name conflicts:
    - Last Selected Wins (default)
    - First Selected Wins 
    - Prefix with Credential Name
- **Enhanced Script Generation**: 
  - Environment variables now grouped by credential source in generated scripts
  - Source information included as comments when multiple credentials are used
  - Improved variable organization and readability
- **Backward Compatibility**: Existing workflows continue to work without changes
  - Legacy single credential behavior when no multiple credentials selected
  - All existing options and functionality preserved

### Technical Details
- Added `credentialsManagement` collection parameter with sub-options
- New helper functions `loadMultipleCredentialsWithStrategy()` and `getAllAvailableCredentials()`
- Updated `getScriptCode()` function to accept and use credential source information
- Enhanced debug information to include credential sources
- Credential source tracking throughout the execution pipeline

### UI Changes
- New "Credentials Management" section positioned above "Python Code" field
- Conditional display of merge strategy option when multiple credentials selected
- Improved user experience with clear descriptions and help text

### Notes
- Current implementation uses placeholder for credential selection due to n8n API limitations
- Full multiple credential selection will be available when n8n exposes the necessary APIs
- Framework is ready for future enhancements when n8n supports advanced credential management

## [1.8.0] - 2024-12-18

### ✨ Added
- **System Environment Variables Selection**: Added dropdown to select system environment variables to include in Python scripts
- **Individual Environment Variables**: Environment variables now injected as separate Python variables (e.g., `API_KEY = 'value'`) instead of only dictionary format
- **Flexible Legacy Objects Control**: Split legacy support into two separate toggles:
  - "Include input_items Array" (default: ON) - for input data from previous nodes  
  - "Include env_vars Dictionary" (default: OFF) - for legacy compatibility
- **Enhanced Security**: Environment variables filtering to exclude sensitive system variables
- **Improved User Experience**: Better default settings and more granular control

### 🔧 Changed
- **Breaking Change**: `env_vars` dictionary is now disabled by default (can be re-enabled)
- **Script Generation**: Environment variables are now primarily available as individual variables
- **UI**: Renamed "Legacy input_items Support" to separate "Include input_items Array" and "Include env_vars Dictionary" options
- **Example Code**: Updated to reflect new individual variables approach

### 🐛 Fixed
- Environment variable name sanitization for Python compatibility
- Better handling of invalid variable names (e.g., starting with numbers)

### 📚 Documentation
- Updated examples to show individual environment variables usage
- Added clear descriptions for all new options

## [1.7.0] - 2024-12-17

### 🚀 Major Features Added
- **Script Generation Options**: New configuration section with two important options:
  - **Legacy input_items Support**: Toggle to include/exclude `input_items` array in generated scripts
  - **Hide Variable Values**: Security option to replace variable values with asterisks in generated scripts
- **Automatic Script Cleanup**: All temporary Python scripts are now automatically deleted after execution
- **Enhanced Security**: Protect sensitive data in exported scripts with value hiding option

### 🔧 Technical Improvements
- **Script Cleanup System**: Comprehensive cleanup of temporary files in all execution paths
  - executeOnce: cleanup in finally block
  - executePerItem: cleanup after each item processing
  - Debug functions: cleanup of validation and version check scripts
- **Configurable Script Generation**: Users can now control exactly what gets included in generated scripts
- **Memory Management**: Better temporary file handling and cleanup

### 🎯 User Experience
- **Cleaner Script Output**: Option to remove `input_items` array for simpler scripts
- **Security Enhancement**: Hide sensitive values in debug exports
- **Backward Compatibility**: Legacy options enabled by default, no breaking changes
- **Automatic Cleanup**: No more temporary files left behind

### 📚 Configuration Options
```typescript
Script Generation Options:
☑️ Legacy input_items Support (default: enabled)
☐ Hide Variable Values (default: disabled)
```

### 🔄 Migration Guide
- **No action required**: All new options have safe defaults
- **To use new features**: Enable/disable options in "Script Generation Options" section
- **For cleaner scripts**: Disable "Legacy input_items Support" 
- **For security**: Enable "Hide Variable Values" when exporting scripts

## [1.6.2] - 2024-01-XX

### 📚 Documentation Update
- **Updated npm README**: Fixed missing documentation for Auto-Variable Extraction feature
- **Version History**: Added complete version history including v1.6.1 changes
- **Examples Update**: Added examples showing new auto-extracted variables usage

## [1.6.1] - 2024-01-XX

### 🐛 Bug Fixes
- **Fixed `from __future__` Import Error**: Automatically detect and move `from __future__` imports to the beginning of generated scripts
- **Resolved SyntaxError**: Prevent "from __future__ imports must occur at the beginning of the file" error

### 🚀 New Features  
- **Auto-Variable Extraction**: Fields from the first input item are now automatically extracted as individual variables
  - Direct access: use `title` instead of `input_items[0]['title']`
  - Cleaner, more readable Python code
  - Safe variable naming (invalid characters converted to underscores)
  - Backward compatible - `input_items` still available

### 🔧 Technical Improvements
- Enhanced script generation with smart `__future__` import handling
- Automatic variable extraction from input data fields
- Improved code readability and user experience
- Better Python syntax compliance

### 📚 Examples
```python
# Before (v1.6.0):
title = input_items[0]['title']
path = input_items[0]['sftp_path_episode_completed']

# After (v1.6.1):  
# Variables automatically available:
print(f"Processing: {title}")
print(f"File: {sftp_path_episode_completed}")
```

## [1.6.0] - 2024-01-XX

### 🚀 Major Features Added
- **Comprehensive Debug/Test System**: New "Debug/Test Mode" option with 5 modes:
  - "Off" (default) - Normal execution without debug overhead
  - "Basic Debug" - Add script content and basic execution info
  - "Full Debug" - Complete debugging with timing, environment, syntax validation
  - "Test Only" - Safe validation without execution (syntax checking, environment verification)
  - "Export Script" - Full debug plus downloadable .py script files
- **Script Export Functionality**: Download actual executed Python scripts as binary files
- **Syntax Validation**: Pre-execution Python syntax checking using AST parser
- **Environment Checking**: Python executable detection and version verification
- **Execution Timing**: Performance profiling with detailed timing metrics
- **Safe Testing**: Test Only mode for production-safe script validation

### 🔧 Technical Implementations
- **Debug Information System**: Comprehensive debug data collection and reporting
- **Binary File Support**: Script files as downloadable attachments with timestamped names
- **Performance Metrics**: Execution timing from script creation to completion
- **Environment Validation**: Python version detection and executable verification
- **Syntax Checking**: AST-based Python syntax validation without execution
- **Error-Specific Exports**: Different filename patterns for errors vs successful runs
- **Per-Item Debug**: Individual debug information for "Once per Item" execution mode

### 📚 Documentation
- **Debug Features Guide**: Complete documentation of all debug modes with examples
- **Troubleshooting Workflows**: Step-by-step debugging approaches
- **Performance Analysis**: How to use timing information for optimization
- **Use Case Examples**: Real-world debugging scenarios and solutions

### 🎯 User Experience
- **Developer-Friendly**: Comprehensive debugging tools for script development
- **Production-Safe Testing**: Validate scripts without side effects
- **Performance Insights**: Understanding execution characteristics
- **Script Portability**: Download and share working Python scripts
- **Error Diagnosis**: Enhanced error reporting with full context

## [1.5.0] - 2024-01-XX

### 🚀 Major Features Added
- **Enhanced Error Handling**: New "Error Handling" option with three modes:
  - "Return Error Details" (default) - Continue execution and return error information
  - "Throw Error on Non-Zero Exit" - Stop workflow execution if script exits with non-zero code
  - "Ignore Exit Code" - Continue execution regardless of exit code, only throw on system errors
- **Comprehensive Variable Documentation**: Detailed README section explaining how to work with `input_items` and `env_vars`
- **Real-World Examples**: Added practical use cases including API integration, data validation, and environment-based processing
- **Best Practices Guide**: Added recommendations for safe data handling and error management

### 🔧 Technical Improvements
- Replaced boolean "Return Error Details" option with more flexible "Error Handling" options
- Enhanced error handling logic to properly support all three modes in both execution modes
- Fixed error handling logic in both `executeOnce` and `executePerItem` functions
- Added proper support for "ignore" mode that continues execution even with non-zero exit codes
- Enhanced catch block logic to handle different error modes correctly

### 📚 Documentation Improvements
- **Working with Input Variables**: Complete guide with execution mode behavior
- **Data Inspection Examples**: Basic and advanced data processing patterns
- **Real-World Use Cases**: API integration, data validation, conditional processing
- **Best Practices**: Safe data access, error handling, environment configuration

### 🎯 User Experience
- Better workflow control with exit code handling options
- Clearer understanding of variable behavior in different execution modes
- Improved error visibility and debugging capabilities

## [1.4.2] - 2024-01-01

### 🐛 Bug Fixes
- **Fixed Parse Options Parameter Error**: Resolved "Could not get parameter parseOptions" error
  - Fixed conditional parameter loading for parseOptions when Parse Output is set to "None" or "Lines"
  - Added proper default value handling (empty object) for parseOptions parameter
  - Enhanced parameter validation for all Parse Output modes

### 🔧 Technical Improvements
- Better handling of conditional parameters based on Parse Output selection
- Improved robustness for different parsing mode configurations

## [1.4.1] - 2024-01-01

### 🐛 Bug Fixes
- **Fixed Parameter Error**: Resolved "Could not get parameter passThroughMode" error
  - Fixed conditional parameter loading when Pass Through Input Data is disabled
  - Added proper default value handling for passThroughMode parameter
  - Improved parameter validation logic to prevent runtime errors

### 🔧 Technical Improvements
- Enhanced parameter dependency handling in node configuration
- Better error prevention for conditional UI parameters

## [1.4.0] - 2024-01-01

### 🚀 Major Features Added
- **Multiple Execution Modes**: Added flexible execution control
  - "Once for All Items": Execute script once with all input items (default, faster)
  - "Once per Item": Execute script separately for each input item (more flexible)
- **Data Pass-Through System**: Preserve and combine input data with Python results
  - Option to enable/disable pass-through (default: false for backward compatibility)
  - Three pass-through modes: Merge, Separate Field, Multiple Outputs
- **Enhanced Script Management**: Guaranteed script file overwriting for reliable execution
  - Automatic cleanup and recreation of temporary Python files
  - Console logging for script creation debugging

### 🎯 Execution Mode Features
- **Once for All Items**: 
  - Single script execution with all input items available in `input_items`
  - Better performance for batch processing
  - Maintains backward compatibility as default mode
- **Once per Item**:
  - Individual script execution for each input item
  - Each execution sees only one item in `input_items[0]`
  - Perfect for item-specific processing and transformations
  - Includes `itemIndex` in result for tracking

### 📊 Data Pass-Through Modes
- **Merge with Result**: Input data fields are merged directly into the Python result object
- **Separate Field**: Input data is added as `inputData` field in the result
- **Multiple Outputs**: Returns separate output items - first the Python result, then all input items

### 🔧 Technical Improvements
- Refactored execution logic into separate functions (`executeOnce`, `executePerItem`)
- Enhanced error handling for both execution modes
- Improved type safety with proper IDataObject usage
- Better memory management with explicit file cleanup
- Comprehensive logging for debugging execution flow

### 📋 Configuration Changes
- Added "Execution Mode" dropdown selection
- Added "Pass Through Input Data" boolean option
- Added "Pass Through Mode" conditional dropdown
- Maintained backward compatibility with all existing configurations

### 🐛 Bug Fixes
- Fixed script file caching issues by ensuring proper file overwriting
- Resolved linting errors and improved code quality
- Enhanced error propagation in per-item execution mode

## [1.3.0] - 2024-01-01

### 🚀 Major Features Added
- **Advanced Output Parsing**: Added comprehensive stdout parsing capabilities
  - JSON parsing with support for single and multiple objects
  - CSV auto-detection and parsing into structured objects
  - Lines parsing for text data splitting
  - Smart auto-detection mode for mixed content
- **Parse Configuration Options**:
  - Multiple JSON objects handling (newline-separated)
  - Strip non-JSON text for mixed output
  - Fallback on parse error with original stdout preservation
- **Enhanced Output Structure**: Added parsing results fields:
  - `parsed_stdout`: Structured parsed data
  - `parsing_success`: Boolean success indicator
  - `parsing_error`: Detailed parsing error information
  - `output_format`: Detected content format (json/csv/lines/text)
  - `parsing_method`: Method used for parsing

### 🎯 Smart Parsing Features
- **JSON Detection**: Automatic identification of JSON objects and arrays
- **CSV Recognition**: Intelligent detection of comma/tab-separated data
- **Mixed Content Handling**: Extract structured data from mixed text output
- **Error Recovery**: Graceful fallback to original content on parse failures

### 📊 Supported Output Formats
- **None**: Raw string output (default, backward compatible)
- **JSON**: Parse as JSON with validation and error handling
- **Lines**: Split text into array of lines
- **Smart**: Auto-detect and parse JSON, CSV, or fallback to lines

### 🔧 Technical Improvements
- Enhanced node configuration with new parsing options
- Improved type safety with parsing result interfaces
- Better error handling for malformed data
- Comprehensive logging for debugging parse operations

## [1.2.0] - 2024-01-01

### Added
- "Return Error Details" configuration option (default: true)
- Enhanced error handling that returns error data instead of throwing exceptions
- Improved Python error parsing with detailed information including:
  - Missing Python modules detection
  - Line number extraction from tracebacks
  - Detailed error categorization
- Console logging for debugging and error tracking

### Changed
- Default behavior now returns error information as data rather than stopping workflow
- More comprehensive error messages with installation suggestions for missing packages
- Better error categorization and reporting

## [1.1.0] - 2024-01-01

### Added
- "Inject Variables" boolean option to control variable injection
- Support for pure Python scripts without n8n-specific variables
- Enhanced error parsing with `parsePythonError()` function
- Better error messages for missing Python modules

### Changed
- Variable injection is now optional (default: enabled for backward compatibility)
- Improved error handling and user feedback

## [1.0.0] - 2024-01-01

### Added
- Initial fork from naskio/n8n-nodes-python
- Raw Python script execution without python-fire dependency
- Single script execution model (vs. item-by-item processing)
- Direct access to stdout, stderr, and exit codes
- Environment variable access
- Input items available as `input_items` variable
- Configurable Python executable path
- Execution metadata including timestamps and success status

### Changed
- Complete rewrite of execution logic
- Changed node name from 'pythonFunction' to 'pythonFunctionRaw'
- Removed python-fire wrapper dependency
- Changed from transformed items output to raw execution metadata

### Technical Details
- Added `getTemporaryPureScriptPath()` function for script handling
- Direct Python process spawning via child_process
- Enhanced error reporting and debugging capabilities
