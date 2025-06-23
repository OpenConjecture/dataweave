# 🚀 Getting Started with Dataweave

Welcome to Dataweave! This comprehensive guide will help you get up and running with the AI-assisted CLI for modern data pipelines.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Initial Setup](#initial-setup)
- [Your First Project](#your-first-project)
- [Core Concepts](#core-concepts)
- [Essential Workflows](#essential-workflows)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)
- [Next Steps](#next-steps)

## 🔧 Prerequisites

Before installing Dataweave, ensure you have:

### Required Dependencies
- **Node.js** (version 16.0.0 or higher)
- **npm** or **yarn** package manager
- **Git** for version control

### Recommended Tools
- **Python** (3.8+) for Dagster integration
- **PostgreSQL** or other SQL database
- **VSCode** or preferred code editor

### Check Your Environment
```bash
# Verify Node.js version
node --version

# Verify npm version
npm --version

# Verify Python version (optional)
python --version
```

## 📦 Installation

### Global Installation (Recommended)
```bash
# Install globally for system-wide access
npm install -g dataweave

# Verify installation
dataweave --version
```

### Alternative Installation Methods
```bash
# Use npx without installation
npx dataweave --help

# Install locally in project
npm install dataweave
npx dataweave --help
```

### Verify Installation
```bash
# Check if dataweave is accessible
dataweave --help

# Check both command aliases work
dw --help
```

## 🎯 Initial Setup

### 1. Create Your First Project
```bash
# Initialize a new data pipeline project
dataweave init my-first-pipeline

# Navigate to project directory
cd my-first-pipeline

# Explore the generated structure
ls -la
```

### 2. Understand Project Structure
```
my-first-pipeline/
├── .dataweave/              # Configuration files
│   └── config.json         # Project settings
├── data/
│   ├── dbt/                # DBT transformation layer
│   │   ├── models/         # SQL transformations
│   │   ├── macros/         # Reusable SQL functions
│   │   └── tests/          # Data tests
│   └── dagster/            # Orchestration layer
│       ├── assets/         # Data assets
│       ├── jobs/           # Pipeline jobs
│       └── schedules/      # Automation schedules
├── supabase/               # Backend integration
├── config/                 # Environment configurations
└── README.md              # Project documentation
```

### 3. Configure Environment
Create a `.env` file in your project root:

```bash
# Database connection
DATABASE_URL=postgresql://user:password@localhost:5432/dataweave

# Supabase (optional)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key

# AI/LLM integration (optional)
OPENAI_API_KEY=your-openai-key

# Dagster configuration
DAGSTER_HOME=./data/dagster
```

## 🏗️ Your First Project

Let's build a simple analytics pipeline step by step.

### Step 1: Create DBT Models
```bash
# Generate a staging model for raw data
dataweave dbt:model:new stg_users --sql "select * from raw_users"

# Create a business logic model
dataweave dbt:model:new user_metrics \
  --sql "select user_id, count(*) as total_actions from stg_users group by user_id" \
  --materialized table

# Generate model with AI assistance
dataweave ai:generate:dbt "Create a model that calculates monthly active users" \
  --name monthly_active_users
```

### Step 2: Create Dagster Assets
```bash
# Generate a data processing asset
dataweave dagster:asset:new user_processor \
  --description "Process user data and calculate metrics" \
  --deps "stg_users"

# Create DBT-Dagster integration
dataweave dagster:dbt:asset user_metrics

# Generate asset with AI
dataweave ai:generate:dagster "Create an asset that validates data quality" \
  --name data_quality_validator
```

### Step 3: Run Your Pipeline
```bash
# Compile and test DBT models
dataweave dbt:compile
dataweave dbt:test

# Run DBT transformations
dataweave dbt:run

# Start Dagster development server
dataweave dagster:dev --port 3000
```

### Step 4: Verify Results
```bash
# Generate DBT documentation
dataweave dbt:docs

# Validate Dagster pipeline
dataweave dagster:validate

# View project information
dataweave info
```

## 💡 Core Concepts

### DBT Integration
**Models**: SQL-based transformations organized by layer
- `staging/`: Raw data cleaning and standardization
- `intermediate/`: Business logic and calculations
- `marts/`: Final data products for analysis

**Materialization Types**:
- `view`: Virtual table (default)
- `table`: Physical table
- `incremental`: Append-only updates

### Dagster Integration
**Assets**: Declarative data objects with dependencies
**Jobs**: Collections of assets that run together
**Schedules**: Time-based automation
**Sensors**: Event-driven triggers

### AI-Powered Features
**Code Generation**: Natural language to SQL/Python
**Documentation**: Automatic model documentation
**Optimization**: Performance improvement suggestions
**Explanation**: Code analysis and insights

## 🔄 Essential Workflows

### Development Workflow
```bash
# 1. Plan your data model
dataweave ai:generate:dbt "Describe your data transformation"

# 2. Create and test models
dataweave dbt:model:new my_model --sql "your SQL here"
dataweave dbt:test my_model

# 3. Build orchestration
dataweave dagster:asset:new my_asset --deps "my_model"

# 4. Validate and run
dataweave dbt:run
dataweave dagster:validate
```

### Testing Workflow
```bash
# Test DBT models
dataweave dbt:test

# Test specific model
dataweave dbt:test my_model

# Validate Dagster pipeline
dataweave dagster:validate

# Run comprehensive tests
npm test  # If in development
```

### Documentation Workflow
```bash
# Generate DBT documentation
dataweave dbt:docs

# Generate AI documentation for models
dataweave ai:document my_model

# Explain existing code
dataweave ai:explain data/dbt/models/staging/stg_users.sql
```

### Production Workflow
```bash
# 1. Compile and validate
dataweave dbt:compile
dataweave dagster:validate

# 2. Run transformations
dataweave dbt:run

# 3. Deploy orchestration
dataweave dagster:dev --port 3000

# 4. Monitor and maintain
# (Check Dagster UI at http://localhost:3000)
```

## ⚙️ Configuration

### Project Configuration
Edit `.dataweave/config.json`:

```json
{
  "name": "my-pipeline",
  "version": "1.0.0",
  "dbt": {
    "enabled": true,
    "profile": "dataweave",
    "target": "dev",
    "models_path": "data/dbt/models",
    "profiles_dir": "config"
  },
  "dagster": {
    "enabled": true,
    "workspace": "./data/dagster",
    "assets_path": "data/dagster/assets",
    "jobs_path": "data/dagster/jobs"
  },
  "supabase": {
    "enabled": false,
    "project_url": "",
    "anon_key": ""
  },
  "ai": {
    "enabled": true,
    "provider": "openai",
    "model": "gpt-4",
    "temperature": 0.7,
    "max_tokens": 2000
  }
}
```

### DBT Profile Configuration
Edit `config/profiles.yml`:

```yaml
dataweave:
  outputs:
    dev:
      type: postgres
      host: localhost
      user: your_username
      password: your_password
      port: 5432
      dbname: dataweave_dev
      schema: analytics
      threads: 4
      keepalives_idle: 0
    prod:
      type: postgres
      host: your_prod_host
      user: your_prod_username
      password: "{{ env_var('PROD_DB_PASSWORD') }}"
      port: 5432
      dbname: dataweave_prod
      schema: analytics
      threads: 8
  target: dev
```

### Environment Variables
```bash
# Database connections
DATABASE_URL=postgresql://user:pass@host:5432/db
DBT_PROFILES_DIR=./config

# AI/LLM providers
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key

# Supabase integration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key

# Dagster settings
DAGSTER_HOME=./data/dagster
DAGSTER_PORT=3000
```

## 🔍 Troubleshooting

### Common Issues

#### Installation Problems
```bash
# Permission errors
sudo npm install -g dataweave

# Version conflicts
npm uninstall -g dataweave
npm install -g dataweave@latest

# Clear npm cache
npm cache clean --force
```

#### Project Initialization
```bash
# Directory already exists
rm -rf existing-project
dataweave init existing-project

# Configuration not found
cd your-project-directory
dataweave info  # Should show error
dataweave init . --force  # Reinitialize
```

#### DBT Issues
```bash
# Profile not found
dataweave dbt:compile  # Check error message
# Edit config/profiles.yml with correct database settings

# Models not compiling
dataweave dbt:compile --debug
# Check SQL syntax and dependencies

# Connection issues
# Verify DATABASE_URL in .env file
# Test database connection manually
```

#### Dagster Issues
```bash
# Assets not loading
dataweave dagster:validate
# Check Python syntax in asset files

# Development server won't start
# Check if port 3000 is available
dataweave dagster:dev --port 3001

# Import errors
# Verify Python dependencies are installed
pip install dagster dagster-dbt
```

#### AI Features
```bash
# API key not set
export OPENAI_API_KEY=your-key
dataweave ai:generate:dbt "test prompt"

# Model not found
# Check AI provider settings in config.json
# Verify API key is valid and has credits
```

### Debug Commands
```bash
# Show project information
dataweave info

# Validate configuration
cat .dataweave/config.json

# Check environment variables
env | grep -E "(DATABASE|OPENAI|SUPABASE|DAGSTER)"

# Test database connection
dataweave dbt:compile --debug

# Validate Dagster setup
dataweave dagster:validate --verbose
```

### Getting Help
```bash
# Show help for specific commands
dataweave dbt:model:new --help
dataweave ai:generate:dbt --help

# Show all available commands
dataweave --help

# Check version
dataweave --version
```

## 🎯 Next Steps

### Explore Advanced Features
1. **AI-Powered Development**
   - Experiment with natural language model generation
   - Use AI for code optimization and documentation
   - Try different AI providers and models

2. **Complex Pipelines**
   - Build multi-layered DBT models
   - Create sophisticated Dagster assets
   - Implement data quality testing

3. **Production Deployment**
   - Set up production databases
   - Configure CI/CD pipelines
   - Implement monitoring and alerting

### Learning Resources
- **[API Reference](api-reference.md)** - Complete command documentation
- **[Testing Guide](../TESTING.md)** - Testing strategies and examples
- **[Contributing Guide](contributing.md)** - Development guidelines
- **Community Examples** - Real-world project templates

### Join the Community
- **GitHub Discussions**: Ask questions and share projects
- **Issues**: Report bugs and request features
- **Contributions**: Help improve dataweave

### Example Projects
Explore these example implementations:

```bash
# E-commerce analytics
dataweave init ecommerce-analytics --template ecommerce

# Marketing attribution
dataweave init marketing-pipeline --template marketing

# Financial reporting
dataweave init finance-reports --template finance
```

---

## 🎉 Congratulations!

You're now ready to build modern data pipelines with Dataweave. Start with simple models and assets, then gradually explore more advanced features like AI-powered generation and complex orchestration.

Remember: Dataweave is designed to accelerate your data development workflow while maintaining best practices and code quality. Happy building! 🌊