import { writeFile, readFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { spawn } from 'child_process';
import chalk from 'chalk';

export interface DbtModelOptions {
  name: string;
  sql?: string;
  description?: string;
  materializedAs?: 'table' | 'view' | 'incremental' | 'ephemeral';
  columns?: DbtColumn[];
  tests?: string[];
  tags?: string[];
}

export interface DbtColumn {
  name: string;
  description?: string;
  type?: string;
  tests?: string[];
}

export interface DbtConfig {
  projectPath: string;
  profilesDir: string;
  modelsDir: string;
}

export class DbtManager {
  private config: DbtConfig;

  constructor(config: DbtConfig) {
    this.config = config;
  }

  async generateModel(options: DbtModelOptions): Promise<void> {
    const { name, sql, description, materializedAs = 'view', columns = [], tests = [], tags = [] } = options;
    
    console.log(chalk.blue(`📊 Generating DBT model: ${name}`));
    
    // Determine model directory based on naming convention
    const modelDir = this.getModelDirectory(name);
    const modelPath = join(this.config.modelsDir, modelDir);
    
    // Ensure directory exists
    if (!existsSync(modelPath)) {
      await mkdir(modelPath, { recursive: true });
    }
    
    // Generate SQL file
    const sqlContent = sql || this.generateDefaultSql(name);
    const sqlWithConfig = this.addModelConfig(sqlContent, materializedAs, tags);
    
    await writeFile(join(modelPath, `${name}.sql`), sqlWithConfig);
    
    // Update or create schema.yml
    await this.updateSchema(modelDir, name, description || '', columns, tests);
    
    console.log(chalk.green(`✓ Created model ${name} in ${modelDir}/`));
  }

  async runModel(modelName?: string): Promise<void> {
    const command = modelName ? `dbt run --select ${modelName}` : 'dbt run';
    console.log(chalk.blue(`🚀 Running: ${command}`));
    
    await this.executeDbtCommand(['run'].concat(modelName ? ['--select', modelName] : []));
  }

  async testModel(modelName?: string): Promise<void> {
    const command = modelName ? `dbt test --select ${modelName}` : 'dbt test';
    console.log(chalk.blue(`🧪 Testing: ${command}`));
    
    await this.executeDbtCommand(['test'].concat(modelName ? ['--select', modelName] : []));
  }

  async compileModel(modelName?: string): Promise<void> {
    const command = modelName ? `dbt compile --select ${modelName}` : 'dbt compile';
    console.log(chalk.blue(`⚙️ Compiling: ${command}`));
    
    await this.executeDbtCommand(['compile'].concat(modelName ? ['--select', modelName] : []));
  }

  async generateDocs(): Promise<void> {
    console.log(chalk.blue('📚 Generating DBT documentation...'));
    
    await this.executeDbtCommand(['docs', 'generate']);
    await this.executeDbtCommand(['docs', 'serve', '--port', '8001']);
    
    console.log(chalk.green('✓ Documentation available at http://localhost:8001'));
  }

  async introspectDatabase(): Promise<any> {
    console.log(chalk.blue('🔍 Introspecting database schema...'));
    
    try {
      // Run dbt debug to check connection first
      await this.executeDbtCommand(['debug']);
      
      // Get available sources from database
      const sourcesPath = join(this.config.modelsDir, 'sources.yml');
      
      if (existsSync(sourcesPath)) {
        const sourcesContent = await readFile(sourcesPath, 'utf-8');
        console.log(chalk.green('✓ Found existing sources configuration'));
        return sourcesContent;
      } else {
        console.log(chalk.yellow('⚠️ No sources.yml found. Consider running dbt source to introspect your database.'));
        return null;
      }
    } catch (error) {
      console.error(chalk.red('❌ Database introspection failed:'), error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  private getModelDirectory(modelName: string): string {
    // Determine directory based on naming convention
    if (modelName.startsWith('stg_')) {
      return 'staging';
    } else if (modelName.startsWith('int_')) {
      return 'intermediate';
    } else if (modelName.startsWith('fct_') || modelName.startsWith('dim_')) {
      return 'marts';
    } else {
      return 'staging'; // Default to staging
    }
  }

  private generateDefaultSql(modelName: string): string {
    return `-- Generated model: ${modelName}
-- TODO: Replace this with your actual SQL logic

{{ config(materialized='view') }}

select
    1 as id,
    'sample' as name,
    current_timestamp as created_at

-- TODO: Add your transformations here
-- Uncomment and modify the following example:
-- from {{ ref('source_table') }}
-- where condition = 'value'
`;
  }

  private addModelConfig(sql: string, materializedAs: string, tags: string[]): string {
    const configOptions = [`materialized='${materializedAs}'`];
    
    if (tags.length > 0) {
      configOptions.push(`tags=['${tags.join("', '")}']`);
    }
    
    const configLine = `{{ config(${configOptions.join(', ')}) }}`;
    
    // If SQL already has a config, replace it, otherwise add it at the top
    if (sql.includes('{{ config(')) {
      return sql.replace(/\{\{ config\([^}]+\) \}\}/, configLine);
    } else {
      const lines = sql.split('\n');
      const firstNonCommentLine = lines.findIndex(line => 
        line.trim() && !line.trim().startsWith('--')
      );
      
      if (firstNonCommentLine === -1) {
        return `${configLine}\n\n${sql}`;
      } else {
        lines.splice(firstNonCommentLine, 0, configLine, '');
        return lines.join('\n');
      }
    }
  }

  private async updateSchema(modelDir: string, modelName: string, description: string, columns: DbtColumn[], tests: string[]): Promise<void> {
    const schemaPath = join(this.config.modelsDir, modelDir, 'schema.yml');
    
    let schemaData: any = { version: 2, models: [] };
    
    // Read existing schema if it exists
    if (existsSync(schemaPath)) {
      try {
        const existingContent = await readFile(schemaPath, 'utf-8');
        // Simple YAML parsing for basic structure
        // In a production system, you'd want to use a proper YAML parser
        schemaData = this.parseBasicYaml(existingContent);
      } catch (error) {
        console.warn(chalk.yellow(`⚠️ Failed to parse existing schema.yml: ${error instanceof Error ? error.message : String(error)}`));
      }
    }
    
    // Find or create model entry
    let modelEntry = schemaData.models.find((m: any) => m.name === modelName);
    if (!modelEntry) {
      modelEntry = { name: modelName };
      schemaData.models.push(modelEntry);
    }
    
    // Update model properties
    if (description) {
      modelEntry.description = description;
    }
    
    if (tests.length > 0) {
      modelEntry.tests = tests;
    }
    
    if (columns.length > 0) {
      modelEntry.columns = columns.map(col => ({
        name: col.name,
        description: col.description,
        tests: col.tests || []
      }));
    }
    
    // Write back to file
    const yamlContent = this.generateBasicYaml(schemaData);
    await writeFile(schemaPath, yamlContent);
  }

  private parseBasicYaml(content: string): any {
    // Very basic YAML parsing - in production use a proper YAML library
    try {
      const lines = content.split('\n');
      const result: any = { version: 2, models: [] };
      
      let currentModel: any = null;
      let currentColumns: any[] = [];
      let inColumns = false;
      
      for (const line of lines) {
        const trimmed = line.trim();
        
        if (trimmed.startsWith('- name:') && !inColumns) {
          if (currentModel) {
            if (currentColumns.length > 0) {
              currentModel.columns = currentColumns;
            }
            result.models.push(currentModel);
          }
          currentModel = { name: trimmed.split(':')[1].trim() };
          currentColumns = [];
          inColumns = false;
        } else if (trimmed.startsWith('description:') && currentModel) {
          currentModel.description = trimmed.split(':').slice(1).join(':').trim();
        } else if (trimmed === 'columns:') {
          inColumns = true;
        } else if (trimmed.startsWith('- name:') && inColumns) {
          currentColumns.push({ name: trimmed.split(':')[1].trim() });
        }
      }
      
      if (currentModel) {
        if (currentColumns.length > 0) {
          currentModel.columns = currentColumns;
        }
        result.models.push(currentModel);
      }
      
      return result;
    } catch (error) {
      return { version: 2, models: [] };
    }
  }

  private generateBasicYaml(data: any): string {
    let yaml = `version: ${data.version}\n\nmodels:\n`;
    
    for (const model of data.models) {
      yaml += `  - name: ${model.name}\n`;
      
      if (model.description) {
        yaml += `    description: ${model.description}\n`;
      }
      
      if (model.tests && model.tests.length > 0) {
        yaml += '    tests:\n';
        for (const test of model.tests) {
          yaml += `      - ${test}\n`;
        }
      }
      
      if (model.columns && model.columns.length > 0) {
        yaml += '    columns:\n';
        for (const column of model.columns) {
          yaml += `      - name: ${column.name}\n`;
          if (column.description) {
            yaml += `        description: ${column.description}\n`;
          }
          if (column.tests && column.tests.length > 0) {
            yaml += '        tests:\n';
            for (const test of column.tests) {
              yaml += `          - ${test}\n`;
            }
          }
        }
      }
      
      yaml += '\n';
    }
    
    return yaml;
  }

  private async executeDbtCommand(args: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      const dbt = spawn('dbt', args, {
        cwd: this.config.projectPath,
        env: {
          ...process.env,
          DBT_PROFILES_DIR: this.config.profilesDir,
        },
        stdio: 'inherit',
      });

      dbt.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`dbt command failed with exit code ${code}`));
        }
      });

      dbt.on('error', (error) => {
        reject(new Error(`Failed to execute dbt command: ${error instanceof Error ? error.message : String(error)}`));
      });
    });
  }
}