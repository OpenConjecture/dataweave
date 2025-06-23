# 📦 NPM Publishing Guide for Dataweave CLI

This guide provides comprehensive instructions for publishing the Dataweave CLI to NPM as a global package.

## 🚀 Quick Publishing Checklist

- [ ] Update package.json metadata
- [ ] Verify CLI functionality 
- [ ] Run complete test suite
- [ ] Build production version
- [ ] Update documentation
- [ ] Create NPM account/login
- [ ] Publish to NPM
- [ ] Test global installation
- [ ] Create GitHub release

## 📋 Pre-Publishing Requirements

### 1. NPM Account Setup
```bash
# Create NPM account (if you don't have one)
# Visit: https://www.npmjs.com/signup

# Login to NPM CLI
npm login

# Verify you're logged in
npm whoami
```

### 2. Package Metadata Update

Update `package.json` with your information:

```json
{
  "name": "dataweave",
  "version": "1.0.0",
  "author": "Your Name <your.email@example.com>",
  "homepage": "https://github.com/yourusername/dataweave#readme",
  "repository": {
    "type": "git", 
    "url": "git+https://github.com/yourusername/dataweave.git"
  },
  "bugs": {
    "url": "https://github.com/yourusername/dataweave/issues"
  }
}
```

**Important**: Replace `yourusername` with your actual GitHub username and update author information.

## 🔧 Pre-Flight Verification

### 1. Test CLI Functionality
```bash
# Build the project
npm run build

# Test CLI locally
npm run dev -- --help
npm run dev -- init test-project

# Run complete test suite
npm test

# Run comprehensive test runner
./test-runner.sh
```

### 2. Verify Package Contents
```bash
# See what will be published
npm pack --dry-run

# Create a test package (optional)
npm pack
```

The package should include:
- `dist/` - Compiled JavaScript
- `README.md` - Documentation
- `LICENSE` - MIT license
- `package.json` - Package metadata

### 3. Test Local Installation
```bash
# Create a test package
npm pack

# Install globally from local package
npm install -g dataweave-1.0.0.tgz

# Test global installation
dataweave --help
dataweave init test-global

# Uninstall test version
npm uninstall -g dataweave
```

## 📤 Publishing Steps

### 1. Final Pre-Publish Checks
```bash
# Ensure you're on the main branch
git checkout main

# Pull latest changes
git pull origin main

# Verify clean working directory
git status

# Run linting and type checking
npm run lint
npm run typecheck

# Run full test suite one final time
npm test
```

### 2. Version Management
```bash
# For initial release (1.0.0 already set)
# For future updates, use semantic versioning:

# Patch release (1.0.1) - bug fixes
npm version patch

# Minor release (1.1.0) - new features
npm version minor

# Major release (2.0.0) - breaking changes
npm version major
```

### 3. Publish to NPM
```bash
# Publish the package
npm publish

# For scoped packages (if needed)
npm publish --access public
```

### 4. Verify Publication
```bash
# Check package on NPM
npm view dataweave

# Install globally to test
npm install -g dataweave

# Test functionality
dataweave --version
dataweave --help
dataweave init test-published-cli

# Test all major commands
dataweave init test-project
cd test-project
dataweave dbt:model:new test_model
dataweave dagster:asset:new test_asset
dataweave ai:generate:dbt "test AI generation"
```

## 🔄 Post-Publishing Steps

### 1. Create GitHub Release
```bash
# Tag the release
git tag v1.0.0
git push origin v1.0.0

# Or create release through GitHub UI
# Go to: https://github.com/yourusername/dataweave/releases/new
```

### 2. Update Documentation
- Update README badges with correct NPM package link
- Create changelog entry
- Update any documentation links

### 3. Share and Promote
- Announce on social media
- Share in relevant communities
- Update project documentation
- Create example projects

## 🛠️ Advanced Publishing Options

### Beta/Preview Releases
```bash
# Publish as beta
npm version prerelease --preid=beta
npm publish --tag beta

# Users install with:
npm install -g dataweave@beta
```

### Scoped Packages
If `dataweave` name is taken, use a scoped package:

```json
{
  "name": "@yourusername/dataweave"
}
```

```bash
# Publish scoped package
npm publish --access public

# Users install with:
npm install -g @yourusername/dataweave
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Package Name Already Exists
```bash
# Check name availability
npm view dataweave

# Solutions:
# - Use scoped package: @yourusername/dataweave
# - Choose different name: dataweave-cli, data-weave, etc.
# - Contact current owner if inactive
```

#### 2. Permission Errors
```bash
# Verify NPM login
npm whoami

# Re-login if needed
npm logout
npm login
```

#### 3. Build Failures
```bash
# Clean and rebuild
rm -rf dist/ node_modules/
npm install
npm run build
```

#### 4. Test Failures
```bash
# Run specific test suites
npm run test:unit
npm run test:integration

# Debug failing tests
npx vitest run --reporter=verbose
```

## 📊 Post-Launch Monitoring

### 1. NPM Analytics
```bash
# View download stats
npm view dataweave

# Check weekly downloads
npm view dataweave downloads
```

### 2. Usage Monitoring
Monitor:
- GitHub Issues for bug reports
- NPM download statistics
- Community feedback
- Performance metrics

### 3. Maintenance Schedule
- **Weekly**: Monitor issues and downloads
- **Monthly**: Update dependencies
- **Quarterly**: Major feature releases
- **As needed**: Security updates and bug fixes

## 🔄 Updating the Package

### For Future Releases
```bash
# 1. Update code and tests
# 2. Update version
npm version [patch|minor|major]

# 3. Update changelog
# 4. Commit changes
git add .
git commit -m "Release v1.0.1"

# 5. Publish
npm publish

# 6. Create GitHub release
git tag v1.0.1
git push origin v1.0.1
```

## 📝 Release Checklist Template

For future releases, use this checklist:

### Pre-Release
- [ ] All tests passing
- [ ] Documentation updated
- [ ] Changelog updated
- [ ] Version bumped appropriately
- [ ] Breaking changes documented

### Release
- [ ] Published to NPM
- [ ] GitHub release created
- [ ] Installation tested globally
- [ ] Core functionality verified

### Post-Release
- [ ] Community notified
- [ ] Documentation sites updated
- [ ] Examples/tutorials updated
- [ ] Monitor for issues

## 🎯 Success Metrics

Track these metrics for package success:
- **Weekly downloads** from NPM
- **GitHub stars** and issues
- **Community adoption** and feedback
- **Documentation page views**
- **Time to resolve issues**

---

## 🚀 Ready to Publish?

Once you've completed all steps:

1. **Update package.json metadata** with your information
2. **Run the complete test suite**: `npm test && ./test-runner.sh`
3. **Build production version**: `npm run build`
4. **Publish to NPM**: `npm publish`
5. **Test global installation**: `npm install -g dataweave`
6. **Create GitHub release**: Tag and document the release

Your AI-assisted data pipeline CLI is ready to help developers worldwide build modern data workflows! 🌊