# Documentation Index

Welcome to the n8n-nodes-python-raw documentation! This directory contains comprehensive guides for using and developing with the Python Function node.

## 📚 User Guides

### Core Features
- **[Resource Limits Guide](guides/resource-limits.md)** - Memory and CPU limits configuration (v1.24.0+)
- **[Full Debug+ Guide](guides/full-debug-plus.md)** - Comprehensive developer diagnostics (v1.19.0+)
- **[Dual Outputs Guide](guides/dual-outputs.md)** - Understanding the dual output architecture (v1.16.0+)
- **[Timeout and Cleanup Guide](guides/timeout-and-cleanup.md)** - Execution timeout and isolation (v1.17.0+)
- **[Output Files Guide](guides/output-files.md)** - Generating and processing files in Python scripts
- **[File Processing Guide](guides/file-processing.md)** - Processing input files from previous nodes
- **[Multiple Credentials Guide](guides/multiple-credentials.md)** - Using multiple Python environment credentials

### Debugging and Troubleshooting
- **[Debugging Guide](guides/debugging.md)** - Comprehensive debugging and troubleshooting guide
- **[Migration Guide](guides/migration.md)** - Upgrading between versions

## 🚀 Quick Reference

- **[Quick Reference](QUICK_REFERENCE.md)** - Fast lookup for parameters, exit codes, and common patterns

## 🛠️ Development Documentation

### Setup and Development
- **[Development Setup](development/setup.md)** - Setting up the development environment
- **[Testing Guide](development/testing.md)** - Running tests and test structure
- **[Publishing Guide](development/publishing.md)** - Publishing the package to npm

## 📁 Archived Documentation

### Historical Reports
- **[Archived Reports](archived/reports/)** - Historical implementation and verification reports
- **[Archived Plans](archived/plans/)** - Historical integration and development plans

## 🚀 Quick Start

1. **New to the node?** Start with the [Main README](../../README.md)
2. **Need resource limits?** Check the [Resource Limits Guide](guides/resource-limits.md)
3. **Need debugging?** Use the [Full Debug+ Guide](guides/full-debug-plus.md)
4. **Need dual outputs?** Check the [Dual Outputs Guide](guides/dual-outputs.md)
5. **Having timeout issues?** See the [Timeout and Cleanup Guide](guides/timeout-and-cleanup.md)
6. **Generating files?** Read the [Output Files Guide](guides/output-files.md)
7. **Need to debug?** Use the [Debugging Guide](guides/debugging.md)
8. **Upgrading versions?** Check the [Migration Guide](guides/migration.md)

## 📖 Documentation Structure

```
docs/
├── QUICK_REFERENCE.md           # Fast parameter lookup
├── guides/                      # User guides for features
│   ├── resource-limits.md       # Memory and CPU limits (v1.24.0+)
│   ├── full-debug-plus.md       # Comprehensive diagnostics (v1.19.0+)
│   ├── dual-outputs.md          # Dual output architecture
│   ├── timeout-and-cleanup.md   # Execution timeout & isolation
│   ├── output-files.md          # File generation & processing
│   ├── file-processing.md       # Input file processing
│   ├── multiple-credentials.md  # Multiple credentials usage
│   ├── debugging.md             # Debugging & troubleshooting
│   └── migration.md             # Version upgrade guide
├── development/                 # Development documentation
│   ├── setup.md                 # Development environment setup
│   ├── testing.md               # Testing guide
│   └── publishing.md            # Publishing guide
└── archived/                    # Historical documentation
    ├── reports/                 # Implementation reports
    └── plans/                   # Development plans
```

## 🔗 Related Links

- **[Main README](../../README.md)** - Project overview and installation
- **[CHANGELOG](../../CHANGELOG.md)** - Version history and changes
- **[GitHub Repository](https://github.com/stttru/n8n-nodes-python-fork)** - Source code
- **[npm Package](https://www.npmjs.com/package/n8n-nodes-python-raw)** - Package installation

## 📝 Contributing

If you find issues with the documentation or want to contribute improvements:

1. Check the [Development Setup](development/setup.md) guide
2. Review the [Testing Guide](development/testing.md)
3. Follow the [Publishing Guide](development/publishing.md) for contributions

## 🆕 Recent Updates

- **v1.24.1**: Fixed IndentationError in default code template
- **v1.24.0**: Added Resource Limits (Memory 64MB-100GB, CPU 1-100% of all cores)
- **v1.23.1**: Fixed Full Debug+ mode for error cases
- **v1.23.0**: Rollback to stable v1.19.4 after stdin experiments
- **v1.20.0**: Simplified debug modes from 5 to 2 modes
- **v1.19.4**: Fixed credential value leak in Full Debug+ diagnostics
- **v1.19.0**: Implemented Full Debug+ comprehensive diagnostics
- **v1.17.0**: Added execution timeout and enhanced cleanup architecture
- **v1.16.0**: Implemented dual outputs for better workflow control

For complete version history, see the [Main README](../../README.md#version-history).
