# Publishing Instructions for n8n-nodes-python-raw

## Pre-publication Setup

### 1. Update package.json
Replace in `package.json`:
- `@your-npm-username` with your real npm username
- `your.email@example.com` with your email
- `Your Name` with your name
- Repository URLs with your real ones

### 2. Create GitHub Repository
1. Create a new repository on GitHub (e.g.: `n8n-nodes-python-fork`)
2. Initialize git and add remote:
   ```bash
   git init
   git add .
   git commit -m "Initial fork with raw execution functionality"
   git branch -M main
   git remote add origin https://github.com/your-username/n8n-nodes-python-fork.git
   git push -u origin main
   ```

### 3. Check Build
```bash
npm run build
```

### 4. Test Locally
```bash
npm test
```

## Publishing to npm

### 1. Login to npm
```bash
npm login
```

### 2. Verify Everything is Ready
```bash
npm run build
npm pack --dry-run
```

### 3. Publish
```bash
npm publish --access public
```

## After Publishing

### Update README.md
Replace all `@your-npm-username/n8n-nodes-python-raw` in README.md with the real package name.

### Create Releases
In GitHub, create a release with version 1.0.0 and description of changes.

## Installation in n8n

### Via npm (global n8n installation)
```bash
npm install -g @your-real-username/n8n-nodes-python-raw
```

### Via Docker
```dockerfile
FROM n8nio/n8n:latest
USER root
RUN cd /usr/local/lib/node_modules/n8n && npm install @your-real-username/n8n-nodes-python-raw
USER node
```

### Local Installation
```bash
cd ~/.n8n/nodes
npm install @your-real-username/n8n-nodes-python-raw
```

## Testing the Installation

1. Restart n8n
2. In the workflow editor, find the "Python Function (Raw)" node
3. Add it to the workflow
4. Configure Python code and test

## Node Output Structure

The node returns one item with data:
```json
{
  "exitCode": 0,
  "stdout": "all output from print()",
  "stderr": "errors and warnings", 
  "success": true,
  "error": null,
  "inputItemsCount": 3,
  "executedAt": "2024-01-01T12:00:00.000Z"
}
```

## Licensing Requirements

- ✅ Original LICENSE.md preserved
- ✅ NOTICE.md created with description of changes  
- ✅ Original authorship specified in package.json
- ✅ Apache 2.0 + Commons Clause requirements met

## Support

- Create issues in your GitHub repository
- Update documentation when adding new features
- Monitor compatibility with new n8n versions 