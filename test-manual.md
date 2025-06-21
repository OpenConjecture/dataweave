# Dataweave CLI Manual Testing Guide

## Quick Start Testing

### 1. Build and Install Locally
```bash
# Build the project
npm run build

# Test global installation (optional)
npm install -g .

# Or use development mode
npm run dev -- --help
```

### 2. Basic Functionality Tests

#### Test Project Initialization
```bash
# Create a new test project
npm run dev -- init my-test-project

# Verify structure was created
ls -la my-test-project/
tree my-test-project/  # if tree is installed

# Check generated files
cat my-test-project/.dataweave/config.json
cat my-test-project/README.md
```

#### Test DBT Model Generation
```bash
cd my-test-project

# Generate a basic model
../node_modules/.bin/tsx ../src/cli.ts dbt:model:new user_analytics \
  --description "User behavior analytics" \
  --materialized table

# Generate with AI (mock)
../node_modules/.bin/tsx ../src/cli.ts ai:generate:dbt "Create a model that summarizes daily user activity"

# Check generated files
cat data/dbt/models/staging/user_analytics.sql
cat data/dbt/models/staging/schema.yml
```

#### Test Dagster Asset Generation
```bash
# Generate a basic asset
../node_modules/.bin/tsx ../src/cli.ts dagster:asset:new user_data_processor \
  --description "Process raw user data" \
  --deps "raw_users,raw_events"

# Generate with AI (mock)
../node_modules/.bin/tsx ../src/cli.ts ai:generate:dagster "Create an asset that joins user and order data"

# Check generated files
cat data/dagster/assets/user_data_processor.py
```

#### Test AI Features
```bash
# Create a sample file to test AI explain/optimize
echo "select * from users where created_at > '2023-01-01'" > sample.sql

# Test AI explanation
../node_modules/.bin/tsx ../src/cli.ts ai:explain sample.sql

# Test AI optimization
../node_modules/.bin/tsx ../src/cli.ts ai:optimize sample.sql

# Test AI documentation
../node_modules/.bin/tsx ../src/cli.ts ai:document user_analytics
```

## 3. Integration Testing Scenarios

### Scenario 1: E-commerce Analytics Pipeline
```bash
# Initialize e-commerce project
npm run dev -- init ecommerce-analytics

cd ecommerce-analytics

# Create staging models
../node_modules/.bin/tsx ../src/cli.ts dbt:model:new stg_customers --materialized view
../node_modules/.bin/tsx ../src/cli.ts dbt:model:new stg_orders --materialized view
../node_modules/.bin/tsx ../src/cli.ts dbt:model:new stg_products --materialized view

# Create marts models
../node_modules/.bin/tsx ../src/cli.ts dbt:model:new fct_daily_sales --materialized table
../node_modules/.bin/tsx ../src/cli.ts dbt:model:new dim_customers --materialized table

# Create Dagster assets
../node_modules/.bin/tsx ../src/cli.ts dagster:asset:new sales_data_loader
../node_modules/.bin/tsx ../src/cli.ts dagster:asset:new customer_segmentation

# Create DBT-Dagster integration
../node_modules/.bin/tsx ../src/cli.ts dagster:dbt:asset stg_customers
```

### Scenario 2: Real-time Analytics
```bash
# Initialize streaming analytics project
npm run dev -- init streaming-analytics --template streaming

cd streaming-analytics

# Generate time-series models
../node_modules/.bin/tsx ../src/cli.ts ai:generate:dbt "Create a model that calculates hourly active users" --name hourly_active_users

# Generate real-time processing assets
../node_modules/.bin/tsx ../src/cli.ts ai:generate:dagster "Create an asset that processes streaming events" --name event_processor

# Test scheduling
../node_modules/.bin/tsx ../src/cli.ts dagster:asset:new metrics_aggregator --schedule "0 * * * *"
```

## 4. Error Handling Tests

### Test Invalid Commands
```bash
# Test non-existent project
../node_modules/.bin/tsx ../src/cli.ts dbt:model:new test_model  # Should fail - no .dataweave config

# Test invalid file paths
../node_modules/.bin/tsx ../src/cli.ts ai:explain non-existent-file.sql

# Test invalid model names
../node_modules/.bin/tsx ../src/cli.ts ai:document non_existent_model
```

### Test Configuration Validation
```bash
# Test with corrupted config
echo '{"invalid": json}' > my-test-project/.dataweave/config.json
cd my-test-project
../node_modules/.bin/tsx ../src/cli.ts dbt:model:new test_model  # Should show error
```

## 5. Performance Testing

### Test Large Project Generation
```bash
# Generate project with many models
npm run dev -- init large-project

cd large-project

# Generate multiple models quickly
for i in {1..10}; do
  ../node_modules/.bin/tsx ../src/cli.ts dbt:model:new model_$i --description "Test model $i"
done

# Generate multiple assets
for i in {1..10}; do
  ../node_modules/.bin/tsx ../src/cli.ts dagster:asset:new asset_$i --description "Test asset $i"
done

# Check performance
time ../node_modules/.bin/tsx ../src/cli.ts dbt:model:new performance_test
```

## 6. Real Database Testing (Advanced)

### With Docker PostgreSQL
```bash
# Start PostgreSQL
docker run --name test-postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres

# Update project config to use real database
cd my-test-project
nano config/profiles.yml  # Update connection details

# Test actual DBT commands (if dbt is installed)
pip install dbt-postgres
cd data/dbt
dbt debug
dbt run
dbt test
```

### With Supabase (if configured)
```bash
# Install Supabase CLI
npm install -g @supabase/cli

# Initialize Supabase in project
cd my-test-project
supabase init
supabase start

# Test Supabase integration
../node_modules/.bin/tsx ../src/cli.ts supabase:connect  # Future feature
```

## 7. Cleanup
```bash
# Remove test projects
rm -rf my-test-project ecommerce-analytics streaming-analytics large-project

# Stop Docker containers
docker stop test-postgres
docker rm test-postgres
```

## Expected Results

### ✅ Success Indicators
- Project directories created with proper structure
- SQL and Python files generated with valid syntax
- Configuration files properly formatted
- CLI commands execute without errors
- Help text displays correctly
- AI mock responses are generated

### ❌ Failure Indicators
- TypeScript compilation errors
- Missing directories or files
- Malformed JSON/YAML configuration
- CLI crashes or hangs
- Empty or corrupt generated files

## Troubleshooting

### Common Issues
1. **"No dataweave project found"** - Run `dataweave init` first
2. **"Failed to execute dbt command"** - DBT not installed or not in PATH
3. **AI features return errors** - Expected with mock provider
4. **Permission errors** - Check file/directory permissions

### Debug Mode
```bash
# Enable verbose logging
NODE_ENV=development npm run dev -- init debug-project

# Check TypeScript compilation
npm run build
```