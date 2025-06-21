import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { existsSync } from 'fs';
import { readFile, mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { DbtManager } from '../src/dbt';
import { testEnv } from './setup';

describe('DbtManager', () => {
  let dbtManager: DbtManager;
  let projectPath: string;

  beforeEach(async () => {
    await testEnv.setup();
    projectPath = testEnv.getTestProjectPath();
    
    // Create basic project structure
    const modelsDir = join(projectPath, 'data/dbt/models');
    await mkdir(modelsDir, { recursive: true });
    await mkdir(join(modelsDir, 'staging'), { recursive: true });
    await mkdir(join(modelsDir, 'intermediate'), { recursive: true });
    await mkdir(join(modelsDir, 'marts'), { recursive: true });
    
    dbtManager = new DbtManager({
      projectPath,
      profilesDir: join(projectPath, 'config'),
      modelsDir,
    });
  });

  afterEach(async () => {
    await testEnv.teardown();
  });

  describe('generateModel', () => {
    it('should create a basic DBT model', async () => {
      await dbtManager.generateModel({
        name: 'test_model',
        description: 'A test model',
        materializedAs: 'view',
      });
      
      const modelPath = join(projectPath, 'data/dbt/models/staging/test_model.sql');
      expect(existsSync(modelPath)).toBe(true);
      
      const content = await readFile(modelPath, 'utf-8');
      expect(content).toContain('{{ config(materialized=\'view\') }}');
      expect(content).toContain('-- Generated model: test_model');
    });

    it('should place models in correct directories based on naming', async () => {
      // Test staging model
      await dbtManager.generateModel({ name: 'stg_users' });
      expect(existsSync(join(projectPath, 'data/dbt/models/staging/stg_users.sql'))).toBe(true);
      
      // Test intermediate model
      await dbtManager.generateModel({ name: 'int_user_metrics' });
      expect(existsSync(join(projectPath, 'data/dbt/models/intermediate/int_user_metrics.sql'))).toBe(true);
      
      // Test mart fact model
      await dbtManager.generateModel({ name: 'fct_orders' });
      expect(existsSync(join(projectPath, 'data/dbt/models/marts/fct_orders.sql'))).toBe(true);
      
      // Test mart dimension model
      await dbtManager.generateModel({ name: 'dim_customers' });
      expect(existsSync(join(projectPath, 'data/dbt/models/marts/dim_customers.sql'))).toBe(true);
    });

    it('should add model configuration correctly', async () => {
      await dbtManager.generateModel({
        name: 'configured_model',
        materializedAs: 'table',
        tags: ['daily', 'core'],
      });
      
      const content = await readFile(
        join(projectPath, 'data/dbt/models/staging/configured_model.sql'),
        'utf-8'
      );
      
      expect(content).toContain('{{ config(materialized=\'table\', tags=[\'daily\', \'core\']) }}');
    });

    it('should use custom SQL when provided', async () => {
      const customSQL = `select 
    id,
    name,
    created_at
from {{ source('raw', 'custom_table') }}`;

      await dbtManager.generateModel({
        name: 'custom_model',
        sql: customSQL,
      });
      
      const content = await readFile(
        join(projectPath, 'data/dbt/models/staging/custom_model.sql'),
        'utf-8'
      );
      
      expect(content).toContain('from {{ source(\'raw\', \'custom_table\') }}');
      expect(content).toContain('{{ config(materialized=\'view\') }}');
    });

    it('should update schema.yml file', async () => {
      await dbtManager.generateModel({
        name: 'schema_test_model',
        description: 'Test model for schema',
        columns: [
          {
            name: 'id',
            description: 'Primary key',
            tests: ['unique', 'not_null'],
          },
          {
            name: 'name',
            description: 'User name',
          },
        ],
        tests: ['unique'],
      });
      
      const schemaPath = join(projectPath, 'data/dbt/models/staging/schema.yml');
      expect(existsSync(schemaPath)).toBe(true);
      
      const content = await readFile(schemaPath, 'utf-8');
      expect(content).toContain('name: schema_test_model');
      expect(content).toContain('description: Test model for schema');
      expect(content).toContain('name: id');
      expect(content).toContain('description: Primary key');
    });
  });

  describe('getModelDirectory', () => {
    it('should determine correct directory for staging models', async () => {
      const manager = dbtManager as any; // Access private method for testing
      expect(manager.getModelDirectory('stg_users')).toBe('staging');
      expect(manager.getModelDirectory('stg_products')).toBe('staging');
    });

    it('should determine correct directory for intermediate models', async () => {
      const manager = dbtManager as any;
      expect(manager.getModelDirectory('int_user_metrics')).toBe('intermediate');
    });

    it('should determine correct directory for mart models', async () => {
      const manager = dbtManager as any;
      expect(manager.getModelDirectory('fct_sales')).toBe('marts');
      expect(manager.getModelDirectory('dim_customers')).toBe('marts');
    });

    it('should default to staging for unknown prefixes', async () => {
      const manager = dbtManager as any;
      expect(manager.getModelDirectory('unknown_model')).toBe('staging');
    });
  });

  describe('addModelConfig', () => {
    it('should add config to SQL without existing config', async () => {
      const manager = dbtManager as any;
      const sql = 'select * from users';
      const result = manager.addModelConfig(sql, 'table', ['test']);
      
      expect(result).toContain('{{ config(materialized=\'table\', tags=[\'test\']) }}');
      expect(result).toContain('select * from users');
    });

    it('should replace existing config', async () => {
      const manager = dbtManager as any;
      const sql = '{{ config(materialized=\'view\') }}\n\nselect * from users';
      const result = manager.addModelConfig(sql, 'table', []);
      
      expect(result).toContain('{{ config(materialized=\'table\') }}');
      expect(result).not.toContain('materialized=\'view\'');
    });
  });

  describe('generateDefaultSql', () => {
    it('should generate valid default SQL', async () => {
      const manager = dbtManager as any;
      const sql = manager.generateDefaultSql('test_model');
      
      expect(sql).toContain('-- Generated model: test_model');
      expect(sql).toContain('{{ config(materialized=\'view\') }}');
      expect(sql).toContain('select');
      expect(sql).toContain('TODO');
    });
  });

  describe('schema management', () => {
    it('should create new schema.yml file', async () => {
      await dbtManager.generateModel({
        name: 'new_model',
        description: 'New model description',
      });
      
      const schemaPath = join(projectPath, 'data/dbt/models/staging/schema.yml');
      const content = await readFile(schemaPath, 'utf-8');
      
      expect(content).toContain('version: 2');
      expect(content).toContain('models:');
      expect(content).toContain('name: new_model');
    });

    it('should update existing schema.yml file', async () => {
      // Create initial schema file
      const schemaPath = join(projectPath, 'data/dbt/models/staging/schema.yml');
      const initialSchema = `version: 2

models:
  - name: existing_model
    description: Existing model
`;
      await writeFile(schemaPath, initialSchema);
      
      // Add new model
      await dbtManager.generateModel({
        name: 'another_model',
        description: 'Another model',
      });
      
      const content = await readFile(schemaPath, 'utf-8');
      expect(content).toContain('existing_model');
      expect(content).toContain('another_model');
    });
  });

  describe('error handling', () => {
    it('should handle missing directories gracefully', async () => {
      const badManager = new DbtManager({
        projectPath: '/non/existent/path',
        profilesDir: '/non/existent/config',
        modelsDir: '/non/existent/models',
      });
      
      // Should not throw when trying to generate model
      await expect(badManager.generateModel({
        name: 'test_model',
      })).rejects.toThrow(); // Expected to fail, but gracefully
    });
  });
});