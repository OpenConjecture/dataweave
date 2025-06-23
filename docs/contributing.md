# 🤝 Contributing to Dataweave

Thank you for your interest in contributing to Dataweave! This guide will help you get started with development, understand our processes, and make meaningful contributions to the project.

## 📋 Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Architecture Overview](#architecture-overview)
- [Development Workflow](#development-workflow)
- [Code Standards](#code-standards)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)
- [Submitting Changes](#submitting-changes)
- [Release Process](#release-process)
- [Community Guidelines](#community-guidelines)

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:
- **Node.js** (version 16.0.0 or higher)
- **npm** or **yarn** package manager
- **Git** for version control
- **VSCode** (recommended) with extensions:
  - TypeScript Hero
  - ESLint
  - Prettier
  - GitLens

### Quick Start

```bash
# Fork and clone the repository
git clone https://github.com/yourusername/dataweave.git
cd dataweave

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Start development
npm run dev -- --help
```

## 🛠️ Development Setup

### 1. Fork and Clone
```bash
# Fork the repository on GitHub
# Then clone your fork
git clone https://github.com/yourusername/dataweave.git
cd dataweave

# Add upstream remote
git remote add upstream https://github.com/openconjecture/dataweave.git
```

### 2. Install Dependencies
```bash
# Install Node.js dependencies
npm install

# Verify installation
npm run typecheck
npm run lint
npm test
```

### 3. Development Environment
```bash
# Create development branch
git checkout -b feature/your-feature-name

# Start development mode
npm run dev -- init test-project

# Run tests continuously
npm run test:watch
```

### 4. IDE Configuration

#### VSCode Settings (`.vscode/settings.json`)
```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "eslint.autoFixOnSave": true,
  "files.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/.DS_Store": true
  }
}
```

#### Recommended Extensions
- **TypeScript Hero**: Import organization
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **GitLens**: Git integration
- **Thunder Client**: API testing

## 🏗️ Architecture Overview

### Project Structure
```
dataweave/
├── src/                    # Source code
│   ├── cli.ts             # Main CLI entry point
│   ├── scaffolding/       # Project scaffolding engine
│   ├── dbt/               # DBT integration
│   ├── dagster/           # Dagster integration
│   ├── ai/                # AI/LLM integration
│   └── utils/             # Shared utilities
├── tests/                 # Test files
├── docs/                  # Documentation
├── dist/                  # Compiled JavaScript
└── examples/              # Example projects
```

### Core Components

#### 1. CLI Interface (`src/cli.ts`)
- Command registration and parsing
- Global error handling
- User interface (progress bars, styling)
- Command routing and execution

#### 2. Project Scaffolding (`src/scaffolding/`)
- Template-based project generation
- Configuration file creation
- Directory structure setup
- Initial file content generation

#### 3. DBT Integration (`src/dbt/`)
- Model generation and management
- SQL template processing
- Schema.yml management
- DBT command execution

#### 4. Dagster Integration (`src/dagster/`)
- Asset creation and management
- Job definition generation
- Python code templating
- Pipeline validation

#### 5. AI Engine (`src/ai/`)
- LLM provider abstraction
- Prompt engineering
- Code generation and analysis
- Response parsing and validation

### Design Principles

1. **Modularity**: Each component should be independently testable
2. **Extensibility**: Easy to add new integrations and features
3. **Type Safety**: Comprehensive TypeScript coverage
4. **Error Handling**: Graceful failure with helpful messages
5. **Performance**: Fast execution and minimal resource usage

## 🔄 Development Workflow

### 1. Planning
- **Create Issue**: Describe the feature/bug with clear requirements
- **Design Discussion**: Discuss approach in issue comments
- **Break Down**: Split large features into smaller tasks

### 2. Implementation
- **Branch Creation**: Use descriptive branch names
- **Incremental Development**: Make small, focused commits
- **Testing**: Write tests alongside implementation
- **Documentation**: Update docs as you develop

### 3. Review Process
- **Self Review**: Test thoroughly before submitting
- **Pull Request**: Create PR with detailed description
- **Code Review**: Address feedback constructively
- **Integration**: Ensure CI passes before merge

### Branch Naming Conventions
```bash
# Feature branches
feature/ai-code-optimization
feature/supabase-integration

# Bug fixes
fix/model-generation-error
fix/memory-leak-dagster

# Documentation
docs/api-reference-update
docs/contributing-guide

# Refactoring
refactor/dbt-manager-cleanup
refactor/error-handling
```

### Commit Message Format
```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Test changes
- `chore`: Build process or auxiliary tool changes

**Examples:**
```bash
feat(ai): add code optimization suggestions
fix(dbt): resolve model generation path issues
docs(api): update command reference
refactor(cli): improve error handling consistency
```

## 📏 Code Standards

### TypeScript Guidelines

#### 1. Type Definitions
```typescript
// Use interfaces for object shapes
interface DbtModelOptions {
  name: string;
  sql?: string;
  description?: string;
  materializedAs?: 'view' | 'table' | 'incremental';
  tags?: string[];
}

// Use type aliases for unions and primitives
type AIProvider = 'openai' | 'anthropic' | 'local';
type LogLevel = 'debug' | 'info' | 'warn' | 'error';
```

#### 2. Function Signatures
```typescript
// Clear parameter types and return types
async function generateDbtModel(
  options: DbtModelOptions
): Promise<{ success: boolean; filePath: string }> {
  // Implementation
}

// Use optional parameters appropriately
function createAsset(
  name: string,
  description?: string,
  dependencies: string[] = []
): Promise<void> {
  // Implementation
}
```

#### 3. Error Handling
```typescript
// Custom error classes
class DataweaveError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'DataweaveError';
  }
}

// Consistent error handling
try {
  await riskyOperation();
} catch (error) {
  throw new DataweaveError(
    'Operation failed',
    'OPERATION_FAILED',
    { originalError: error }
  );
}
```

### Coding Style

#### 1. Naming Conventions
```typescript
// Variables and functions: camelCase
const projectName = 'my-project';
const generateModel = () => {};

// Classes: PascalCase
class DbtManager {}
class ProjectScaffolder {}

// Constants: SCREAMING_SNAKE_CASE
const DEFAULT_PORT = 3000;
const MAX_RETRY_ATTEMPTS = 3;

// Files: kebab-case
// dbt-manager.ts, project-scaffolder.ts
```

#### 2. Import Organization
```typescript
// 1. Node.js built-in modules
import { join, resolve } from 'path';
import { readFile, writeFile } from 'fs/promises';

// 2. Third-party modules
import chalk from 'chalk';
import ora from 'ora';
import { Command } from 'commander';

// 3. Internal modules (relative imports)
import { DbtManager } from './dbt';
import { ProjectScaffolder } from './scaffolding';
import { AIEngine } from './ai';
```

#### 3. Code Organization
```typescript
// Group related functionality
export class DbtManager {
  // 1. Properties
  private projectPath: string;
  private modelsDir: string;

  // 2. Constructor
  constructor(options: DbtManagerOptions) {
    this.projectPath = options.projectPath;
    this.modelsDir = options.modelsDir;
  }

  // 3. Public methods
  async generateModel(options: DbtModelOptions): Promise<void> {
    // Implementation
  }

  // 4. Private methods
  private getModelPath(name: string): string {
    // Implementation
  }
}
```

### Code Quality Tools

#### ESLint Configuration
```javascript
// .eslintrc.js
module.exports = {
  extends: [
    '@typescript-eslint/recommended',
    'prettier'
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/explicit-function-return-type': 'warn',
    'prefer-const': 'error',
    'no-var': 'error'
  }
};
```

#### Prettier Configuration
```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
```

## 🧪 Testing Guidelines

### Test Structure
```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DbtManager } from '../src/dbt';

describe('DbtManager', () => {
  let manager: DbtManager;
  let tempDir: string;

  beforeEach(async () => {
    // Setup test environment
    tempDir = await createTempDir();
    manager = new DbtManager({ projectPath: tempDir });
  });

  afterEach(async () => {
    // Cleanup
    await removeTempDir(tempDir);
  });

  describe('generateModel', () => {
    it('should create basic DBT model', async () => {
      // Arrange
      const options = { name: 'test_model' };

      // Act
      await manager.generateModel(options);

      // Assert
      const modelPath = join(tempDir, 'models', 'staging', 'test_model.sql');
      expect(await fileExists(modelPath)).toBe(true);
    });

    it('should handle invalid model names', async () => {
      // Arrange
      const options = { name: 'invalid-model-name!' };

      // Act & Assert
      await expect(manager.generateModel(options))
        .rejects
        .toThrow('Invalid model name');
    });
  });
});
```

### Testing Best Practices

1. **Isolation**: Each test should be independent
2. **Descriptive Names**: Test names should explain the scenario
3. **AAA Pattern**: Arrange, Act, Assert
4. **Edge Cases**: Test error conditions and boundaries
5. **Mocking**: Mock external dependencies appropriately

### Test Coverage Goals
- **Overall Coverage**: > 85%
- **Function Coverage**: > 90%
- **Branch Coverage**: > 80%
- **Statement Coverage**: > 85%

## 📚 Documentation

### Code Documentation
```typescript
/**
 * Generates a new DBT model with intelligent directory placement
 * @param options - Model generation options
 * @returns Promise resolving to generation result
 * @throws DataweaveError when model creation fails
 * @example
 * ```typescript
 * await manager.generateModel({
 *   name: 'user_metrics',
 *   materializedAs: 'table',
 *   description: 'User engagement metrics'
 * });
 * ```
 */
async generateModel(options: DbtModelOptions): Promise<GenerationResult> {
  // Implementation
}
```

### Documentation Types

1. **API Reference**: Complete command documentation
2. **Getting Started**: Setup and basic usage
3. **Examples**: Real-world use cases
4. **Architecture**: Technical design decisions
5. **Contributing**: Development guidelines (this document)

### Documentation Standards
- Use clear, concise language
- Include practical examples
- Keep information up-to-date
- Cross-reference related sections
- Use consistent formatting

## 📤 Submitting Changes

### Pull Request Process

1. **Create Pull Request**
   ```bash
   # Push your branch
   git push origin feature/your-feature

   # Create pull request on GitHub
   # Use the PR template
   ```

2. **PR Description Template**
   ```markdown
   ## Summary
   Brief description of changes

   ## Changes Made
   - Feature/fix 1
   - Feature/fix 2

   ## Testing
   - [ ] Unit tests pass
   - [ ] Integration tests pass
   - [ ] Manual testing completed

   ## Documentation
   - [ ] Updated relevant documentation
   - [ ] Added code comments where needed

   ## Breaking Changes
   List any breaking changes

   ## Screenshots (if applicable)
   Add screenshots for UI changes
   ```

3. **Review Process**
   - Automated checks must pass
   - At least one maintainer review required
   - Address feedback promptly
   - Squash commits if requested

### PR Requirements Checklist
- [ ] Tests added/updated for new functionality
- [ ] Documentation updated
- [ ] Code follows style guidelines
- [ ] No breaking changes (or properly documented)
- [ ] CI checks pass
- [ ] Self-review completed

## 🚀 Release Process

### Versioning Strategy
We follow [Semantic Versioning](https://semver.org/):
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Steps
1. **Version Bump**
   ```bash
   npm version [patch|minor|major]
   ```

2. **Update Changelog**
   - Document all changes
   - Categorize by type (Features, Fixes, Breaking Changes)
   - Include migration guide for breaking changes

3. **Create Release**
   ```bash
   git tag v1.2.3
   git push origin v1.2.3
   ```

4. **Publish to NPM**
   ```bash
   npm publish
   ```

5. **GitHub Release**
   - Create release on GitHub
   - Include changelog
   - Attach binaries if needed

### Release Types

#### Major Release (1.0.0 → 2.0.0)
- Breaking API changes
- Major feature additions
- Architecture changes
- Migration guide required

#### Minor Release (1.0.0 → 1.1.0)
- New features
- Enhanced functionality
- Backward compatible changes
- No breaking changes

#### Patch Release (1.0.0 → 1.0.1)
- Bug fixes
- Security patches
- Performance improvements
- Documentation updates

## 🌟 Community Guidelines

### Code of Conduct

We are committed to providing a welcoming and inclusive environment. Please:
- Be respectful and considerate
- Use inclusive language
- Accept constructive feedback gracefully
- Focus on what's best for the community
- Show empathy towards other contributors

### Communication Channels

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and ideas
- **Pull Requests**: Code review and collaboration
- **Email**: security@openconjecture.com for security issues

### Getting Help

1. **Documentation**: Check existing docs first
2. **Search Issues**: Your question may already be answered
3. **Create Issue**: Use appropriate templates
4. **Discussion**: For general questions and ideas

### Recognition

Contributors are recognized through:
- Contributor list in README
- Release notes mentions
- GitHub contributor graphs
- Community highlights

## 🎯 Contribution Areas

### Priority Areas
1. **Core Features**: CLI commands and functionality
2. **Integrations**: DBT, Dagster, Supabase improvements
3. **AI Features**: Code generation and analysis
4. **Testing**: Comprehensive test coverage
5. **Documentation**: User guides and examples

### Good First Issues
Look for issues labeled:
- `good first issue`: Perfect for newcomers
- `help wanted`: Community assistance needed
- `documentation`: Docs improvements
- `tests`: Testing enhancements

### Advanced Contributions
- New integrations (Airflow, Snowflake, etc.)
- Performance optimizations
- Architecture improvements
- Security enhancements

## 🙏 Thank You

Thank you for contributing to Dataweave! Your contributions help make modern data pipeline development more accessible and efficient for everyone.

Questions? Feel free to reach out through GitHub issues or discussions. We're here to help and excited to see what you'll build! 🌊