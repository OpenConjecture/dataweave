import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import chalk from 'chalk';

export interface ScaffoldOptions {
  name: string;
  template: string;
  targetDir: string;
  includeDbt?: boolean;
  includeDagster?: boolean;
  includeSupabase?: boolean;
}

export class ProjectScaffolder {
  private options: ScaffoldOptions;

  constructor(options: ScaffoldOptions) {
    this.options = {
      includeDbt: true,
      includeDagster: true,
      includeSupabase: true,
      ...options,
    };
  }

  async scaffold(): Promise<void> {
    const { targetDir, name } = this.options;
    
    console.log(chalk.blue(`🚀 Scaffolding dataweave project: ${name}`));
    
    // Create directory structure
    await this.createDirectoryStructure();
    
    // Generate configuration files
    await this.generateConfigFiles();
    
    // Generate template files
    await this.generateTemplateFiles();
    
    console.log(chalk.green(`✅ Successfully scaffolded project in ${targetDir}`));
    console.log(chalk.gray('\nNext steps:'));
    console.log(chalk.gray(`  cd ${name}`));
    console.log(chalk.gray('  npm install'));
    console.log(chalk.gray('  dataweave --help'));
  }

  private async createDirectoryStructure(): Promise<void> {
    const { targetDir } = this.options;
    const dirs = [
      'data',
      'data/dbt',
      'data/dbt/models',
      'data/dbt/models/staging',
      'data/dbt/models/intermediate', 
      'data/dbt/models/marts',
      'data/dbt/macros',
      'data/dbt/tests',
      'data/dagster',
      'data/dagster/assets',
      'data/dagster/jobs',
      'data/dagster/sensors',
      'data/dagster/schedules',
      'data/assets',
      'supabase',
      'supabase/migrations',
      'supabase/functions',
      '.dataweave',
      'config',
      'scripts',
    ];

    for (const dir of dirs) {
      const fullPath = join(targetDir, dir);
      if (!existsSync(fullPath)) {
        await mkdir(fullPath, { recursive: true });
      }
    }

    console.log(chalk.green('✓ Created directory structure'));
  }

  private async generateConfigFiles(): Promise<void> {
    const { targetDir, name } = this.options;
    
    // Generate main dataweave config
    const dataweaveConfig = {
      name,
      version: '1.0.0',
      dbt: {
        enabled: this.options.includeDbt,
        profile: 'dataweave',
        target: 'dev',
      },
      dagster: {
        enabled: this.options.includeDagster,
        workspace: './data/dagster',
      },
      supabase: {
        enabled: this.options.includeSupabase,
        projectId: '',
        apiUrl: '',
        anonKey: '',
      },
      ai: {
        enabled: true,
        provider: 'openai',
        model: 'gpt-4',
      },
    };

    await writeFile(
      join(targetDir, '.dataweave', 'config.json'),
      JSON.stringify(dataweaveConfig, null, 2)
    );

    // Generate .env template
    const envTemplate = `# Dataweave Environment Configuration
# Copy this to .env and fill in your actual values

# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/database_name

# Supabase Configuration (if using Supabase)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI/LLM Configuration
OPENAI_API_KEY=your-openai-api-key

# Dagster Configuration
DAGSTER_HOME=${targetDir}/data/dagster

# DBT Configuration
DBT_PROFILES_DIR=${targetDir}/config
`;

    await writeFile(join(targetDir, '.env.example'), envTemplate);
    
    console.log(chalk.green('✓ Generated configuration files'));
  }

  private async generateTemplateFiles(): Promise<void> {
    
    // Generate DBT files
    if (this.options.includeDbt) {
      await this.generateDbtFiles();
    }
    
    // Generate Dagster files
    if (this.options.includeDagster) {
      await this.generateDagsterFiles();
    }
    
    // Generate Supabase files
    if (this.options.includeSupabase) {
      await this.generateSupabaseFiles();
    }
    
    // Generate README
    await this.generateReadme();
    
    console.log(chalk.green('✓ Generated template files'));
  }

  private async generateDbtFiles(): Promise<void> {
    const { targetDir, name } = this.options;
    
    // dbt_project.yml
    const dbtProject = `name: '${name}'
version: '1.0.0'
config-version: 2

profile: 'dataweave'

model-paths: ["models"]
analysis-paths: ["analysis"]
test-paths: ["tests"]
seed-paths: ["seeds"]
macro-paths: ["macros"]
snapshot-paths: ["snapshots"]

target-path: "target"
clean-targets:
  - "target"
  - "dbt_packages"

models:
  ${name}:
    staging:
      +materialized: view
    intermediate:
      +materialized: view
    marts:
      +materialized: table
`;

    await writeFile(join(targetDir, 'data/dbt/dbt_project.yml'), dbtProject);

    // profiles.yml
    const profiles = `dataweave:
  outputs:
    dev:
      type: postgres
      host: localhost
      user: postgres
      password: postgres
      port: 5432
      dbname: dataweave_dev
      schema: public
      threads: 4
      keepalives_idle: 0
    prod:
      type: postgres
      host: "{{ env_var('DATABASE_HOST') }}"
      user: "{{ env_var('DATABASE_USER') }}"
      password: "{{ env_var('DATABASE_PASSWORD') }}"
      port: "{{ env_var('DATABASE_PORT') | as_number }}"
      dbname: "{{ env_var('DATABASE_NAME') }}"
      schema: public
      threads: 4
      keepalives_idle: 0
  target: dev
`;

    await writeFile(join(targetDir, 'config/profiles.yml'), profiles);

    // Sample staging model
    const stagingModel = `{{ config(materialized='view') }}

-- Sample staging model
-- This is where you would clean and standardize raw data

select
    id,
    name,
    email,
    created_at,
    updated_at
from {{ source('raw', 'users') }}
where created_at is not null
`;

    await writeFile(join(targetDir, 'data/dbt/models/staging/stg_users.sql'), stagingModel);

    // Schema file
    const schema = `version: 2

sources:
  - name: raw
    description: Raw data from various sources
    tables:
      - name: users
        description: Raw user data
        columns:
          - name: id
            description: Primary key
            tests:
              - unique
              - not_null
          - name: email
            description: User email address
            tests:
              - unique
              - not_null

models:
  - name: stg_users
    description: Staged user data with basic cleaning
    columns:
      - name: id
        description: Primary key
        tests:
          - unique
          - not_null
      - name: email
        description: User email address
        tests:
          - unique
          - not_null
`;

    await writeFile(join(targetDir, 'data/dbt/models/staging/schema.yml'), schema);
  }

  private async generateDagsterFiles(): Promise<void> {
    const { targetDir, name } = this.options;
    
    // Main Dagster definitions
    const definitions = `from dagster import Definitions, load_assets_from_modules

from . import assets

defs = Definitions(
    assets=load_assets_from_modules([assets]),
)
`;

    await writeFile(join(targetDir, 'data/dagster/__init__.py'), '');
    await writeFile(join(targetDir, 'data/dagster/definitions.py'), definitions);

    // Sample asset
    const assetsFile = `from dagster import asset
import pandas as pd


@asset
def sample_data():
    """Sample data asset to demonstrate Dagster functionality."""
    return pd.DataFrame({
        'id': [1, 2, 3],
        'name': ['Alice', 'Bob', 'Charlie'],
        'value': [100, 200, 300]
    })


@asset(deps=[sample_data])
def processed_data(sample_data: pd.DataFrame):
    """Process the sample data."""
    processed = sample_data.copy()
    processed['doubled_value'] = processed['value'] * 2
    return processed
`;

    await writeFile(join(targetDir, 'data/dagster/assets/__init__.py'), assetsFile);

    // pyproject.toml for Dagster
    const pyproject = `[build-system]
requires = ["setuptools", "wheel"]

[project]
name = "${name}-dagster"
version = "0.1.0"
dependencies = [
    "dagster",
    "dagster-webserver",
    "dagster-postgres",
    "pandas",
    "psycopg2-binary",
]

[tool.dagster]
code_location = "data.dagster.definitions"
`;

    await writeFile(join(targetDir, 'pyproject.toml'), pyproject);
  }

  private async generateSupabaseFiles(): Promise<void> {
    const { targetDir } = this.options;
    
    // Supabase config
    const supabaseConfig = `[api]
enabled = true
port = 54321

[db]
port = 54322

[studio]
enabled = true
port = 54323

[inbucket]
enabled = true
port = 54324

[storage]
enabled = true
file_size_limit = "50MiB"

[auth]
enabled = true
external_url = "http://localhost:3000"

[edge_functions]
enabled = true
`;

    await writeFile(join(targetDir, 'supabase/config.toml'), supabaseConfig);

    // Sample migration
    const migration = `-- Sample migration
-- This creates a basic users table

create table if not exists users (
    id uuid default gen_random_uuid() primary key,
    email text unique not null,
    name text,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table users enable row level security;

-- Create updated_at trigger
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger update_users_updated_at
    before update on users
    for each row
    execute function update_updated_at_column();
`;

    await writeFile(join(targetDir, 'supabase/migrations/001_initial_schema.sql'), migration);
  }

  private async generateReadme(): Promise<void> {
    const { targetDir, name } = this.options;
    
    const readme = `# ${name}

AI-assisted data pipeline project generated with [dataweave](https://github.com/yourusername/dataweave).

## Getting Started

### Prerequisites

- Python 3.8+
- Node.js 16+
- PostgreSQL (or Supabase account)

### Installation

1. Install dependencies:
   \`\`\`bash
   pip install -e .
   npm install
   \`\`\`

2. Set up environment variables:
   \`\`\`bash
   cp .env.example .env
   # Edit .env with your configuration
   \`\`\`

3. Initialize the database:
   \`\`\`bash
   # If using Supabase
   npx supabase start
   
   # If using local PostgreSQL
   createdb ${name}_dev
   \`\`\`

### Development

#### DBT

Run DBT models:
\`\`\`bash
cd data/dbt
dbt run
dbt test
\`\`\`

#### Dagster

Start Dagster web server:
\`\`\`bash
dagster dev -f data/dagster/definitions.py
\`\`\`

#### Dataweave Commands

\`\`\`bash
# Generate new DBT model
dataweave dbt model new --name my_model

# Generate new Dagster asset
dataweave dagster asset new --name my_asset

# AI-powered generation
dataweave ai generate "Create a model that calculates monthly revenue"

# Analyze existing code
dataweave analyze
\`\`\`

## Project Structure

\`\`\`
${name}/
├── data/                    # Data pipeline code
│   ├── dbt/                # DBT models and configuration
│   ├── dagster/            # Dagster assets and jobs
│   └── assets/             # Shared data assets
├── supabase/               # Supabase configuration and migrations
├── config/                 # Configuration files
├── scripts/                # Utility scripts
└── .dataweave/            # Dataweave configuration
\`\`\`

## Next Steps

1. Configure your database connection in \`.env\`
2. Update the DBT profile in \`config/profiles.yml\`
3. Run your first DBT models: \`cd data/dbt && dbt run\`
4. Start the Dagster web server: \`dagster dev\`
5. Explore AI-powered features: \`dataweave ai --help\`

## Documentation

- [DBT Documentation](https://docs.getdbt.com/)
- [Dagster Documentation](https://docs.dagster.io/)
- [Supabase Documentation](https://supabase.com/docs)
- [Dataweave Documentation](https://github.com/yourusername/dataweave)
`;

    await writeFile(join(targetDir, 'README.md'), readme);
  }
}