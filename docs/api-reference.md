# 📚 Dataweave API Reference

Complete command-line interface reference for the Dataweave CLI.

## 📋 Table of Contents

- [Global Options](#global-options)
- [Project Management](#project-management)
- [DBT Integration](#dbt-integration)
- [Dagster Integration](#dagster-integration)
- [AI-Powered Features](#ai-powered-features)
- [Utility Commands](#utility-commands)
- [Exit Codes](#exit-codes)
- [Environment Variables](#environment-variables)

## 🌐 Global Options

All commands support these global options:

```bash
--help, -h          Show help information
--version, -v       Show version information
```

## 🏗️ Project Management

### `dataweave init [name]`

Initialize a new dataweave project with complete scaffolding.

**Usage:**
```bash
dataweave init [name] [options]
```

**Arguments:**
- `name` (optional): Project name. Defaults to `my-dataweave-project`

**Options:**
- `--template, -t <template>`: Project template (`default`, `minimal`, `enterprise`)
- `--no-dbt`: Skip DBT setup
- `--no-dagster`: Skip Dagster setup  
- `--no-supabase`: Skip Supabase setup

**Examples:**
```bash
# Basic project initialization
dataweave init my-pipeline

# Minimal project without Supabase
dataweave init analytics-project --no-supabase

# Enterprise template with all features
dataweave init enterprise-pipeline --template enterprise
```

**Output:**
- Creates project directory structure
- Generates configuration files
- Sets up DBT profiles
- Creates Dagster workspace
- Initializes git repository

---

### `dataweave info`

Display comprehensive information about dataweave and current project.

**Usage:**
```bash
dataweave info
```

**Examples:**
```bash
# Show project information
cd my-pipeline
dataweave info
```

**Output:**
- Dataweave version and description
- Current project configuration
- Enabled features and integrations
- Useful links and documentation

---

## 🔄 DBT Integration

### `dataweave dbt:model:new <name>`

Generate a new DBT model with intelligent placement and configuration.

**Usage:**
```bash
dataweave dbt:model:new <name> [options]
```

**Arguments:**
- `name` (required): Model name (will be converted to snake_case)

**Options:**
- `--sql, -s <sql>`: Custom SQL content for the model
- `--description, -d <desc>`: Model description for documentation
- `--materialized, -m <type>`: Materialization type (`view`, `table`, `incremental`)
- `--tags <tags>`: Comma-separated list of tags

**Examples:**
```bash
# Basic model creation
dataweave dbt:model:new user_metrics

# Model with custom SQL
dataweave dbt:model:new revenue_summary \
  --sql "select date, sum(amount) as revenue from orders group by date"

# Materialized table with tags
dataweave dbt:model:new customer_ltv \
  --materialized table \
  --tags "metrics,customer" \
  --description "Customer lifetime value calculation"
```

**Output:**
- Creates `.sql` file in appropriate models directory
- Updates schema.yml with model configuration
- Generates model-specific documentation
- Applies intelligent directory placement (staging/intermediate/marts)

---

### `dataweave dbt:run [model]`

Execute DBT models with comprehensive logging and error handling.

**Usage:**
```bash
dataweave dbt:run [model] [options]
```

**Arguments:**
- `model` (optional): Specific model to run. If omitted, runs all models

**Examples:**
```bash
# Run all models
dataweave dbt:run

# Run specific model
dataweave dbt:run user_metrics

# Run models with specific tag
dataweave dbt:run --models tag:staging
```

**Output:**
- Executes SQL transformations
- Shows execution progress and timing
- Reports success/failure status
- Logs detailed error information

---

### `dataweave dbt:test [model]`

Run DBT tests with detailed reporting and validation.

**Usage:**
```bash
dataweave dbt:test [model]
```

**Arguments:**
- `model` (optional): Specific model to test. If omitted, runs all tests

**Examples:**
```bash
# Run all tests
dataweave dbt:test

# Test specific model
dataweave dbt:test user_metrics

# Test with verbose output
dataweave dbt:test --debug
```

**Output:**
- Executes data quality tests
- Reports test results and failures
- Shows detailed validation information
- Provides debugging information for failures

---

### `dataweave dbt:compile [model]`

Compile DBT models to validate SQL without execution.

**Usage:**
```bash
dataweave dbt:compile [model]
```

**Arguments:**
- `model` (optional): Specific model to compile. If omitted, compiles all models

**Examples:**
```bash
# Compile all models
dataweave dbt:compile

# Compile specific model
dataweave dbt:compile user_metrics
```

**Output:**
- Validates SQL syntax and references
- Generates compiled SQL files
- Reports compilation errors
- Shows model dependencies

---

### `dataweave dbt:docs`

Generate and serve comprehensive DBT documentation.

**Usage:**
```bash
dataweave dbt:docs
```

**Examples:**
```bash
# Generate documentation
dataweave dbt:docs
```

**Output:**
- Generates HTML documentation
- Creates data lineage diagrams
- Produces model descriptions
- Serves documentation locally

---

### `dataweave dbt:introspect`

Analyze and introspect database schema for model generation.

**Usage:**
```bash
dataweave dbt:introspect
```

**Examples:**
```bash
# Introspect current database
dataweave dbt:introspect
```

**Output:**
- Lists available tables and columns
- Shows data types and constraints
- Provides schema analysis
- Suggests model structures

---

## ⚡ Dagster Integration

### `dataweave dagster:asset:new <name>`

Create a new Dagster asset with intelligent code generation.

**Usage:**
```bash
dataweave dagster:asset:new <name> [options]
```

**Arguments:**
- `name` (required): Asset name (will be converted to snake_case)

**Options:**
- `--description, -d <desc>`: Asset description
- `--deps <dependencies>`: Comma-separated list of asset dependencies
- `--code <code>`: Custom Python code for the asset
- `--schedule <schedule>`: Cron schedule expression
- `--tags <tags>`: Comma-separated list of tags
- `--compute-kind <kind>`: Compute kind (e.g., `pandas`, `spark`, `sql`)
- `--io-manager <manager>`: IO manager key for asset storage

**Examples:**
```bash
# Basic asset creation
dataweave dagster:asset:new user_processor

# Asset with dependencies
dataweave dagster:asset:new customer_metrics \
  --deps "raw_users,raw_orders" \
  --description "Calculate customer metrics"

# Scheduled asset with custom code
dataweave dagster:asset:new daily_report \
  --schedule "0 8 * * *" \
  --compute-kind pandas \
  --code "return df.groupby('date').sum()"
```

**Output:**
- Creates Python asset file
- Updates __init__.py imports
- Generates asset documentation
- Configures dependencies and metadata

---

### `dataweave dagster:job:new <name>`

Create a new Dagster job for orchestrating multiple assets.

**Usage:**
```bash
dataweave dagster:job:new <name> [options]
```

**Arguments:**
- `name` (required): Job name (will be converted to snake_case)

**Options:**
- `--description, -d <desc>`: Job description
- `--assets <assets>`: Comma-separated list of assets to include
- `--schedule <schedule>`: Cron schedule expression
- `--tags <tags>`: Comma-separated list of tags

**Examples:**
```bash
# Basic job creation
dataweave dagster:job:new daily_pipeline

# Job with specific assets
dataweave dagster:job:new user_analytics \
  --assets "user_processor,customer_metrics" \
  --description "User analytics pipeline"

# Scheduled job
dataweave dagster:job:new weekly_report \
  --schedule "0 6 * * 1" \
  --assets "weekly_metrics,report_generator"
```

**Output:**
- Creates Python job file
- Configures asset selection
- Sets up scheduling
- Updates job registry

---

### `dataweave dagster:dbt:asset <model>`

Generate a Dagster asset that wraps a DBT model for unified orchestration.

**Usage:**
```bash
dataweave dagster:dbt:asset <model>
```

**Arguments:**
- `model` (required): DBT model name to wrap

**Examples:**
```bash
# Create Dagster asset for DBT model
dataweave dagster:dbt:asset user_metrics

# Wrap multiple models
dataweave dagster:dbt:asset customer_ltv
dataweave dagster:dbt:asset revenue_summary
```

**Output:**
- Creates DBT-Dagster integration asset
- Configures model dependencies
- Sets up materialization tracking
- Enables unified pipeline orchestration

---

### `dataweave dagster:run:asset <name>`

Execute a specific Dagster asset with comprehensive logging.

**Usage:**
```bash
dataweave dagster:run:asset <name>
```

**Arguments:**
- `name` (required): Asset name to execute

**Examples:**
```bash
# Run specific asset
dataweave dagster:run:asset user_processor

# Run asset with dependencies
dataweave dagster:run:asset customer_metrics
```

**Output:**
- Executes asset and dependencies
- Shows execution progress
- Reports success/failure status
- Provides detailed logging

---

### `dataweave dagster:run:job <name>`

Execute a specific Dagster job with all associated assets.

**Usage:**
```bash
dataweave dagster:run:job <name>
```

**Arguments:**
- `name` (required): Job name to execute

**Examples:**
```bash
# Run complete job
dataweave dagster:run:job daily_pipeline

# Execute analytics job
dataweave dagster:run:job user_analytics
```

**Output:**
- Executes job and all assets
- Shows execution graph
- Reports timing and status
- Provides comprehensive logging

---

### `dataweave dagster:dev`

Start Dagster development server with web interface.

**Usage:**
```bash
dataweave dagster:dev [options]
```

**Options:**
- `--port, -p <port>`: Port number (default: 3000)

**Examples:**
```bash
# Start development server
dataweave dagster:dev

# Use custom port
dataweave dagster:dev --port 3001
```

**Output:**
- Starts Dagster web interface
- Provides asset and job visualization
- Enables pipeline monitoring
- Shows real-time execution status

---

### `dataweave dagster:validate`

Validate Dagster pipeline configuration and dependencies.

**Usage:**
```bash
dataweave dagster:validate
```

**Examples:**
```bash
# Validate pipeline configuration
dataweave dagster:validate
```

**Output:**
- Validates asset definitions
- Checks dependency resolution
- Reports configuration errors
- Confirms pipeline readiness

---

## 🤖 AI-Powered Features

### `dataweave ai:generate:dbt <prompt>`

Generate DBT models using AI with natural language descriptions.

**Usage:**
```bash
dataweave ai:generate:dbt <prompt> [options]
```

**Arguments:**
- `prompt` (required): Natural language description of desired model

**Options:**
- `--name, -n <name>`: Model name (if omitted, only generates code)
- `--tables <tables>`: Comma-separated list of available tables for context

**Examples:**
```bash
# Generate and display DBT model
dataweave ai:generate:dbt "Calculate monthly active users from events table"

# Generate and create model file
dataweave ai:generate:dbt "Customer lifetime value analysis" \
  --name customer_ltv \
  --tables "customers,orders,order_items"

# Complex transformation
dataweave ai:generate:dbt "Create a funnel analysis showing conversion rates from signup to purchase"
```

**Output:**
- Generates SQL code using AI
- Provides model description
- Creates model file (if --name specified)
- Shows usage instructions

---

### `dataweave ai:generate:dagster <prompt>`

Generate Dagster assets using AI with intelligent Python code generation.

**Usage:**
```bash
dataweave ai:generate:dagster <prompt> [options]
```

**Arguments:**
- `prompt` (required): Natural language description of desired asset

**Options:**
- `--name, -n <name>`: Asset name (if omitted, only generates code)
- `--tables <tables>`: Comma-separated list of available tables for context

**Examples:**
```bash
# Generate and display Dagster asset
dataweave ai:generate:dagster "Process user events and calculate engagement metrics"

# Generate and create asset file
dataweave ai:generate:dagster "Data quality validation for customer data" \
  --name data_quality_check \
  --tables "customers,orders"

# Complex data processing
dataweave ai:generate:dagster "Build a machine learning feature store from raw transaction data"
```

**Output:**
- Generates Python asset code
- Provides asset description
- Creates asset file (if --name specified)
- Shows usage instructions

---

### `dataweave ai:explain <file>`

Analyze and explain existing code using AI for better understanding.

**Usage:**
```bash
dataweave ai:explain <file>
```

**Arguments:**
- `file` (required): Path to SQL or Python file to analyze

**Examples:**
```bash
# Explain DBT model
dataweave ai:explain data/dbt/models/marts/fct_orders.sql

# Explain Dagster asset
dataweave ai:explain data/dagster/assets/user_processor.py

# Explain complex transformation
dataweave ai:explain data/dbt/models/intermediate/int_customer_metrics.sql
```

**Output:**
- Provides code explanation
- Identifies business logic
- Explains dependencies
- Suggests improvements

---

### `dataweave ai:optimize <file>`

Get AI-powered optimization suggestions for existing code.

**Usage:**
```bash
dataweave ai:optimize <file>
```

**Arguments:**
- `file` (required): Path to SQL or Python file to optimize

**Examples:**
```bash
# Optimize DBT model
dataweave ai:optimize data/dbt/models/staging/stg_large_table.sql

# Optimize Dagster asset
dataweave ai:optimize data/dagster/assets/heavy_computation.py

# Performance optimization
dataweave ai:optimize data/dbt/models/marts/slow_aggregation.sql
```

**Output:**
- Provides optimization suggestions
- Identifies performance bottlenecks
- Suggests index strategies
- Recommends code improvements

---

### `dataweave ai:document <model>`

Generate comprehensive documentation for DBT models using AI.

**Usage:**
```bash
dataweave ai:document <model>
```

**Arguments:**
- `model` (required): DBT model name to document

**Examples:**
```bash
# Document DBT model
dataweave ai:document user_metrics

# Document complex model
dataweave ai:document customer_lifetime_value
```

**Output:**
- Generates model documentation
- Creates column descriptions
- Provides business context
- Suggests schema.yml updates

---

## 🛠️ Utility Commands

### `dataweave scaffold <type>`

Scaffold new components with intelligent templates.

**Usage:**
```bash
dataweave scaffold <type>
```

**Arguments:**
- `type` (required): Component type to scaffold

**Examples:**
```bash
# Show available scaffolding options
dataweave scaffold model
dataweave scaffold asset
dataweave scaffold job
```

**Output:**
- Shows available scaffolding options
- Provides template information
- Lists upcoming features

---

## 🚨 Exit Codes

Dataweave uses standard exit codes to indicate command status:

- `0`: Success
- `1`: General error (invalid command, configuration error)
- `2`: Invalid arguments or options
- `126`: Command execution failed
- `127`: Command not found

## 🌐 Environment Variables

### Database Configuration
```bash
DATABASE_URL              # Primary database connection string
DBT_PROFILES_DIR          # DBT profiles directory (default: ./config)
```

### AI/LLM Integration
```bash
OPENAI_API_KEY            # OpenAI API key for GPT models
ANTHROPIC_API_KEY         # Anthropic API key for Claude models
AI_PROVIDER               # AI provider (openai, anthropic, local)
AI_MODEL                  # Specific model to use
AI_TEMPERATURE            # Model temperature (0.0-1.0)
AI_MAX_TOKENS             # Maximum tokens per request
```

### Supabase Integration
```bash
SUPABASE_URL              # Supabase project URL
SUPABASE_ANON_KEY         # Supabase anonymous key
SUPABASE_SERVICE_ROLE_KEY # Supabase service role key
```

### Dagster Configuration
```bash
DAGSTER_HOME              # Dagster home directory
DAGSTER_PORT              # Dagster development server port
DAGSTER_HOST              # Dagster server host
```

### Development Settings
```bash
NODE_ENV                  # Environment (development, production)
DEBUG                     # Enable debug logging (true/false)
VERBOSE                   # Enable verbose output (true/false)
```

---

## 📖 Usage Examples

### Complete Workflow Example
```bash
# 1. Initialize project
dataweave init ecommerce-pipeline

# 2. Navigate to project
cd ecommerce-pipeline

# 3. Generate staging models
dataweave dbt:model:new stg_customers --sql "select * from raw.customers"
dataweave dbt:model:new stg_orders --sql "select * from raw.orders"

# 4. Create business logic with AI
dataweave ai:generate:dbt "Calculate customer lifetime value and segment customers" \
  --name customer_analysis \
  --tables "stg_customers,stg_orders"

# 5. Build orchestration
dataweave dagster:asset:new customer_processor --deps "stg_customers,stg_orders"
dataweave dagster:dbt:asset customer_analysis

# 6. Create pipeline job
dataweave dagster:job:new daily_customer_pipeline \
  --assets "customer_processor,customer_analysis" \
  --schedule "0 2 * * *"

# 7. Test and validate
dataweave dbt:test
dataweave dagster:validate

# 8. Run pipeline
dataweave dbt:run
dataweave dagster:dev
```

### AI-Powered Development Example
```bash
# Generate models with natural language
dataweave ai:generate:dbt "Create a cohort analysis showing user retention over time"

# Explain existing code
dataweave ai:explain data/dbt/models/marts/retention_analysis.sql

# Optimize performance
dataweave ai:optimize data/dbt/models/staging/stg_large_events.sql

# Generate documentation
dataweave ai:document retention_analysis
```

---

For more detailed examples and advanced usage, see the [Getting Started Guide](getting-started.md) and [Testing Guide](../TESTING.md).