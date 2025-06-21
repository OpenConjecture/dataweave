import { writeFile, readFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { spawn } from 'child_process';
import chalk from 'chalk';

export interface DagsterAssetOptions {
  name: string;
  description?: string;
  dependencies?: string[];
  code?: string;
  partitions?: string;
  schedule?: string;
  tags?: string[];
  compute_kind?: string;
  io_manager?: string;
}

export interface DagsterJobOptions {
  name: string;
  description?: string;
  assets?: string[];
  schedule?: string;
  tags?: string[];
}

export interface DagsterConfig {
  projectPath: string;
  dagsterPath: string;
  assetsPath: string;
  jobsPath: string;
}

export class DagsterManager {
  private config: DagsterConfig;

  constructor(config: DagsterConfig) {
    this.config = config;
  }

  async generateAsset(options: DagsterAssetOptions): Promise<void> {
    const { name, description, dependencies = [], code, partitions, schedule, tags = [], compute_kind, io_manager } = options;
    
    console.log(chalk.blue(`⚡ Generating Dagster asset: ${name}`));
    
    // Ensure assets directory exists
    if (!existsSync(this.config.assetsPath)) {
      await mkdir(this.config.assetsPath, { recursive: true });
    }
    
    // Generate asset code
    const assetCode = code || this.generateDefaultAssetCode(name, description, dependencies, partitions, tags, compute_kind, io_manager);
    
    // Write asset file
    const assetPath = join(this.config.assetsPath, `${name}.py`);
    await writeFile(assetPath, assetCode);
    
    // Update __init__.py to include the new asset
    await this.updateAssetsInit(name);
    
    // Create schedule if specified
    if (schedule) {
      await this.generateSchedule(name, schedule);
    }
    
    console.log(chalk.green(`✓ Created Dagster asset: ${name}`));
  }

  async generateJob(options: DagsterJobOptions): Promise<void> {
    const { name, description, assets = [], schedule, tags = [] } = options;
    
    console.log(chalk.blue(`🔧 Generating Dagster job: ${name}`));
    
    // Ensure jobs directory exists
    if (!existsSync(this.config.jobsPath)) {
      await mkdir(this.config.jobsPath, { recursive: true });
    }
    
    // Generate job code
    const jobCode = this.generateJobCode(name, description, assets, tags);
    
    // Write job file
    const jobPath = join(this.config.jobsPath, `${name}.py`);
    await writeFile(jobPath, jobCode);
    
    // Update __init__.py to include the new job
    await this.updateJobsInit(name);
    
    // Create schedule if specified
    if (schedule) {
      await this.generateSchedule(name, schedule, true);
    }
    
    console.log(chalk.green(`✓ Created Dagster job: ${name}`));
  }

  async generateDbtAsset(modelName: string): Promise<void> {
    console.log(chalk.blue(`📊 Generating Dagster asset for DBT model: ${modelName}`));
    
    const assetCode = this.generateDbtAssetCode(modelName);
    const assetPath = join(this.config.assetsPath, `dbt_${modelName}.py`);
    
    await writeFile(assetPath, assetCode);
    await this.updateAssetsInit(`dbt_${modelName}`);
    
    console.log(chalk.green(`✓ Created Dagster asset for DBT model: ${modelName}`));
  }

  async runAsset(assetName: string): Promise<void> {
    console.log(chalk.blue(`🚀 Running Dagster asset: ${assetName}`));
    await this.executeDagsterCommand(['asset', 'materialize', '--select', assetName]);
  }

  async runJob(jobName: string): Promise<void> {
    console.log(chalk.blue(`🚀 Running Dagster job: ${jobName}`));
    await this.executeDagsterCommand(['job', 'execute', '--job', jobName]);
  }

  async startDagster(port: number = 3000): Promise<void> {
    console.log(chalk.blue(`🌐 Starting Dagster web server on port ${port}...`));
    await this.executeDagsterCommand(['dev', '--port', port.toString()]);
  }

  async validatePipeline(): Promise<void> {
    console.log(chalk.blue('🔍 Validating Dagster pipeline...'));
    await this.executeDagsterCommand(['pipeline', 'validate']);
  }

  private generateDefaultAssetCode(name: string, description?: string, dependencies: string[] = [], partitions?: string, tags: string[] = [], compute_kind?: string, io_manager?: string): string {
    const imports = [
      'from dagster import asset',
      'import pandas as pd',
    ];
    
    if (partitions) {
      imports.push('from dagster import DailyPartitionsDefinition');
    }
    
    if (dependencies.length > 0) {
      imports.push('from dagster import AssetIn');
    }
    
    const decoratorOptions: string[] = [];
    
    if (dependencies.length > 0) {
      const depsStr = dependencies.map(dep => `"${dep}": AssetIn()`).join(', ');
      decoratorOptions.push(`ins={${depsStr}}`);
    }
    
    if (description) {
      decoratorOptions.push(`description="${description}"`);
    }
    
    if (tags.length > 0) {
      decoratorOptions.push(`tags={${tags.map(tag => `"${tag}"`).join(', ')}}`);
    }
    
    if (compute_kind) {
      decoratorOptions.push(`compute_kind="${compute_kind}"`);
    }
    
    if (io_manager) {
      decoratorOptions.push(`io_manager_key="${io_manager}"`);
    }
    
    if (partitions) {
      decoratorOptions.push(`partitions_def=DailyPartitionsDefinition(start_date="${partitions}")`);
    }
    
    const decorator = decoratorOptions.length > 0 
      ? `@asset(${decoratorOptions.join(', ')})`
      : '@asset';
    
    const functionParams = dependencies.length > 0 
      ? dependencies.map(dep => `${dep}: pd.DataFrame`).join(', ')
      : '';
    
    const defaultLogic = dependencies.length > 0
      ? `    # Process input data
    processed_data = pd.DataFrame()
    
    # TODO: Add your asset logic here
    # Example: processed_data = ${dependencies[0]}.copy()
    
    return processed_data`
      : `    # TODO: Add your asset logic here
    # Example: Load data from external source
    data = pd.DataFrame({
        'id': [1, 2, 3],
        'value': [100, 200, 300]
    })
    
    return data`;
    
    return `${imports.join('\n')}


${decorator}
def ${name}(${functionParams}):
    """
    ${description || `Asset: ${name}`}
    
    Returns:
        pd.DataFrame: Processed data
    """
${defaultLogic}
`;
  }

  private generateJobCode(name: string, description?: string, assets: string[] = [], tags: string[] = []): string {
    const imports = [
      'from dagster import job, op',
      'from dagster import Config',
    ];
    
    if (assets.length > 0) {
      imports.push('from dagster import AssetMaterialization');
    }
    
    const jobOptions: string[] = [];
    
    if (description) {
      jobOptions.push(`description="${description}"`);
    }
    
    if (tags.length > 0) {
      jobOptions.push(`tags={${tags.map(tag => `"${tag}"`).join(', ')}}`);
    }
    
    const decorator = jobOptions.length > 0 
      ? `@job(${jobOptions.join(', ')})`
      : '@job';
    
    const assetOps = assets.length > 0 
      ? assets.map(asset => `    ${asset}_op()`).join('\n')
      : '    # TODO: Add your ops here\n    pass';
    
    return `${imports.join('\n')}


class ${name.charAt(0).toUpperCase() + name.slice(1)}Config(Config):
    """Configuration for ${name} job"""
    # TODO: Add configuration parameters
    pass


@op
def ${name}_op(config: ${name.charAt(0).toUpperCase() + name.slice(1)}Config):
    """Main operation for ${name} job"""
    # TODO: Add your operation logic here
    pass


${decorator}
def ${name}():
    """
    ${description || `Job: ${name}`}
    """
${assetOps}
`;
  }

  private generateDbtAssetCode(modelName: string): string {
    return `from dagster import asset
from dagster_dbt import dbt_assets, DbtCliResource
from dagster import Config
import pandas as pd


class DbtConfig(Config):
    """Configuration for DBT operations"""
    profiles_dir: str = "config"
    project_dir: str = "data/dbt"


@asset(compute_kind="dbt")
def dbt_${modelName}(config: DbtConfig) -> pd.DataFrame:
    """
    Dagster asset for DBT model: ${modelName}
    
    This asset runs the DBT model and returns the results.
    """
    # TODO: Implement DBT model execution
    # This is a placeholder - in production you'd use dagster-dbt integration
    
    # For now, return empty DataFrame
    return pd.DataFrame()


# Alternative: Use dagster-dbt integration (recommended for production)
# @dbt_assets(
#     manifest=dbt_manifest_path,
#     select="${modelName}",
#     compute_kind="dbt"
# )
# def dbt_${modelName}_assets(context: AssetExecutionContext, dbt: DbtCliResource):
#     yield from dbt.cli(["build"], context=context).stream()
`;
  }

  private async generateSchedule(assetOrJobName: string, schedule: string, isJob: boolean = false): Promise<void> {
    const schedulesPath = join(this.config.dagsterPath, 'schedules');
    
    if (!existsSync(schedulesPath)) {
      await mkdir(schedulesPath, { recursive: true });
    }
    
    const scheduleCode = this.generateScheduleCode(assetOrJobName, schedule, isJob);
    const schedulePath = join(schedulesPath, `${assetOrJobName}_schedule.py`);
    
    await writeFile(schedulePath, scheduleCode);
    
    // Update schedules __init__.py
    await this.updateSchedulesInit(`${assetOrJobName}_schedule`);
  }

  private generateScheduleCode(assetOrJobName: string, schedule: string, isJob: boolean): string {
    const imports = isJob 
      ? `from dagster import schedule\nfrom ..jobs.${assetOrJobName} import ${assetOrJobName}`
      : `from dagster import schedule, RunRequest\nfrom ..assets.${assetOrJobName} import ${assetOrJobName}`;
    
    const scheduleFunction = isJob
      ? `@schedule(cron_schedule="${schedule}", job=${assetOrJobName})
def ${assetOrJobName}_schedule():
    """Schedule for ${assetOrJobName} job"""
    return {}`
      : `@schedule(cron_schedule="${schedule}")
def ${assetOrJobName}_schedule():
    """Schedule for ${assetOrJobName} asset"""
    return RunRequest(asset_selection=[${assetOrJobName}])`;
    
    return `${imports}


${scheduleFunction}
`;
  }

  private async updateAssetsInit(assetName: string): Promise<void> {
    const initPath = join(this.config.assetsPath, '__init__.py');
    await this.updateInitFile(initPath, assetName, 'assets');
  }

  private async updateJobsInit(jobName: string): Promise<void> {
    const initPath = join(this.config.jobsPath, '__init__.py');
    await this.updateInitFile(initPath, jobName, 'jobs');
  }

  private async updateSchedulesInit(scheduleName: string): Promise<void> {
    const initPath = join(this.config.dagsterPath, 'schedules', '__init__.py');
    await this.updateInitFile(initPath, scheduleName, 'schedules');
  }

  private async updateInitFile(initPath: string, itemName: string, _itemType: string): Promise<void> {
    let content = '';
    
    if (existsSync(initPath)) {
      content = await readFile(initPath, 'utf-8');
    }
    
    // Check if import already exists
    const importLine = `from .${itemName} import ${itemName}`;
    if (content.includes(importLine)) {
      return; // Already imported
    }
    
    // Add import
    content += `${importLine}\n`;
    
    // Add to __all__ if it exists, otherwise create it
    const allMatch = content.match(/__all__\s*=\s*\[(.*?)\]/s);
    if (allMatch) {
      const existingItems = allMatch[1].split(',').map(item => item.trim().replace(/['"]/g, ''));
      if (!existingItems.includes(itemName)) {
        const updatedItems = [...existingItems.filter(item => item), `"${itemName}"`];
        content = content.replace(/__all__\s*=\s*\[(.*?)\]/s, `__all__ = [${updatedItems.join(', ')}]`);
      }
    } else {
      content += `\n__all__ = ["${itemName}"]\n`;
    }
    
    await writeFile(initPath, content);
  }

  private async executeDagsterCommand(args: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      const dagster = spawn('dagster', args, {
        cwd: this.config.projectPath,
        stdio: 'inherit',
      });

      dagster.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Dagster command failed with exit code ${code}`));
        }
      });

      dagster.on('error', (error) => {
        reject(new Error(`Failed to execute Dagster command: ${error.message}`));
      });
    });
  }
}