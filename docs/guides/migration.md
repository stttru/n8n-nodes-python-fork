# Migration Guide

Complete guide for upgrading between versions of n8n-nodes-python-raw.

## Migrating to v1.24.1+

### Breaking Changes
- **None** - This version is fully backward compatible

### New Features
- **Resource Limits**: Memory (64MB-100GB) and CPU (1-100% of all cores) limits
- **Improved Default Code Template**: Fixed IndentationError and enhanced examples
- **Enhanced Security**: Better credential handling and sensitive data protection

### What to Update

#### 1. Review Resource Limits
- **Memory Limit**: Default 512 MB (range: 64 MB - 100 GB)
- **CPU Limit**: Default 50% (range: 1-100% of all cores)
- **Recommendation**: Start with defaults and adjust based on your workloads

#### 2. Test Existing Workflows
- Run existing workflows to ensure they work with new resource limits
- Monitor for any memory or CPU limit issues
- Adjust limits if needed based on actual usage

#### 3. Update Documentation
- Review new features in [Resource Limits Guide](resource-limits.md)
- Check [Full Debug+ Guide](full-debug-plus.md) for enhanced diagnostics
- Use [Quick Reference](QUICK_REFERENCE.md) for parameter lookup

### Migration Steps

1. **Update Package**: Install v1.24.1+ in n8n
2. **Review Settings**: Check resource limit settings
3. **Test Workflows**: Run existing workflows
4. **Monitor Performance**: Watch for resource limit issues
5. **Adjust Limits**: Increase limits if needed
6. **Document Changes**: Update team documentation

## Migrating to v1.24.0+

### Breaking Changes
- **None** - This version is fully backward compatible

### New Features
- **Resource Limits**: Memory and CPU limits with auto-generated wrapper scripts
- **Enhanced Security**: Better resource protection and cleanup
- **Improved Diagnostics**: Resource limit information in Full Debug+

### What to Update

#### 1. Configure Resource Limits
- **Memory Limit**: Set appropriate limit for your workloads (default: 512 MB)
- **CPU Limit**: Set CPU usage limit (default: 50%)
- **Platform Support**: Full support on Linux/macOS, graceful fallback on Windows

#### 2. Test Resource-Intensive Scripts
- Scripts that consume significant memory or CPU
- Large data processing workflows
- ML/AI workloads

#### 3. Monitor Resource Usage
- Use Full Debug+ to monitor actual resource usage
- Adjust limits based on real usage patterns
- Consider server capacity when setting limits

### Migration Steps

1. **Update Package**: Install v1.24.0+ in n8n
2. **Configure Limits**: Set appropriate memory and CPU limits
3. **Test Scripts**: Run resource-intensive scripts
4. **Monitor Usage**: Use Full Debug+ to monitor resource usage
5. **Adjust Limits**: Fine-tune limits based on actual usage
6. **Document Settings**: Record optimal settings for different workloads

## Migrating to v1.23.1+

### Breaking Changes
- **None** - This version is fully backward compatible

### New Features
- **Full Debug+ Error Fix**: Complete diagnostics and file export for error cases
- **Enhanced Error Handling**: Better error information in Full Debug+ mode

### What to Update

#### 1. Verify Full Debug+ Behavior
- Test Full Debug+ mode with both success and error cases
- Ensure error cases provide complete diagnostics
- Verify file export works for error cases

#### 2. Update Error Handling Workflows
- Review workflows that handle script errors
- Ensure error handling logic works with enhanced diagnostics
- Update any custom error processing code

### Migration Steps

1. **Update Package**: Install v1.23.1+ in n8n
2. **Test Error Cases**: Run workflows with intentional errors
3. **Verify Diagnostics**: Check Full Debug+ output for error cases
4. **Update Documentation**: Update team documentation if needed

## Migrating to v1.23.0+

### Breaking Changes
- **None** - This version is fully backward compatible

### What Changed
- **Rollback to Stable**: Reverted to v1.19.4 after stdin experiments
- **Restored File-Based Execution**: Back to reliable file-based script execution
- **Removed Experimental Features**: Removed stdin + FD3 secure mode

### What to Update

#### 1. Verify Execution Method
- Scripts now use file-based execution (not stdin)
- Temporary files are created and cleaned up properly
- Execution is more reliable and stable

#### 2. Test Existing Workflows
- All existing workflows should work without changes
- No configuration changes needed
- Performance should be stable

### Migration Steps

1. **Update Package**: Install v1.23.0+ in n8n
2. **Test Workflows**: Run existing workflows to verify stability
3. **Monitor Performance**: Ensure execution is stable
4. **No Configuration Changes**: No settings need to be updated

## Migrating to v1.20.0+

### Breaking Changes
- **Debug Modes Simplified**: Reduced from 5 modes to 2 modes

### What Changed
- **Old Modes Removed**: Basic Debug, Full Debug, Test Only, Export Script
- **New Modes**: Off (Production) and Full Debug+ (Developer)
- **Simplified Interface**: Cleaner, less confusing debug options

### Migration Steps

#### 1. Update Debug Mode Settings
- **"Basic Debug" → "Off"**: Use Off mode for production
- **"Full Debug" → "Full Debug+"**: Use Full Debug+ for development
- **"Test Only" → "Off" + Manual Testing**: Use Off mode and test manually
- **"Export Script" → "Full Debug+"**: Use Full Debug+ for file export

#### 2. Update Workflow Logic
- Remove any conditional logic based on old debug modes
- Update any custom code that checked for specific debug modes
- Simplify debug mode handling

#### 3. Update Documentation
- Update team documentation to reflect new debug modes
- Remove references to old debug modes
- Add information about Full Debug+ mode

### Configuration Changes

| Old Mode | New Mode | Action Required |
|----------|----------|----------------|
| Basic Debug | Off | Change setting |
| Full Debug | Full Debug+ | Change setting |
| Test Only | Off | Change setting + manual testing |
| Export Script | Full Debug+ | Change setting |
| Off | Off | No change |

## Migrating to v1.19.4+

### Breaking Changes
- **None** - This version is fully backward compatible

### New Features
- **Security Fix**: Fixed credential value leak in Full Debug+ diagnostics
- **Enhanced Security**: Better protection of sensitive data

### What to Update

#### 1. Enable Hide Variable Values
- **Recommendation**: Enable "Hide Variable Values" in production
- **Purpose**: Prevents sensitive data from appearing in exported files
- **Effect**: Replaces sensitive values with `***hidden***`

#### 2. Review Security Settings
- Check all workflows for sensitive data handling
- Ensure "Hide Variable Values" is enabled where needed
- Review Full Debug+ usage in production

### Migration Steps

1. **Update Package**: Install v1.19.4+ in n8n
2. **Enable Security**: Enable "Hide Variable Values" in production
3. **Test Security**: Verify sensitive data is hidden in exports
4. **Update Policies**: Update team security policies if needed

## Migrating to v1.19.0+

### Breaking Changes
- **None** - This version is fully backward compatible

### New Features
- **Full Debug+ Implementation**: Comprehensive developer diagnostics
- **System Information**: OS, Node.js, n8n, Python environment details
- **File Export**: Python script and diagnostics JSON as binary attachments
- **Enhanced Diagnostics**: Complete execution timeline and resource usage

### What to Update

#### 1. Explore Full Debug+ Mode
- **New Mode**: "🔬 Full Debug+ (Developer Mode)"
- **Purpose**: Maximum diagnostic information for troubleshooting
- **Use Cases**: Development, issue reporting, performance analysis

#### 2. Update Debugging Workflows
- Replace old debug modes with Full Debug+ where appropriate
- Use Full Debug+ for comprehensive troubleshooting
- Leverage file export for sharing diagnostics

#### 3. Update Documentation
- Learn about Full Debug+ capabilities
- Update team debugging procedures
- Document when to use Full Debug+ vs Off mode

### Migration Steps

1. **Update Package**: Install v1.19.0+ in n8n
2. **Explore Full Debug+**: Test the new debug mode
3. **Update Procedures**: Update team debugging procedures
4. **Train Team**: Train team on Full Debug+ features
5. **Document Usage**: Document when to use Full Debug+

## Migrating to v1.17.0+

### Breaking Changes
- **None** - This version is fully backward compatible

### New Features
- **Execution Timeout**: Configurable timeout with automatic process termination
- **Complete Execution Isolation**: Dedicated temporary directories with full cleanup
- **Enhanced Cleanup**: Zero traces left on server after execution

### What to Update

#### 1. Configure Execution Timeout
- **Default**: 10 minutes (range: 1-1440 minutes)
- **Purpose**: Prevents infinite loops and runaway scripts
- **Recommendation**: Set appropriate timeout for your workloads

#### 2. Review Cleanup Behavior
- **New**: Each execution runs in dedicated temporary directory
- **New**: Complete cleanup after execution (success or failure)
- **Benefit**: Zero traces left on server

#### 3. Test Long-Running Scripts
- Scripts that run for extended periods
- Scripts that might timeout
- Adjust timeout settings if needed

### Migration Steps

1. **Update Package**: Install v1.17.0+ in n8n
2. **Configure Timeout**: Set appropriate execution timeout
3. **Test Scripts**: Run long-running scripts to verify timeout behavior
4. **Monitor Cleanup**: Verify temporary files are cleaned up properly
5. **Adjust Settings**: Fine-tune timeout settings based on needs

## Migrating to v1.16.0+

### Breaking Changes
- **Dual Outputs**: Node now has two outputs instead of one

### What Changed
- **Output 1 (Success)**: Routes data when `exitCode = 0`
- **Output 2 (Error)**: Routes data when `exitCode ≠ 0`
- **Automatic Routing**: No need to check `exitCode` in subsequent nodes

### Migration Steps

#### 1. Update Workflow Connections
- **Before**: Single output connection
- **After**: Connect to appropriate output (Success or Error)
- **Benefit**: Automatic routing based on execution result

#### 2. Remove Exit Code Checks
- **Before**: Check `exitCode` in subsequent nodes
- **After**: Use output routing instead
- **Benefit**: Cleaner workflow logic

#### 3. Update Workflow Logic
- Remove conditional logic based on `exitCode`
- Use output routing for success/error handling
- Simplify workflow design

### Example Migration

#### Before (v1.15.x)
```
Python Function → IF Node (check exitCode) → Success Path
                              → Error Path
```

#### After (v1.16.0+)
```
Python Function → Output 1 (Success) → Success Path
                → Output 2 (Error)   → Error Path
```

## General Migration Best Practices

### Before Updating
1. **Backup Workflows**: Export workflows before updating
2. **Test Environment**: Test updates in development environment first
3. **Document Current Settings**: Record current configuration
4. **Review Changelog**: Read changelog for breaking changes

### During Update
1. **Update Package**: Install new version in n8n
2. **Review Settings**: Check if any settings need updating
3. **Test Workflows**: Run existing workflows
4. **Monitor Performance**: Watch for any issues

### After Update
1. **Verify Functionality**: Ensure all features work as expected
2. **Update Documentation**: Update team documentation
3. **Train Team**: Train team on new features
4. **Monitor Usage**: Monitor usage of new features

### Rollback Plan
1. **Keep Old Version**: Keep previous version available
2. **Document Rollback**: Document rollback procedure
3. **Test Rollback**: Test rollback procedure
4. **Prepare Team**: Prepare team for potential rollback

## Getting Help

### Resources
- **[Quick Reference](QUICK_REFERENCE.md)** - Fast parameter lookup
- **[Resource Limits Guide](guides/resource-limits.md)** - Memory and CPU limits
- **[Full Debug+ Guide](guides/full-debug-plus.md)** - Comprehensive diagnostics
- **[Debugging Guide](guides/debugging.md)** - General debugging and troubleshooting

### Support
- **GitHub Issues**: Report issues and get help
- **Documentation**: Comprehensive guides for all features
- **Community**: Check existing issues and solutions

## Version Compatibility Matrix

| Feature | v1.16.0+ | v1.17.0+ | v1.19.0+ | v1.20.0+ | v1.24.0+ |
|---------|----------|----------|----------|----------|----------|
| Dual Outputs | ✅ | ✅ | ✅ | ✅ | ✅ |
| Execution Timeout | ❌ | ✅ | ✅ | ✅ | ✅ |
| Full Debug+ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Simplified Debug Modes | ❌ | ❌ | ❌ | ✅ | ✅ |
| Resource Limits | ❌ | ❌ | ❌ | ❌ | ✅ |

## Related Documentation

- **[Quick Reference](QUICK_REFERENCE.md)** - Fast parameter lookup
- **[Resource Limits Guide](guides/resource-limits.md)** - Memory and CPU limits configuration
- **[Full Debug+ Guide](guides/full-debug-plus.md)** - Comprehensive developer diagnostics
- **[Debugging Guide](guides/debugging.md)** - General debugging and troubleshooting
