# Change Log

- fix optional credentials issue in recent n8n versions.

# Changelog

All notable changes to this project will be documented in this file.

## [1.13.1] - 2025-06-03

### Fixed
- **Extract Code Template**: Fixed "Node type does not have method defined" error when using Extract Code Template functionality
- **UI Enhancement**: Improved template display in Extract Code Template dropdown with full template preview
- **Error Handling**: Better error handling and user feedback for template generation

## [1.13.0] - 2025-01-27

### 🔍 Extract Code Template Functionality
- **NEW**: Code Template Mode toggle to enable template extraction functionality
- **NEW**: Interactive "Extract Code Template" button with loadOptionsMethod integration
- **NEW**: Auto-Generated Code Template field with Python syntax highlighting and 15-row display
- **NEW**: Dynamic template generation based on current node configuration
- **NEW**: Support for all node options (file processing, credentials, environment variables, output processing)

### 🎯 Developer Experience Enhancement
- **CodeTemplateData Interface**: Comprehensive data structure for template metadata and generation info
- **generateCodeTemplate() Method**: Interactive UI method with proper error handling and user feedback
- **generateCodeTemplateStatic() Function**: Core template generation with configuration analysis
- **Template Validation**: Reflects current node settings including Script Generation Options, File Processing, and Credentials

### 🛠️ Technical Implementation
- **UI Integration**: Seamless integration with existing node interface using displayOptions
- **Configuration Awareness**: Template automatically reflects enabled features (inject variables, file processing, output files, etc.)
- **Error Handling**: Graceful handling of incomplete configurations with informative messages
- **Code Structure**: Clean separation between UI methods and core generation logic

### 📚 User Benefits
- **Code Understanding**: View the auto-generated Python code structure that n8n creates around user scripts
- **Debugging Aid**: Identify variable injection and configuration issues before execution
- **Learning Tool**: Understand n8n Python integration patterns and best practices
- **External Development**: Copy boilerplate code for use in external Python projects
- **Configuration Validation**: Verify node settings are correct before script execution

### 🧪 Testing & Quality
- **Comprehensive Testing**: Full test coverage with `test_extract_code_template.py`
- **Conda Environment Support**: Tested with Python conda environments
- **TypeScript Compilation**: Clean compilation without linting errors
- **Backward Compatibility**: All existing functionality preserved without breaking changes

### 📋 Usage Instructions
1. Enable "Code Template Mode" checkbox in node configuration
2. Configure node settings (Script Generation Options, File Processing, Credentials, etc.)
3. Click "Extract Code Template" button to generate current template
4. View generated code in "Auto-Generated Code Template" field with syntax highlighting
5. Copy and use template code for external development or debugging

### 🎨 UI Enhancements
- **Conditional Display**: Template options only show when Code Template Mode is enabled
- **Syntax Highlighting**: Python code editor with proper formatting
- **Interactive Feedback**: Button provides immediate response with template generation
- **Clean Integration**: Seamlessly fits into existing node interface design

## [1.12.6] - 2025-06-02

### 📚 Documentation Update
- **UPDATED**: Complete README.md overhaul with comprehensive documentation for all features
- **NEW**: Detailed Output File Processing guide with examples for PDF, CSV, image, and video generation
- **NEW**: File Debug System documentation with troubleshooting guides
- **NEW**: Script Export Format documentation for security compliance
- **ENHANCED**: Configuration options documentation with all v1.12.x features
- **IMPROVED**: Usage examples with real-world scenarios and complete code samples
- **ADDED**: Troubleshooting guide for common issues and solutions

### 📖 Documentation Highlights
- Complete file processing workflow examples
- FFmpeg video generation tutorial
- Multiple credentials with file output examples
- File debugging and diagnostics guide
- Common import issues and solutions
- Version history with feature summaries

## [1.12.5] - 2025-06-02

### 🐛 Critical Fixes
- **REMOVED**: Completely removed `input_items` variable from generated Python scripts (legacy cleanup)
- **FIXED**: File-related variables (`output_dir`, `expected_filename`, `output_file_path`) now always remain visible even when "Hide Variable Values" is enabled
- **IMPROVED**: Cleaner script generation without unnecessary legacy variables

### 🔧 Technical Improvements
- File processing variables are never hidden for security/functionality reasons
- Reduced script bloat by removing unused `input_items` array
- Better separation between sensitive credentials and functional file paths

## [1.12.4] - 2025-06-02

### 🚀 Enhanced Output File Processing
- **NEW**: Added `expected_filename` variable in Python scripts - contains the exact filename expected by n8n
- **IMPROVED**: Enhanced comments and instructions for both detection modes
- **DOCUMENTATION**: Mode-specific code examples and usage patterns in generated scripts

### 🎯 Developer Experience
- **Ready Variable Path Mode**: Two methods provided - ready-made `output_file_path` and manual `expected_filename`
- **Auto Search Mode**: Clear instructions on using `expected_filename` for file creation
- **Smart Comments**: Context-aware help text based on selected file detection mode

### 📝 Code Examples in Generated Scripts
```python
# Ready Variable Path Mode:
with open(output_file_path, 'w') as f:  # Method 1 (recommended)
    f.write("content")

file_path = os.path.join(output_dir, expected_filename)  # Method 2
with open(file_path, 'w') as f:
    f.write("content")

# Auto Search Mode:
with open(expected_filename, 'w') as f:  # Direct usage
    f.write("content")
```

## [1.12.3] - 2025-06-02

### 🐛 Critical UI Fixes
- **FIXED**: Expected Output Filename field was not displayed due to circular dependency in UI conditions
- **IMPROVED**: Added default example filename "result.json" to guide users
- **ENHANCED**: File Detection Mode now always visible when Output File Processing is enabled

### 📱 User Experience
- Users can now properly configure expected output filenames
- Clear example provided by default, fully customizable by user
- Intuitive UI flow for file detection configuration

## [1.12.2] - 2025-01-XX

### 🎯 Smart Output File Detection System
- **Fixed Critical Issue**: `output_dir` variable now properly injected even when "Inject Variables" is disabled
- **Expected Output Filename**: New required field for automatic file detection and processing
- **Dual Detection Modes**:
  - **Ready Variable Path**: Provides `output_file_path` variable with complete file path
  - **Auto Search by Name**: Automatically finds files by filename across filesystem
- **Smart Instructions**: Auto-generated code comments guide developers on file usage
- **Enhanced File Search**: Recursive file search with intelligent path detection

### 🛠️ Technical Improvements
- **Robust File Processing**: Works regardless of "Inject Variables" setting
- **Path Resolution**: Automatic path joining for cross-platform compatibility  
- **Performance Optimized**: Limited search depth and smart directory filtering
- **Error Recovery**: Graceful handling of missing files and permissions

### 📚 Developer Experience
- **Contextual Help**: Mode-specific instructions appear as comments in generated scripts
- **Clear Examples**: Ready-to-use code examples for both detection modes
- **Filename Validation**: UI validation for expected output filename field
- **Better Diagnostics**: Enhanced file debug information with search results

## [1.12.1] - 2025-01-XX

### 🎨 Enhanced Script Export Options
- **Script Export Format Selection**: New option to choose export format in "Export Script" debug mode
  - **Python File (.py)**: Standard Python script format (default)
  - **Text File (.txt)**: Plain text format for cases where .py files are blocked by security policies
- **Security-Friendly Export**: Helps bypass antivirus or corporate security restrictions that may block .py files
- **Conditional UI**: Format selector appears only when "Export Script" debug mode is selected

### 🛠️ Technical Implementation
- **Updated createScriptBinary()**: Enhanced function to support multiple file formats
- **Dynamic MIME Types**: Automatic MIME type detection based on selected format (.py = text/x-python, .txt = text/plain)
- **Filename Extension Handling**: Automatic extension replacement (.py → .txt when text format selected)
- **All Export Scenarios Covered**: Format selection works for successful execution, errors, and system errors

### 📋 Usage Example
1. Set "Debug/Test Mode" to "Export Script"
2. Choose "Script Export Format":
   - "Python File (.py)" - Standard format for development environments
   - "Text File (.txt)" - Alternative format for restricted environments
3. Downloaded files will have the selected format and appropriate MIME type

### 🎯 Use Cases
- **Corporate Environments**: Export as .txt when .py files are blocked by security policies
- **Email Sharing**: .txt files are more likely to pass through email filters
- **Documentation**: Include Python scripts in documentation as text files
- **Development Workflow**: Standard .py format for normal development work

## [1.12.0] - 2025-01-XX

### 🔍 Advanced File Debugging System
- **File Debug Options**: New comprehensive debugging section for troubleshooting file processing issues
  - **Enable File Debugging**: Toggle to include detailed file processing information in output
  - **Debug Input Files**: Detailed information about input files processing (size, type, paths, errors)
  - **Debug Output Files**: Comprehensive output files and directory scanning information
  - **Include System Information**: System permissions, disk space, environment variables analysis
  - **Include Directory Listings**: File listings from working, temp, and output directories

### 📊 Diagnostic Information
- **Input Files Analysis**: 
  - File count, total size, files by type statistics
  - Individual file details (filename, size, MIME type, extension, binary key, temp path availability)
  - Processing errors and validation issues
- **Output Files Diagnosis**:
  - Processing enabled status, output directory path and permissions
  - Directory existence, writability, and permission details
  - Found files with metadata (filename, size, MIME type, creation time)
  - Scan errors and access issues
- **System Environment Analysis**:
  - Python executable path, working directory information
  - User permissions (temp file creation, file system access)
  - Disk space availability, temp directory information
  - Environment variables availability (output_dir presence and value)
- **Directory Listings**: File listings from working directory, temp directory, and output directory

### 🐛 Troubleshooting Capabilities
- **Output File Processing Issues**: Diagnose why `output_dir` variable is not available or files are not detected
- **Input File Problems**: Identify file size, type, or access issues
- **Permission Issues**: Detect file system permission problems
- **Environment Problems**: Check system environment and directory access

### 🛠️ Technical Implementation
- **New Interfaces**: `FileDebugOptions`, `FileDebugInfo` with comprehensive typing
- **Diagnostic Functions**: 
  - `createFileDebugInfo()`: Main debug information collector
  - `createInputFileDebugInfo()`: Input files analysis
  - `createOutputFileDebugInfo()`: Output files and directory analysis
  - `createSystemDebugInfo()`: System environment diagnostics
  - `createDirectoryListingInfo()`: Directory content listings
- **Integration**: Available in both "Once for All Items" and "Once per Item" execution modes

### 📋 Usage Example
Enable "File Debug Options" → "Enable File Debugging" to see output like:
```json
{
  "fileDebugInfo": {
    "input_files": {
      "count": 2,
      "total_size_mb": 5.47,
      "files_by_type": {"image/jpeg": 1, "application/pdf": 1},
      "files_details": [...]
    },
    "output_files": {
      "processing_enabled": true,
      "output_directory": "/tmp/n8n_output_xyz",
      "directory_exists": true,
      "directory_writable": true,
      "found_files": [...]
    },
    "system_info": {
      "python_executable": "/usr/bin/python3",
      "working_directory": "/app",
      "user_permissions": {"can_write_temp": true, "can_create_files": true},
      "environment_variables": {"output_dir_available": true, "output_dir_value": "/tmp/n8n_output_xyz"}
    }
  }
}
```

### 🎯 Problem Solving Focus
- **Primary Use Case**: Diagnose why Output File Processing isn't working (e.g., `output_dir` not available)
- **Secondary Benefits**: Debug any file-related issues in Python scripts
- **Debugging Aid**: Comprehensive system information for troubleshooting support requests

## [1.11.2] - 2025-01-XX

### 📚 Documentation
- **Complete English Translation**: Finalized translation of all remaining test files
  - `test_integration_status.py` - integration status analysis translation
  - `test_final_integration.py` - final integration test translation
  - `test_output_file_final.py` - output file final test translation
  - `FUNCTIONALITY_VERIFICATION.md` - functionality verification report translation
- **100% English Codebase**: Entire project now uses English exclusively
- **Zero Russian Text**: Complete removal of all Russian text from the project

### 🌐 Internationalization
- **Professional Standards**: Full compliance with international open-source standards
- **Global Accessibility**: Enhanced accessibility for international developers
- **Community Ready**: Prepared for global community contributions

## [1.11.1] - 2025-01-XX

### 📚 Documentation
- **Complete English Translation**: Translated all remaining Russian text to English
  - `OUTPUT_FILE_USAGE_GUIDE.md` - fully translated usage guide
  - `INTEGRATION_PLAN.md` - complete integration plan translation
  - `test_script_generation.py` - test file translation
  - `test_output_file_integration.py` - comprehensive integration test translation
- **Consistent Language**: Entire project now uses English exclusively
- **Improved Accessibility**: Enhanced international accessibility with full English documentation

### 🌐 Internationalization
- **English-Only Codebase**: All documentation, comments, and user-facing text in English
- **Professional Standards**: Aligned with international open-source project standards
- **Better Community Support**: Enhanced contribution potential from global developer community

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
