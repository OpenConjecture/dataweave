import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { existsSync } from 'fs';
import { readFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { DagsterManager } from '../src/dagster';
import { testEnv } from './setup';

describe('DagsterManager', () => {
  let dagsterManager: DagsterManager;
  let projectPath: string;

  beforeEach(async () => {
    await testEnv.setup();
    projectPath = testEnv.getTestProjectPath();
    
    // Create basic project structure
    const dagsterPath = join(projectPath, 'data/dagster');
    const assetsPath = join(dagsterPath, 'assets');
    const jobsPath = join(dagsterPath, 'jobs');
    
    await mkdir(assetsPath, { recursive: true });
    await mkdir(jobsPath, { recursive: true });
    await mkdir(join(dagsterPath, 'schedules'), { recursive: true });
    
    dagsterManager = new DagsterManager({
      projectPath,
      dagsterPath,
      assetsPath,
      jobsPath,
    });
  });

  afterEach(async () => {
    await testEnv.teardown();
  });

  describe('generateAsset', () => {
    it('should create a basic Dagster asset', async () => {
      await dagsterManager.generateAsset({
        name: 'test_asset',
        description: 'A test asset',
      });
      
      const assetPath = join(projectPath, 'data/dagster/assets/test_asset.py');
      expect(existsSync(assetPath)).toBe(true);
      
      const content = await readFile(assetPath, 'utf-8');
      expect(content).toContain('from dagster import asset');
      expect(content).toContain('@asset');
      expect(content).toContain('def test_asset():');
      expect(content).toContain('A test asset');
    });

    it('should create asset with dependencies', async () => {
      await dagsterManager.generateAsset({
        name: 'dependent_asset',
        description: 'Asset with dependencies',
        dependencies: ['upstream_asset_1', 'upstream_asset_2'],
      });
      
      const content = await readFile(
        join(projectPath, 'data/dagster/assets/dependent_asset.py'),
        'utf-8'
      );
      
      expect(content).toContain('from dagster import AssetIn');
      expect(content).toContain('ins={"upstream_asset_1": AssetIn(), "upstream_asset_2": AssetIn()}');
      expect(content).toContain('def dependent_asset(upstream_asset_1: pd.DataFrame, upstream_asset_2: pd.DataFrame):');
    });

    it('should create asset with custom code', async () => {
      const customCode = `from dagster import asset
import pandas as pd

@asset
def custom_asset():
    return pd.DataFrame({'id': [1, 2, 3], 'value': [10, 20, 30]})`;

      await dagsterManager.generateAsset({
        name: 'custom_asset',
        code: customCode,
      });
      
      const content = await readFile(
        join(projectPath, 'data/dagster/assets/custom_asset.py'),
        'utf-8'
      );
      
      expect(content).toBe(customCode);
    });

    it('should create asset with configuration options', async () => {
      await dagsterManager.generateAsset({
        name: 'configured_asset',
        description: 'Configured asset',
        tags: ['daily', 'important'],
        compute_kind: 'pandas',
        io_manager: 'db_io_manager',
      });
      
      const content = await readFile(
        join(projectPath, 'data/dagster/assets/configured_asset.py'),
        'utf-8'
      );
      
      expect(content).toContain('tags={"daily", "important"}');
      expect(content).toContain('compute_kind="pandas"');
      expect(content).toContain('io_manager_key="db_io_manager"');
    });

    it('should update assets __init__.py file', async () => {
      await dagsterManager.generateAsset({
        name: 'init_test_asset',
      });
      
      const initPath = join(projectPath, 'data/dagster/assets/__init__.py');
      expect(existsSync(initPath)).toBe(true);
      
      const content = await readFile(initPath, 'utf-8');
      expect(content).toContain('from .init_test_asset import init_test_asset');
      expect(content).toContain('"init_test_asset"');
    });
  });

  describe('generateJob', () => {
    it('should create a basic Dagster job', async () => {
      await dagsterManager.generateJob({
        name: 'test_job',
        description: 'A test job',
      });
      
      const jobPath = join(projectPath, 'data/dagster/jobs/test_job.py');
      expect(existsSync(jobPath)).toBe(true);
      
      const content = await readFile(jobPath, 'utf-8');
      expect(content).toContain('from dagster import job, op');
      expect(content).toContain('@job');
      expect(content).toContain('def test_job():');
      expect(content).toContain('A test job');
    });

    it('should create job with assets', async () => {
      await dagsterManager.generateJob({
        name: 'asset_job',
        description: 'Job with assets',
        assets: ['asset_1', 'asset_2'],
      });
      
      const content = await readFile(
        join(projectPath, 'data/dagster/jobs/asset_job.py'),
        'utf-8'
      );
      
      expect(content).toContain('asset_1_op()');
      expect(content).toContain('asset_2_op()');
    });

    it('should create job with tags', async () => {
      await dagsterManager.generateJob({
        name: 'tagged_job',
        tags: ['hourly', 'etl'],
      });
      
      const content = await readFile(
        join(projectPath, 'data/dagster/jobs/tagged_job.py'),
        'utf-8'
      );
      
      expect(content).toContain('tags={"hourly", "etl"}');
    });
  });

  describe('generateDbtAsset', () => {
    it('should create a DBT asset', async () => {
      await dagsterManager.generateDbtAsset('stg_users');
      
      const assetPath = join(projectPath, 'data/dagster/assets/dbt_stg_users.py');
      expect(existsSync(assetPath)).toBe(true);
      
      const content = await readFile(assetPath, 'utf-8');
      expect(content).toContain('from dagster import asset');
      expect(content).toContain('@asset(compute_kind="dbt")');
      expect(content).toContain('def dbt_stg_users(');
      expect(content).toContain('Dagster asset for DBT model: stg_users');
    });
  });

  describe('generateDefaultAssetCode', () => {
    it('should generate basic asset code', async () => {
      const manager = dagsterManager as any; // Access private method
      const code = manager.generateDefaultAssetCode('basic_asset');
      
      expect(code).toContain('from dagster import asset');
      expect(code).toContain('@asset');
      expect(code).toContain('def basic_asset():');
      expect(code).toContain('return data');
    });

    it('should generate asset code with dependencies', async () => {
      const manager = dagsterManager as any;
      const code = manager.generateDefaultAssetCode(
        'dependent_asset',
        'Asset with deps',
        ['upstream_1', 'upstream_2']
      );
      
      expect(code).toContain('from dagster import AssetIn');
      expect(code).toContain('ins={"upstream_1": AssetIn(), "upstream_2": AssetIn()}');
      expect(code).toContain('def dependent_asset(upstream_1: pd.DataFrame, upstream_2: pd.DataFrame):');
    });

    it('should generate asset code with all options', async () => {
      const manager = dagsterManager as any;
      const code = manager.generateDefaultAssetCode(
        'full_asset',
        'Fully configured asset',
        ['dep1'],
        '2023-01-01', // partitions
        ['tag1', 'tag2'],
        'spark',
        'custom_io'
      );
      
      expect(code).toContain('tags={"tag1", "tag2"}');
      expect(code).toContain('compute_kind="spark"');
      expect(code).toContain('io_manager_key="custom_io"');
      expect(code).toContain('partitions_def=DailyPartitionsDefinition(start_date="2023-01-01")');
    });
  });

  describe('generateJobCode', () => {
    it('should generate basic job code', async () => {
      const manager = dagsterManager as any;
      const code = manager.generateJobCode('basic_job');
      
      expect(code).toContain('from dagster import job, op');
      expect(code).toContain('@job');
      expect(code).toContain('def basic_job():');
      expect(code).toContain('class Basic_jobConfig(Config):');
    });

    it('should generate job code with assets', async () => {
      const manager = dagsterManager as any;
      const code = manager.generateJobCode(
        'asset_job',
        'Job with assets',
        ['asset1', 'asset2']
      );
      
      expect(code).toContain('asset1_op()');
      expect(code).toContain('asset2_op()');
    });
  });

  describe('updateInitFile', () => {
    it('should create new __init__.py file', async () => {
      const manager = dagsterManager as any;
      const initPath = join(projectPath, 'data/dagster/assets/__init__.py');
      
      await manager.updateInitFile(initPath, 'test_asset', 'assets');
      
      expect(existsSync(initPath)).toBe(true);
      const content = await readFile(initPath, 'utf-8');
      expect(content).toContain('from .test_asset import test_asset');
      expect(content).toContain('__all__ = ["test_asset"]');
    });

    it('should update existing __init__.py file', async () => {
      const manager = dagsterManager as any;
      const initPath = join(projectPath, 'data/dagster/assets/__init__.py');
      
      // Create first asset
      await manager.updateInitFile(initPath, 'asset1', 'assets');
      
      // Add second asset
      await manager.updateInitFile(initPath, 'asset2', 'assets');
      
      const content = await readFile(initPath, 'utf-8');
      expect(content).toContain('from .asset1 import asset1');
      expect(content).toContain('from .asset2 import asset2');
      expect(content).toContain('asset1') && expect(content).toContain('asset2');
    });

    it('should not duplicate imports', async () => {
      const manager = dagsterManager as any;
      const initPath = join(projectPath, 'data/dagster/assets/__init__.py');
      
      // Add same asset twice
      await manager.updateInitFile(initPath, 'duplicate_asset', 'assets');
      await manager.updateInitFile(initPath, 'duplicate_asset', 'assets');
      
      const content = await readFile(initPath, 'utf-8');
      const importMatches = content.match(/from \.duplicate_asset import duplicate_asset/g);
      expect(importMatches).toHaveLength(1);
    });
  });

  describe('generateScheduleCode', () => {
    it('should generate schedule for asset', async () => {
      const manager = dagsterManager as any;
      const code = manager.generateScheduleCode('test_asset', '0 9 * * *', false);
      
      expect(code).toContain('@schedule(cron_schedule="0 9 * * *")');
      expect(code).toContain('def test_asset_schedule():');
      expect(code).toContain('RunRequest(asset_selection=[test_asset])');
    });

    it('should generate schedule for job', async () => {
      const manager = dagsterManager as any;
      const code = manager.generateScheduleCode('test_job', '0 9 * * *', true);
      
      expect(code).toContain('@schedule(cron_schedule="0 9 * * *", job=test_job)');
      expect(code).toContain('def test_job_schedule():');
      expect(code).toContain('return {}');
    });
  });
});