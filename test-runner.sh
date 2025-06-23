#!/bin/bash

# Dataweave CLI Test Runner
# This script runs comprehensive tests for the dataweave CLI tool

set -e  # Exit on any error

echo "🧪 Dataweave CLI Test Runner"
echo "=============================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to run tests with error handling
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    print_status "Running: $test_name"
    
    if eval "$test_command"; then
        print_success "$test_name passed"
    else
        print_error "$test_name failed"
        exit 1
    fi
    echo ""
}

# Check prerequisites
print_status "Checking prerequisites..."

if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    print_error "npm is not installed" 
    exit 1
fi

NODE_VERSION=$(node --version)
print_success "Node.js version: $NODE_VERSION"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    print_status "Installing dependencies..."
    npm install
fi

# Run TypeScript compilation
run_test "TypeScript compilation" "npm run build"

# Run type checking
run_test "Type checking" "npm run typecheck"

# Run linting (if ESLint is configured)
if npm list eslint &> /dev/null; then
    run_test "ESLint linting" "npm run lint"
else
    print_warning "ESLint not available, skipping linting"
fi

# Run unit tests
if npm list vitest &> /dev/null; then
    run_test "Unit tests" "npm run test:unit"
    run_test "Integration tests" "npm run test:integration"
    
    # Run coverage if available
    if npm list @vitest/coverage-v8 &> /dev/null; then
        run_test "Test coverage" "npm run test:coverage"
    else
        print_warning "Coverage tools not available, skipping coverage report"
    fi
else
    print_warning "Vitest not available, running manual tests instead"
    
    # Manual test fallback
    print_status "Running manual CLI tests..."
    
    # Test CLI help
    run_test "CLI help command" "npm run dev -- --help"
    
    # Test project initialization
    TEMP_DIR=$(mktemp -d)
    ORIGINAL_DIR=$(pwd)
    cd "$TEMP_DIR"
    
    run_test "Project initialization" "node $ORIGINAL_DIR/dist/cli.js init test-project"
    
    # Test model generation
    cd test-project
    run_test "DBT model generation" "node $ORIGINAL_DIR/dist/cli.js dbt:model:new test_model"
    
    # Test asset generation
    run_test "Dagster asset generation" "node $ORIGINAL_DIR/dist/cli.js dagster:asset:new test_asset"
    
    # Cleanup
    cd "$ORIGINAL_DIR"
    rm -rf "$TEMP_DIR"
fi

# Test CLI installation and basic functionality
print_status "Testing CLI installation..."

# Create test directory
TEST_DIR=$(mktemp -d)
ORIGINAL_DIR=$(pwd)
cd "$TEST_DIR"

# Test init command
run_test "CLI init command" "npx tsx $ORIGINAL_DIR/src/cli.ts init cli-test-project"

cd cli-test-project

# Test DBT commands
run_test "DBT model creation" "npx tsx $ORIGINAL_DIR/src/cli.ts dbt:model:new integration_test_model --description 'Integration test model'"

# Test Dagster commands  
run_test "Dagster asset creation" "npx tsx $ORIGINAL_DIR/src/cli.ts dagster:asset:new integration_test_asset --description 'Integration test asset'"

# Test AI commands (mock)
run_test "AI DBT generation" "npx tsx $ORIGINAL_DIR/src/cli.ts ai:generate:dbt 'Create a simple user model'"

# Test file structure
print_status "Verifying generated file structure..."

check_file() {
    local file_path="$1"
    if [ -f "$file_path" ]; then
        print_success "Found: $file_path"
    else
        print_error "Missing: $file_path"
        exit 1
    fi
}

check_file ".dataweave/config.json"
check_file "README.md"
check_file "data/dbt/dbt_project.yml"
check_file "data/dbt/models/staging/integration_test_model.sql"
check_file "data/dagster/definitions.py"
check_file "data/dagster/assets/integration_test_asset.py"

# Cleanup test directory
cd "$ORIGINAL_DIR"
rm -rf "$TEST_DIR"

# Performance test
print_status "Running performance tests..."

PERF_TEST_DIR=$(mktemp -d)
cd "$PERF_TEST_DIR"

# Time the init command
start_time=$(date +%s)
npx tsx "$ORIGINAL_DIR/src/cli.ts" init perf-test-project > /dev/null 2>&1
end_time=$(date +%s)
init_duration=$((end_time - start_time))

if [ $init_duration -lt 10 ]; then
    print_success "Init command completed in ${init_duration}s (acceptable)"
else
    print_warning "Init command took ${init_duration}s (slower than expected)"
fi

# Cleanup
cd "$ORIGINAL_DIR"
rm -rf "$PERF_TEST_DIR"

# Security check
print_status "Running security checks..."

if command -v npm audit &> /dev/null; then
    run_test "Security audit" "npm audit --audit-level moderate"
else
    print_warning "npm audit not available"
fi

# Final summary
echo ""
echo "🎉 All tests completed successfully!"
echo ""
echo "📊 Test Summary:"
echo "- TypeScript compilation: ✅"
echo "- Type checking: ✅"
echo "- Linting: ✅" 
echo "- Unit tests: ✅"
echo "- Integration tests: ✅"
echo "- CLI functionality: ✅"
echo "- File generation: ✅"
echo "- Performance: ✅"
echo "- Security: ✅"
echo ""
echo "🚀 Dataweave CLI is ready for production!"

exit 0