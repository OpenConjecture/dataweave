# dataweave

> 🚧 **Preview Release** - Full functionality coming soon!

AI-assisted CLI for modern data pipelines with DBT, Dagster, and Supabase integration.

## Overview

Dataweave is an intelligent command-line interface designed to accelerate data pipeline development by combining the power of DBT (data transformation), Dagster (orchestration), and Supabase (backend) with AI-powered code generation and scaffolding.

## Installation

```bash
npm install -g dataweave
```

Or use directly with npx:
```bash
npx dataweave init
```

## Quick Start (Coming Soon)

```bash
# Initialize a new project
dataweave init my-pipeline

# Generate a DBT model with AI
dataweave ai "create a model that aggregates sales by region"

# Scaffold a Dagster asset
dataweave scaffold asset user_metrics

# Migrate from Airflow
dataweave migrate airflow ./dags/my_dag.py
```

## Planned Features

### 🤖 AI-Powered Development
- Natural language to SQL/Python code generation
- Intelligent code suggestions and optimizations
- Auto-documentation and test generation

### 🔧 Modern Stack Integration
- **DBT**: Model generation, testing, and documentation
- **Dagster**: Asset creation, job scheduling, and orchestration
- **Supabase**: Database setup, real-time triggers, and vector storage

### 🚀 Developer Experience
- Intelligent project scaffolding
- Repository introspection and analysis
- Seamless Airflow to Dagster migration
- Extensible plugin architecture

### 📦 Enterprise Ready
- Configuration and secrets management
- CI/CD pipeline generation
- Multi-environment deployment support
- Comprehensive testing utilities

## Commands (Preview)

```bash
dataweave init          # Initialize a new project
dataweave scaffold      # Generate components (models, assets, jobs)
dataweave ai           # AI-powered code generation
dataweave migrate      # Migration utilities (e.g., Airflow to Dagster)
dataweave deploy       # Deploy to staging/production
dataweave test         # Run tests
dataweave docs         # Generate documentation
```

## Roadmap

- [ ] Core CLI infrastructure
- [ ] DBT integration
- [ ] Dagster orchestration
- [ ] Supabase connectivity
- [ ] AI/LLM integration
- [ ] Migration tools
- [ ] Plugin system
- [ ] Cloud deployment
- [ ] Documentation site

## Contributing

We're actively developing dataweave and welcome contributions! Please check back soon for contribution guidelines.

## License

MIT

---

**Note**: This is a placeholder package to reserve the npm namespace. Full functionality is under active development. Star the repo to stay updated!