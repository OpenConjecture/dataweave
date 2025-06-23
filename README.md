# 🌊 Dataweave

**AI-Assisted CLI for Modern Data Pipelines**

[![npm version](https://badge.fury.io/js/dataweave.svg)](https://www.npmjs.com/package/dataweave)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)](https://nodejs.org/)

Dataweave is an intelligent command-line interface that accelerates data pipeline development by combining **DBT** (data transformation), **Dagster** (orchestration), and **Supabase** (backend) with **AI-powered** code generation and scaffolding.

## ✨ Features

### 🚀 **Project Scaffolding**
- Initialize complete data pipeline projects with one command
- Automatic setup of DBT, Dagster, and Supabase integrations
- Configurable project templates and structures

### 🤖 **AI-Powered Development**
- Generate DBT models from natural language descriptions
- Create Dagster assets with intelligent dependency mapping
- AI-driven code explanation and optimization suggestions
- Automatic documentation generation

### 🔧 **Modern Stack Integration**
- **DBT**: Model generation, testing, schema management
- **Dagster**: Asset creation, job scheduling, pipeline validation
- **Supabase**: Database integration, migration management
- **Cross-tool workflows**: DBT models → Dagster assets

### 📦 **Developer Experience**
- Comprehensive CLI with 20+ commands
- Intelligent error handling and validation
- Built-in testing and coverage tools
- Professional terminal UI with progress indicators

## 🚀 Installation

### Global Installation (Recommended)
```bash
npm install -g dataweave
```

### Direct Usage with npx
```bash
npx dataweave init my-data-project
```

## 🎯 Quick Start

### 1. Initialize a New Project
```bash
# Create a full-featured data pipeline project
dataweave init my-pipeline

# Initialize with specific features
dataweave init my-pipeline --no-supabase --template minimal
```

### 2. Generate DBT Models
```bash
cd my-pipeline

# Create a basic model
dataweave dbt:model:new user_metrics --materialized table

# Generate with AI assistance
dataweave ai:generate:dbt "Create a model that calculates monthly active users"

# Generate with custom SQL
dataweave dbt:model:new revenue_model --sql "select sum(amount) from orders"
```

### 3. Create Dagster Assets
```bash
# Generate a data processing asset
dataweave dagster:asset:new data_processor --deps "raw_users,raw_orders"

# Create with AI assistance
dataweave ai:generate:dagster "Build an asset that processes customer data"

# Generate DBT-Dagster integration
dataweave dagster:dbt:asset user_metrics
```

### 4. AI-Powered Development
```bash
# Explain existing code
dataweave ai:explain data/dbt/models/marts/fct_orders.sql

# Get optimization suggestions
dataweave ai:optimize data/dagster/assets/user_processor.py

# Generate documentation
dataweave ai:document user_metrics
```

## 📋 Command Reference

### **Project Management**
```bash
dataweave init [name]                    # Initialize new project
dataweave info                          # Display project information
```

### **DBT Integration**
```bash
dataweave dbt:model:new <name>          # Generate new DBT model
dataweave dbt:run [model]               # Run DBT models
dataweave dbt:test [model]              # Test DBT models
dataweave dbt:compile [model]           # Compile DBT models
dataweave dbt:docs                      # Generate documentation
dataweave dbt:introspect                # Analyze database schema
```

### **Dagster Integration**
```bash
dataweave dagster:asset:new <name>      # Create Dagster asset
dataweave dagster:job:new <name>        # Create Dagster job
dataweave dagster:dbt:asset <model>     # DBT-Dagster integration
dataweave dagster:dev                   # Start development server
dataweave dagster:validate              # Validate pipeline config
```

### **AI-Powered Features**
```bash
dataweave ai:generate:dbt <prompt>      # Generate DBT model with AI
dataweave ai:generate:dagster <prompt>  # Generate Dagster asset with AI
dataweave ai:explain <file>             # Explain code with AI
dataweave ai:optimize <file>            # Get optimization suggestions
dataweave ai:document <model>           # Generate documentation
```

## 🏗️ Project Structure

Dataweave creates a comprehensive project structure:

```
my-pipeline/
├── .dataweave/              # Configuration
├── data/
│   ├── dbt/                # DBT models, tests, docs
│   │   ├── models/
│   │   │   ├── staging/    # Raw data models
│   │   │   ├── intermediate/ # Business logic
│   │   │   └── marts/      # Final data products
│   │   ├── macros/         # Reusable SQL
│   │   └── tests/          # Data tests
│   ├── dagster/            # Orchestration
│   │   ├── assets/         # Data assets
│   │   ├── jobs/           # Pipeline jobs
│   │   ├── schedules/      # Automation
│   │   └── sensors/        # Event triggers
│   └── assets/             # Shared resources
├── supabase/               # Database & backend
│   ├── migrations/         # Schema changes
│   └── functions/          # Edge functions
├── config/                 # Configuration files
└── README.md              # Project documentation
```

## 🔧 Configuration

### Environment Variables
```bash
# Database connection
DATABASE_URL=postgresql://user:pass@host:5432/db

# Supabase integration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key

# AI/LLM integration
OPENAI_API_KEY=your-openai-key

# Dagster configuration
DAGSTER_HOME=./data/dagster
```

### Project Configuration
```json
{
  "name": "my-pipeline",
  "version": "1.0.0",
  "dbt": {
    "enabled": true,
    "profile": "dataweave",
    "target": "dev"
  },
  "dagster": {
    "enabled": true,
    "workspace": "./data/dagster"
  },
  "supabase": {
    "enabled": true
  },
  "ai": {
    "enabled": true,
    "provider": "openai",
    "model": "gpt-4"
  }
}
```

## 🧪 Testing

Dataweave includes comprehensive testing tools:

```bash
# Run all tests
npm test

# Run specific test types
npm run test:unit
npm run test:integration
npm run test:coverage

# Manual testing
./test-runner.sh
```

## 📚 Documentation

- **[Getting Started Guide](docs/getting-started.md)** - Comprehensive setup and usage
- **[API Reference](docs/api-reference.md)** - Complete command documentation
- **[Testing Guide](TESTING.md)** - Testing strategies and examples
- **[Contributing Guide](docs/contributing.md)** - Development guidelines

## 🌟 Examples

### E-commerce Analytics Pipeline
```bash
# Initialize project
dataweave init ecommerce-analytics

cd ecommerce-analytics

# Generate staging models
dataweave dbt:model:new stg_customers --materialized view
dataweave dbt:model:new stg_orders --materialized view

# Create business logic
dataweave ai:generate:dbt "Calculate customer lifetime value" --name customer_ltv

# Build orchestration
dataweave dagster:asset:new customer_segmentation --deps "stg_customers,customer_ltv"

# Run the pipeline
dataweave dbt:run
dataweave dagster:dev
```

### Real-time Analytics
```bash
# AI-powered model generation
dataweave ai:generate:dbt "Create hourly active user metrics with real-time updates"

# Event-driven processing
dataweave dagster:asset:new event_processor --schedule "*/5 * * * *"

# Supabase integration
dataweave supabase:connect
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](docs/contributing.md) for details.

### Development Setup
```bash
# Clone the repository
git clone https://github.com/yourusername/dataweave.git
cd dataweave

# Install dependencies
npm install

# Run tests
npm test

# Build the CLI
npm run build
```

## 📝 Changelog

See [CHANGELOG.md](CHANGELOG.md) for release history.

## 🆘 Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/yourusername/dataweave/issues)
- **Documentation**: [Complete guides and examples](docs/)
- **Community**: [Join our discussions](https://github.com/yourusername/dataweave/discussions)

## 📄 License

MIT © [Dataweave Contributors](LICENSE)

---

**Built with ❤️ for the modern data stack**

*Accelerating data pipeline development through intelligent automation*