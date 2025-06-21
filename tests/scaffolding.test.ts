import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { existsSync } from 'fs';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { ProjectScaffolder } from '../src/scaffolding';
import { testEnv } from './setup';

describe('ProjectScaffolder', () => {
  beforeEach(async () => {
    await testEnv.setup();
  });

  afterEach(async () => {
    await testEnv.teardown();
  });

  it('should create a basic project structure', async () => {
    const projectPath = testEnv.getTestProjectPath();
    
    const scaffolder = new ProjectScaffolder({
      name: 'test-project',
      template: 'default',
      targetDir: projectPath,
      includeDbt: true,
      includeDagster: true,
      includeSupabase: true,
    });
    
    await scaffolder.scaffold();
    
    // Check main directories exist
    expect(existsSync(join(projectPath, 'data'))).toBe(true);
    expect(existsSync(join(projectPath, 'data/dbt'))).toBe(true);
    expect(existsSync(join(projectPath, 'data/dagster'))).toBe(true);
    expect(existsSync(join(projectPath, 'supabase'))).toBe(true);
    expect(existsSync(join(projectPath, '.dataweave'))).toBe(true);
    expect(existsSync(join(projectPath, 'config'))).toBe(true);
  });

  it('should generate valid configuration files', async () => {
    const projectPath = testEnv.getTestProjectPath();
    
    const scaffolder = new ProjectScaffolder({
      name: 'test-project',
      template: 'default', 
      targetDir: projectPath,
    });
    
    await scaffolder.scaffold();
    
    // Check dataweave config
    const configPath = join(projectPath, '.dataweave/config.json');
    expect(existsSync(configPath)).toBe(true);
    
    const config = JSON.parse(await readFile(configPath, 'utf-8'));
    expect(config.name).toBe('test-project');
    expect(config.version).toBe('1.0.0');
    expect(config.dbt.enabled).toBe(true);
    expect(config.dagster.enabled).toBe(true);
    expect(config.supabase.enabled).toBe(true);
  });

  it('should generate DBT project files', async () => {
    const projectPath = testEnv.getTestProjectPath();
    
    const scaffolder = new ProjectScaffolder({
      name: 'test-project',
      template: 'default',
      targetDir: projectPath,
      includeDbt: true,
    });
    
    await scaffolder.scaffold();
    
    // Check DBT files
    expect(existsSync(join(projectPath, 'data/dbt/dbt_project.yml'))).toBe(true);
    expect(existsSync(join(projectPath, 'config/profiles.yml'))).toBe(true);
    expect(existsSync(join(projectPath, 'data/dbt/models/staging/stg_users.sql'))).toBe(true);
    expect(existsSync(join(projectPath, 'data/dbt/models/staging/schema.yml'))).toBe(true);
    
    // Validate DBT project content
    const dbtProject = await readFile(join(projectPath, 'data/dbt/dbt_project.yml'), 'utf-8');
    expect(dbtProject).toContain('name: \'test-project\'');
    expect(dbtProject).toContain('version: \'1.0.0\'');
  });

  it('should generate Dagster files', async () => {
    const projectPath = testEnv.getTestProjectPath();
    
    const scaffolder = new ProjectScaffolder({
      name: 'test-project',
      template: 'default',
      targetDir: projectPath,
      includeDagster: true,
    });
    
    await scaffolder.scaffold();
    
    // Check Dagster files
    expect(existsSync(join(projectPath, 'data/dagster/__init__.py'))).toBe(true);
    expect(existsSync(join(projectPath, 'data/dagster/definitions.py'))).toBe(true);
    expect(existsSync(join(projectPath, 'data/dagster/assets/__init__.py'))).toBe(true);
    expect(existsSync(join(projectPath, 'pyproject.toml'))).toBe(true);
    
    // Validate Dagster content
    const definitions = await readFile(join(projectPath, 'data/dagster/definitions.py'), 'utf-8');
    expect(definitions).toContain('from dagster import Definitions');
    expect(definitions).toContain('load_assets_from_modules');
  });

  it('should generate Supabase files', async () => {
    const projectPath = testEnv.getTestProjectPath();
    
    const scaffolder = new ProjectScaffolder({
      name: 'test-project',
      template: 'default',
      targetDir: projectPath,
      includeSupabase: true,
    });
    
    await scaffolder.scaffold();
    
    // Check Supabase files
    expect(existsSync(join(projectPath, 'supabase/config.toml'))).toBe(true);
    expect(existsSync(join(projectPath, 'supabase/migrations/001_initial_schema.sql'))).toBe(true);
    
    // Validate Supabase migration
    const migration = await readFile(join(projectPath, 'supabase/migrations/001_initial_schema.sql'), 'utf-8');
    expect(migration).toContain('create table if not exists users');
    expect(migration).toContain('Row Level Security');
  });

  it('should generate README with proper content', async () => {
    const projectPath = testEnv.getTestProjectPath();
    
    const scaffolder = new ProjectScaffolder({
      name: 'my-awesome-project',
      template: 'default',
      targetDir: projectPath,
    });
    
    await scaffolder.scaffold();
    
    const readme = await readFile(join(projectPath, 'README.md'), 'utf-8');
    expect(readme).toContain('# my-awesome-project');
    expect(readme).toContain('dataweave');
    expect(readme).toContain('Getting Started');
    expect(readme).toContain('Development');
  });

  it('should respect feature flags', async () => {
    const projectPath = testEnv.getTestProjectPath();
    
    const scaffolder = new ProjectScaffolder({
      name: 'minimal-project',
      template: 'default',
      targetDir: projectPath,
      includeDbt: false,
      includeDagster: false,
      includeSupabase: false,
    });
    
    await scaffolder.scaffold();
    
    // Should have basic structure but not feature-specific files
    expect(existsSync(join(projectPath, '.dataweave'))).toBe(true);
    expect(existsSync(join(projectPath, 'README.md'))).toBe(true);
    
    // Should not have feature-specific files
    expect(existsSync(join(projectPath, 'data/dbt/dbt_project.yml'))).toBe(false);
    expect(existsSync(join(projectPath, 'data/dagster/definitions.py'))).toBe(false);
    expect(existsSync(join(projectPath, 'supabase/config.toml'))).toBe(false);
  });

  it('should generate valid .env.example', async () => {
    const projectPath = testEnv.getTestProjectPath();
    
    const scaffolder = new ProjectScaffolder({
      name: 'test-project',
      template: 'default',
      targetDir: projectPath,
    });
    
    await scaffolder.scaffold();
    
    const envExample = await readFile(join(projectPath, '.env.example'), 'utf-8');
    expect(envExample).toContain('DATABASE_URL=');
    expect(envExample).toContain('SUPABASE_URL=');
    expect(envExample).toContain('OPENAI_API_KEY=');
    expect(envExample).toContain('DAGSTER_HOME=');
  });
});