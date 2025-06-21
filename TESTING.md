# Dataweave CLI Testing Guide

This document provides comprehensive testing strategies for the Dataweave CLI, covering unit tests, integration tests, manual testing, and CI/CD validation.

## 🚀 Quick Start Testing

### 1. Install Test Dependencies
```bash
npm install
```

### 2. Run All Tests
```bash
# Automated test runner (recommended)
./test-runner.sh

# Or run individual test suites
npm test                    # All tests
npm run test:unit          # Unit tests only  
npm run test:integration   # Integration tests only
npm run test:coverage      # With coverage report
```

### 3. Manual Testing
```bash
# Quick manual validation
npm run dev -- init test-project
cd test-project
npm run dev -- dbt:model:new test_model
npm run dev -- dagster:asset:new test_asset
```

## 🧪 Test Architecture

### Test Structure
```
tests/
├── setup.ts                  # Test environment setup
├── scaffolding.test.ts       # Project scaffolding tests
├── dbt.test.ts              # DBT manager tests
├── dagster.test.ts          # Dagster manager tests  
├── ai.test.ts               # AI engine tests
└── cli.integration.test.ts   # End-to-end CLI tests
```

### Test Categories

#### 1. **Unit Tests** (`*.test.ts`)
- Test individual components in isolation
- Fast execution (< 5 seconds total)
- No external dependencies
- High code coverage target (>90%)

#### 2. **Integration Tests** (`*.integration.test.ts`)
- Test CLI commands end-to-end
- File system operations
- Command argument parsing
- Error handling workflows

#### 3. **Manual Tests** (`test-manual.md`)
- Human-driven testing scenarios
- Real database connections
- External tool integration
- User experience validation

## 🔧 Testing Tools & Framework

### Core Testing Stack
- **Vitest**: Modern test runner with TypeScript support
- **Node.js**: Native testing environment
- **Temporary Directories**: Isolated test environments
- **Mock Providers**: AI/LLM testing without API calls

### Coverage Tools
- **V8 Coverage**: Built-in code coverage
- **HTML Reports**: Visual coverage analysis
- **Codecov**: CI/CD coverage tracking

## 📝 Test Scenarios

### Core Functionality Tests

#### Project Initialization
```bash
# Test basic project creation
npm run dev -- init my-project

# Test with options
npm run dev -- init my-project --no-dbt --no-dagster

# Test error handling
npm run dev -- init existing-project  # Should fail
```

#### DBT Integration
```bash
# Model generation
npm run dev -- dbt:model:new user_metrics --materialized table

# AI-powered generation
npm run dev -- ai:generate:dbt "Calculate monthly active users"

# With custom SQL
npm run dev -- dbt:model:new custom --sql "select * from users"
```

#### Dagster Integration
```bash
# Asset creation
npm run dev -- dagster:asset:new data_processor --deps "raw_data"

# Job creation
npm run dev -- dagster:job:new etl_pipeline --assets "asset1,asset2"

# DBT integration
npm run dev -- dagster:dbt:asset stg_users
```

#### AI Features
```bash
# Code generation
npm run dev -- ai:generate:dbt "User cohort analysis model"
npm run dev -- ai:generate:dagster "Process CSV files"

# Code analysis
npm run dev -- ai:explain data/dbt/models/staging/stg_users.sql
npm run dev -- ai:optimize data/dbt/models/marts/fct_orders.sql

# Documentation
npm run dev -- ai:document user_metrics
```

### Error Handling Tests

#### Invalid Commands
```bash
# Test graceful error handling
npm run dev -- invalid-command
npm run dev -- dbt:model:new  # Missing required argument
npm run dev -- ai:explain non-existent-file.sql
```

#### Configuration Validation
```bash
# Test outside dataweave project
cd /tmp && npm run dev -- dbt:model:new test  # Should fail

# Test corrupted config
echo '{"invalid": json}' > .dataweave/config.json
npm run dev -- dbt:model:new test  # Should show clear error
```

### Performance Tests

#### Speed Benchmarks
```bash
# Project initialization should complete in < 10 seconds
time npm run dev -- init speed-test

# Model generation should complete in < 3 seconds  
time npm run dev -- dbt:model:new speed_model
```

#### Memory Usage
```bash
# Monitor memory during large project generation
/usr/bin/time -v npm run dev -- init large-project
```

### Security Tests

#### Input Validation
```bash
# Test SQL injection protection
npm run dev -- dbt:model:new "'; DROP TABLE users; --"

# Test path traversal protection  
npm run dev -- dbt:model:new "../../../etc/passwd"
```

#### Dependency Security
```bash
# Check for vulnerabilities
npm audit
npm audit --audit-level moderate
```

## 🔄 Continuous Integration

### GitHub Actions Workflow
The CI pipeline runs on every push and pull request:

1. **Multi-Node Testing**: Tests on Node.js 16, 18, and 20
2. **Type Checking**: Validates TypeScript compilation
3. **Linting**: Code quality and style checks
4. **Unit Tests**: Component isolation tests
5. **Integration Tests**: End-to-end CLI validation
6. **Coverage Reports**: Automated coverage tracking
7. **Security Audit**: Dependency vulnerability scanning
8. **Package Testing**: Installation and global CLI testing

### Local CI Simulation
```bash
# Run the same checks as CI
npm run typecheck
npm run lint  
npm run build
npm run test:coverage
npm audit

# Test package installation
npm pack
npm install -g dataweave-*.tgz
dataweave --version
```

## 📊 Test Data & Fixtures

### Test Project Templates
The test suite uses predefined project structures:

- **Minimal Project**: Basic structure only
- **Full Project**: All features enabled
- **DBT-Only Project**: DBT without Dagster
- **Custom Project**: User-defined configurations

### Mock Data
- **AI Responses**: Predefined SQL and Python code samples
- **Database Schemas**: Test table definitions
- **Configuration Files**: Valid and invalid config examples

## 🐛 Debugging Tests

### Common Issues

#### Test Timeouts
```bash
# Increase timeout for slow operations
npm run test -- --testTimeout=60000
```

#### File Permissions
```bash
# Fix permission issues on test files
chmod -R 755 tests/
```

#### Port Conflicts
```bash
# Kill processes using test ports
lsof -ti:3000 | xargs kill -9
```

### Debug Mode
```bash
# Run tests with verbose output
npm run test -- --reporter=verbose

# Debug specific test file
npm run test -- tests/dbt.test.ts --reporter=verbose

# Run single test
npm run test -- --grep "should create basic DBT model"
```

### Test Environment Variables
```bash
# Enable debug logging
DEBUG=dataweave:* npm run test

# Skip slow tests
SKIP_SLOW_TESTS=true npm run test

# Use custom test directory
TEST_DIR=/tmp/dataweave-tests npm run test
```

## 📈 Coverage Reports

### Generating Coverage
```bash
# HTML coverage report
npm run test:coverage
open coverage/index.html

# Terminal coverage summary
npm run test:coverage -- --reporter=text
```

### Coverage Targets
- **Overall Coverage**: > 85%
- **Function Coverage**: > 90%
- **Branch Coverage**: > 80%
- **Statement Coverage**: > 85%

### Coverage Exclusions
- External dependencies
- Generated files (`dist/`)
- Test files themselves
- Configuration files

## 🔧 Advanced Testing

### Database Integration Testing
```bash
# Start test PostgreSQL
docker run --name test-postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres

# Run tests with real database
DATABASE_URL=postgresql://postgres:password@localhost:5432/test npm run test
```

### Load Testing
```bash
# Generate many models quickly
for i in {1..100}; do
  npm run dev -- dbt:model:new model_$i --description "Load test model $i"
done

# Measure performance
time npm run dev -- init large-project
```

### Cross-Platform Testing
```bash
# Test on different operating systems
# Windows (PowerShell)
npm run test

# macOS/Linux (Bash)
npm run test

# Docker container
docker run --rm -v $(pwd):/app -w /app node:20 npm test
```

## 📚 Best Practices

### Writing Tests
1. **Isolation**: Each test should be independent
2. **Cleanup**: Always clean up test artifacts
3. **Descriptive Names**: Test names should explain the scenario
4. **Arrange-Act-Assert**: Clear test structure
5. **Edge Cases**: Test error conditions and boundaries

### Maintaining Tests
1. **Regular Updates**: Keep tests current with features
2. **Performance Monitoring**: Track test execution time
3. **Flaky Test Detection**: Identify and fix unstable tests
4. **Coverage Gaps**: Address uncovered code paths

### CI/CD Integration
1. **Fast Feedback**: Prioritize quick test execution
2. **Comprehensive Coverage**: Balance speed vs. thoroughness
3. **Clear Reporting**: Provide actionable test results
4. **Failure Investigation**: Make failures easy to debug

## 🆘 Troubleshooting

### Common Test Failures

#### "No dataweave project found"
```bash
# Ensure test is running in project directory
cd test-project
npm run dev -- dbt:model:new test_model
```

#### "Command not found"
```bash
# Ensure TypeScript is compiled
npm run build

# Use development mode for testing
npm run dev -- command
```

#### "Permission denied"
```bash
# Fix script permissions
chmod +x test-runner.sh

# Fix test file permissions
chmod -R 755 tests/
```

### Getting Help
- Check test logs for detailed error messages
- Run tests with `--verbose` flag for more output
- Use `npm run dev -- command --help` for command usage
- Review test files for expected behavior examples

## 🎯 Test Strategy Summary

| Test Type | Purpose | Speed | Coverage | Automation |
|-----------|---------|--------|----------|------------|
| Unit | Component validation | Fast | High | Full |
| Integration | CLI workflow testing | Medium | Medium | Full |
| Manual | User experience | Slow | Low | Partial |
| Performance | Speed benchmarks | Medium | Low | Full |
| Security | Vulnerability scanning | Fast | Medium | Full |

The comprehensive testing strategy ensures reliable, secure, and performant CLI functionality across all supported environments and use cases.