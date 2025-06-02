# Change Log

- fix optional credentials issue in recent n8n versions.

# Changelog

All notable changes to this project will be documented in this file.

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
