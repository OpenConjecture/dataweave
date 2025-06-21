import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { testEnv } from './setup';

describe('CLI Integration Tests', () => {
  let testProjectPath: string;

  beforeEach(async () => {
    await testEnv.setup();
    testProjectPath = testEnv.getTestProjectPath();
  });

  afterEach(async () => {
    await testEnv.teardown();
  });

  const runCLI = (args: string[], cwd?: string) => {
    const command = `npx tsx src/cli.ts ${args.join(' ')}`;
    return execSync(command, {
      cwd: cwd || process.cwd(),
      encoding: 'utf-8',
      stdio: 'pipe',
    });
  };

  describe('Project Initialization', () => {
    it('should initialize a new project with default options', () => {
      const output = runCLI(['init', 'test-project'], testEnv.testDir);
      
      expect(output).toContain('Scaffolding dataweave project: test-project');
      expect(output).toContain('Successfully scaffolded project');
      
      // Check that project directory was created
      const projectPath = join(testEnv.testDir, 'test-project');
      expect(existsSync(projectPath)).toBe(true);
      expect(existsSync(join(projectPath, '.dataweave/config.json'))).toBe(true);
      expect(existsSync(join(projectPath, 'README.md'))).toBe(true);
    });

    it('should initialize project with specific template', () => {
      const output = runCLI(['init', 'template-project', '--template', 'default'], testEnv.testDir);
      
      expect(output).toContain('template-project');
      expect(output).toContain('Successfully scaffolded project');
    });

    it('should initialize project without specific features', () => {
      const output = runCLI(['init', 'minimal-project', '--no-dbt', '--no-dagster'], testEnv.testDir);
      
      expect(output).toContain('minimal-project');
      
      const projectPath = join(testEnv.testDir, 'minimal-project');
      expect(existsSync(join(projectPath, 'data/dbt/dbt_project.yml'))).toBe(false);
      expect(existsSync(join(projectPath, 'data/dagster/definitions.py'))).toBe(false);
    });

    it('should fail when directory already exists', () => {
      // Create project first
      runCLI(['init', 'existing-project'], testEnv.testDir);
      
      // Try to create again
      expect(() => {
        runCLI(['init', 'existing-project'], testEnv.testDir);
      }).toThrow(/already exists/);
    });
  });

  describe('DBT Commands', () => {
    beforeEach(() => {
      // Initialize project for DBT tests
      runCLI(['init', 'dbt-test-project'], testEnv.testDir);
      testProjectPath = join(testEnv.testDir, 'dbt-test-project');
    });

    it('should generate new DBT model', () => {
      const output = runCLI([
        'dbt:model:new', 'test_model',
        '--description', 'Test model description',
        '--materialized', 'table'
      ], testProjectPath);
      
      expect(output).toContain('Generated DBT model: test_model');
      
      const modelPath = join(testProjectPath, 'data/dbt/models/staging/test_model.sql');
      expect(existsSync(modelPath)).toBe(true);
    });

    it('should generate DBT model with custom SQL', async () => {
      const customSQL = 'select id, name from users';
      
      const output = runCLI([
        'dbt:model:new', 'custom_model',
        '--sql', customSQL
      ], testProjectPath);
      
      expect(output).toContain('Generated DBT model: custom_model');
      
      const content = await readFile(
        join(testProjectPath, 'data/dbt/models/staging/custom_model.sql'),
        'utf-8'
      );
      expect(content).toContain(customSQL);
    });

    it('should fail when no dataweave project exists', () => {
      expect(() => {
        runCLI(['dbt:model:new', 'test_model'], '/tmp');
      }).toThrow(/No dataweave project found/);
    });
  });

  describe('Dagster Commands', () => {
    beforeEach(() => {
      runCLI(['init', 'dagster-test-project'], testEnv.testDir);
      testProjectPath = join(testEnv.testDir, 'dagster-test-project');
    });

    it('should generate new Dagster asset', () => {
      const output = runCLI([
        'dagster:asset:new', 'test_asset',
        '--description', 'Test asset description',
        '--tags', 'daily,important'
      ], testProjectPath);
      
      expect(output).toContain('Generated Dagster asset: test_asset');
      
      const assetPath = join(testProjectPath, 'data/dagster/assets/test_asset.py');
      expect(existsSync(assetPath)).toBe(true);
    });

    it('should generate Dagster asset with dependencies', async () => {
      const output = runCLI([
        'dagster:asset:new', 'dependent_asset',
        '--deps', 'upstream1,upstream2'
      ], testProjectPath);
      
      expect(output).toContain('Generated Dagster asset: dependent_asset');
      
      const content = await readFile(
        join(testProjectPath, 'data/dagster/assets/dependent_asset.py'),
        'utf-8'
      );
      expect(content).toContain('upstream1');
      expect(content).toContain('upstream2');
    });

    it('should generate new Dagster job', () => {
      const output = runCLI([
        'dagster:job:new', 'test_job',
        '--description', 'Test job description'
      ], testProjectPath);
      
      expect(output).toContain('Generated Dagster job: test_job');
      
      const jobPath = join(testProjectPath, 'data/dagster/jobs/test_job.py');
      expect(existsSync(jobPath)).toBe(true);
    });

    it('should generate DBT asset integration', () => {
      const output = runCLI([
        'dagster:dbt:asset', 'stg_users'
      ], testProjectPath);
      
      expect(output).toContain('Generated Dagster asset for DBT model: stg_users');
      
      const assetPath = join(testProjectPath, 'data/dagster/assets/dbt_stg_users.py');
      expect(existsSync(assetPath)).toBe(true);
    });
  });

  describe('AI Commands', () => {
    beforeEach(() => {
      runCLI(['init', 'ai-test-project'], testEnv.testDir);
      testProjectPath = join(testEnv.testDir, 'ai-test-project');
    });

    it('should generate DBT model with AI', () => {
      const output = runCLI([
        'ai:generate:dbt', 'Create a model for user analytics'
      ], testProjectPath);
      
      expect(output).toContain('Generated SQL:');
      expect(output).toContain('Description:');
      expect(output).toContain('select');
    });

    it('should generate and create DBT model with AI when name provided', () => {
      const output = runCLI([
        'ai:generate:dbt', 'Create a model for user analytics',
        '--name', 'ai_user_analytics'
      ], testProjectPath);
      
      expect(output).toContain('Generated and created DBT model: ai_user_analytics');
      
      const modelPath = join(testProjectPath, 'data/dbt/models/staging/ai_user_analytics.sql');
      expect(existsSync(modelPath)).toBe(true);
    });

    it('should generate Dagster asset with AI', () => {
      const output = runCLI([
        'ai:generate:dagster', 'Create an asset that processes order data'
      ], testProjectPath);
      
      expect(output).toContain('Generated Python Code:');
      expect(output).toContain('Description:');
      expect(output).toContain('@asset');
    });

    it('should explain code files', async () => {
      // Create a sample SQL file
      const sampleSQL = 'select * from users where active = true';
      const sqlPath = join(testProjectPath, 'sample.sql');
      await require('fs/promises').writeFile(sqlPath, sampleSQL);
      
      const output = runCLI(['ai:explain', 'sample.sql'], testProjectPath);
      
      expect(output).toContain('AI Explanation:');
      expect(output).toContain('Code Explanation');
    });

    it('should optimize code files', async () => {
      const sampleSQL = 'select * from huge_table';
      const sqlPath = join(testProjectPath, 'sample.sql');
      await require('fs/promises').writeFile(sqlPath, sampleSQL);
      
      const output = runCLI(['ai:optimize', 'sample.sql'], testProjectPath);
      
      expect(output).toContain('AI Optimization Suggestions:');
      expect(output).toContain('Optimization Suggestions');
    });

    it('should fail to explain non-existent files', () => {
      expect(() => {
        runCLI(['ai:explain', 'non-existent.sql'], testProjectPath);
      }).toThrow(/File not found/);
    });
  });

  describe('Help and Info Commands', () => {
    it('should display help information', () => {
      const output = runCLI(['--help']);
      
      expect(output).toContain('AI-assisted CLI for modern data pipelines');
      expect(output).toContain('Commands:');
      expect(output).toContain('init');
      expect(output).toContain('dbt:model:new');
      expect(output).toContain('dagster:asset:new');
      expect(output).toContain('ai:generate:dbt');
    });

    it('should display version information', () => {
      const output = runCLI(['--version']);
      
      expect(output).toContain('0.0.1');
    });

    it('should display info command', () => {
      const output = runCLI(['info']);
      
      expect(output).toContain('About dataweave');
      expect(output).toContain('AI-assisted CLI');
      expect(output).toContain('data pipelines');
    });

    it('should display command-specific help', () => {
      const output = runCLI(['init', '--help']);
      
      expect(output).toContain('Initialize a new dataweave project');
      expect(output).toContain('--template');
      expect(output).toContain('--no-dbt');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid commands gracefully', () => {
      expect(() => {
        runCLI(['invalid-command']);
      }).toThrow(/Invalid command/);
    });

    it('should handle missing required arguments', () => {
      expect(() => {
        runCLI(['dbt:model:new']); // Missing model name
      }).toThrow();
    });
  });

  describe('Complex Workflows', () => {
    it('should support end-to-end workflow', async () => {
      // Initialize project
      runCLI(['init', 'e2e-project'], testEnv.testDir);
      const projectPath = join(testEnv.testDir, 'e2e-project');
      
      // Generate DBT model
      runCLI(['dbt:model:new', 'stg_users', '--materialized', 'view'], projectPath);
      
      // Generate Dagster asset
      runCLI(['dagster:asset:new', 'user_processor'], projectPath);
      
      // Generate DBT-Dagster integration
      runCLI(['dagster:dbt:asset', 'stg_users'], projectPath);
      
      // Verify all files exist
      expect(existsSync(join(projectPath, 'data/dbt/models/staging/stg_users.sql'))).toBe(true);
      expect(existsSync(join(projectPath, 'data/dagster/assets/user_processor.py'))).toBe(true);
      expect(existsSync(join(projectPath, 'data/dagster/assets/dbt_stg_users.py'))).toBe(true);
      
      // Verify init files are updated
      const assetsInit = await readFile(
        join(projectPath, 'data/dagster/assets/__init__.py'),
        'utf-8'
      );
      expect(assetsInit).toContain('user_processor');
      expect(assetsInit).toContain('dbt_stg_users');
    });
  });
});