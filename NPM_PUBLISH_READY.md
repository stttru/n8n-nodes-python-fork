# NPM Publishing Instructions for v1.17.0

## Status
✅ **Git Repository**: All changes committed and pushed  
✅ **Git Tag**: v1.17.0 tag created and pushed  
✅ **Package Build**: Successfully built and packaged  
✅ **Dry Run**: Package ready for npm publication  

## Package Details
- **Name**: n8n-nodes-python-raw
- **Version**: 1.17.0
- **Size**: 60.0 kB (packed), 310.6 kB (unpacked)
- **Files**: 12 files included
- **Registry**: https://registry.npmjs.org/

## To Publish to NPM

### Option 1: Manual OTP
```bash
npm publish --otp=<your-otp-code>
```

### Option 2: Interactive OTP
```bash
npm publish
# Enter OTP when prompted
```

## What's Included in v1.17.0

### Major Features
- **Execution Timeout**: Configurable timeout (1-1440 minutes, default 10)
- **Complete Execution Isolation**: Dedicated temporary directories
- **Automatic Cleanup**: Recursive directory removal with zero traces
- **Enhanced Security**: Process isolation and resource management

### Documentation
- **Comprehensive Restructuring**: New docs/ directory structure
- **New Guides**: Dual outputs, timeout, cleanup, debugging
- **Archived Legacy**: Historical documentation properly archived
- **Updated README**: All new features documented

### Technical Improvements
- **Timeout Protection**: SIGKILL termination for runaway scripts
- **Resource Management**: Automatic cleanup prevents disk issues
- **Error Handling**: Enhanced timeout error codes (-2)
- **Security**: Complete execution isolation

## Verification Commands

### Check Package Contents
```bash
npm pack --dry-run
```

### Verify Git Status
```bash
git status
git log --oneline -1
git tag -l | grep v1.17.0
```

### Test Installation (after publish)
```bash
npm install n8n-nodes-python-raw@1.17.0
```

## Post-Publication

1. **Verify on npm**: https://www.npmjs.com/package/n8n-nodes-python-raw
2. **Check Version**: Ensure v1.17.0 is published
3. **Test Installation**: Install in test n8n instance
4. **Update Documentation**: Verify all links work

## Release Notes Summary

**v1.17.0: Execution Timeout and Enhanced Cleanup Architecture**

- Added execution timeout configuration (1-1440 minutes, default 10)
- Implemented complete execution isolation with dedicated temporary directories
- Added automatic cleanup with recursive directory removal
- Enhanced security through execution isolation
- Comprehensive documentation restructuring
- Zero-trace execution for enhanced security

**Breaking Changes**: None  
**Migration**: No migration required - fully backward compatible  
**Dependencies**: No new dependencies added  

## Files Changed (26 files)
- Modified: CHANGELOG.md, README.md, package.json, PythonFunction.node.ts, node.test.ts
- Added: docs/ directory structure, new guides, python-logo.svg, test file
- Moved: All documentation files to organized structure
- Deleted: Duplicate OUTPUT_FILE_*.md files
- Archived: 7 legacy report files

Ready for npm publication! 🚀
