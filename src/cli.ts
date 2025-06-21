#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { join, resolve } from 'path';
import { existsSync } from 'fs';
import { readFile } from 'fs/promises';
import { ProjectScaffolder } from './scaffolding';
import { DbtManager } from './dbt';
import { DagsterManager } from './dagster';
import { AIEngine } from './ai';

const version = '0.0.1'; // Keep in sync with package.json

const program = new Command();

// Helper function to load dataweave config
async function loadDataweaveConfig(): Promise<any> {
  const configPath = join(process.cwd(), '.dataweave', 'config.json');
  
  if (!existsSync(configPath)) {
    throw new Error('No dataweave project found. Run "dataweave init" first.');
  }
  
  try {
    const configContent = await readFile(configPath, 'utf-8');
    return JSON.parse(configContent);
  } catch (error) {
    throw new Error(`Failed to load dataweave config: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Helper function to create DBT manager
async function createDbtManager(): Promise<DbtManager> {
  await loadDataweaveConfig(); // Validate config exists
  
  return new DbtManager({
    projectPath: process.cwd(),
    profilesDir: join(process.cwd(), 'config'),
    modelsDir: join(process.cwd(), 'data', 'dbt', 'models'),
  });
}

// Helper function to create Dagster manager
async function createDagsterManager(): Promise<DagsterManager> {
  await loadDataweaveConfig(); // Validate config exists
  
  return new DagsterManager({
    projectPath: process.cwd(),
    dagsterPath: join(process.cwd(), 'data', 'dagster'),
    assetsPath: join(process.cwd(), 'data', 'dagster', 'assets'),
    jobsPath: join(process.cwd(), 'data', 'dagster', 'jobs'),
  });
}

// Helper function to create AI engine
async function createAIEngine(): Promise<AIEngine> {
  const config = await loadDataweaveConfig();
  
  return new AIEngine({
    provider: config.ai?.provider || 'openai',
    apiKey: process.env.OPENAI_API_KEY,
    model: config.ai?.model || 'gpt-4',
    temperature: config.ai?.temperature || 0.7,
    maxTokens: config.ai?.maxTokens || 2000,
  });
}

// ASCII art logo
const logo = `
${chalk.cyan('╔═══════════════════════════════════════╗')}
${chalk.cyan('║')}  ${chalk.bold.white('dataweave')} ${chalk.gray(`v${version}`)}                 ${chalk.cyan('║')}
${chalk.cyan('║')}  ${chalk.gray('AI-Assisted Data Pipeline CLI')}       ${chalk.cyan('║')}
${chalk.cyan('╚═══════════════════════════════════════╝')}
`;

program
  .name('dataweave')
  .description('AI-assisted CLI for modern data pipelines with DBT, Dagster, and Supabase integration')
  .version(version);

// Init command
program
  .command('init [name]')
  .description('Initialize a new dataweave project')
  .option('-t, --template <template>', 'Project template', 'default')
  .option('--no-dbt', 'Skip DBT setup')
  .option('--no-dagster', 'Skip Dagster setup') 
  .option('--no-supabase', 'Skip Supabase setup')
  .action(async (name, options) => {
    console.log(logo);
    
    // Determine project name
    const projectName = name || 'my-dataweave-project';
    const targetDir = resolve(process.cwd(), projectName);
    
    // Check if directory already exists
    if (existsSync(targetDir)) {
      console.error(chalk.red(`\n❌ Directory ${projectName} already exists!`));
      process.exit(1);
    }
    
    const spinner = ora('Initializing dataweave project...').start();
    
    try {
      const scaffolder = new ProjectScaffolder({
        name: projectName,
        template: options.template,
        targetDir,
        includeDbt: options.dbt !== false,
        includeDagster: options.dagster !== false,
        includeSupabase: options.supabase !== false,
      });
      
      await scaffolder.scaffold();
      spinner.succeed('Project initialized successfully!');
      
    } catch (error) {
      spinner.fail('Failed to initialize project');
      console.error(chalk.red(`\n❌ Error: ${error instanceof Error ? error.message : String(error)}`));
      process.exit(1);
    }
  });

// DBT Commands
program
  .command('dbt:model:new <name>')
  .description('Generate a new DBT model')
  .option('-s, --sql <sql>', 'SQL content for the model')
  .option('-d, --description <desc>', 'Model description')
  .option('-m, --materialized <type>', 'Materialization type (table, view, incremental)', 'view')
  .option('--tags <tags>', 'Comma-separated list of tags')
  .action(async (name, options) => {
    console.log(logo);
    const spinner = ora('Generating DBT model...').start();
    
    try {
      const dbtManager = await createDbtManager();
      
      const modelOptions = {
        name,
        sql: options.sql,
        description: options.description,
        materializedAs: options.materialized as any,
        tags: options.tags ? options.tags.split(',').map((t: string) => t.trim()) : [],
      };
      
      await dbtManager.generateModel(modelOptions);
      spinner.succeed(`Generated DBT model: ${name}`);
      
    } catch (error) {
      spinner.fail('Failed to generate DBT model');
      console.error(chalk.red(`❌ Error: ${error instanceof Error ? error.message : String(error)}`));
      process.exit(1);
    }
  });

program
  .command('dbt:run [model]')
  .description('Run DBT models')
  .action(async (model) => {
    console.log(logo);
    const spinner = ora('Running DBT models...').start();
    
    try {
      const dbtManager = await createDbtManager();
      await dbtManager.runModel(model);
      spinner.succeed('DBT models executed successfully');
      
    } catch (error) {
      spinner.fail('Failed to run DBT models');
      console.error(chalk.red(`❌ Error: ${error instanceof Error ? error.message : String(error)}`));
      process.exit(1);
    }
  });

program
  .command('dbt:test [model]')
  .description('Test DBT models')
  .action(async (model) => {
    console.log(logo);
    const spinner = ora('Testing DBT models...').start();
    
    try {
      const dbtManager = await createDbtManager();
      await dbtManager.testModel(model);
      spinner.succeed('DBT tests passed');
      
    } catch (error) {
      spinner.fail('DBT tests failed');
      console.error(chalk.red(`❌ Error: ${error instanceof Error ? error.message : String(error)}`));
      process.exit(1);
    }
  });

program
  .command('dbt:compile [model]')
  .description('Compile DBT models')
  .action(async (model) => {
    console.log(logo);
    const spinner = ora('Compiling DBT models...').start();
    
    try {
      const dbtManager = await createDbtManager();
      await dbtManager.compileModel(model);
      spinner.succeed('DBT models compiled successfully');
      
    } catch (error) {
      spinner.fail('Failed to compile DBT models');
      console.error(chalk.red(`❌ Error: ${error instanceof Error ? error.message : String(error)}`));
      process.exit(1);
    }
  });

program
  .command('dbt:docs')
  .description('Generate and serve DBT documentation')
  .action(async () => {
    console.log(logo);
    const spinner = ora('Generating DBT documentation...').start();
    
    try {
      const dbtManager = await createDbtManager();
      await dbtManager.generateDocs();
      spinner.succeed('DBT documentation generated');
      
    } catch (error) {
      spinner.fail('Failed to generate DBT documentation');
      console.error(chalk.red(`❌ Error: ${error instanceof Error ? error.message : String(error)}`));
      process.exit(1);
    }
  });

program
  .command('dbt:introspect')
  .description('Introspect database schema')
  .action(async () => {
    console.log(logo);
    const spinner = ora('Introspecting database schema...').start();
    
    try {
      const dbtManager = await createDbtManager();
      const result = await dbtManager.introspectDatabase();
      spinner.succeed('Database introspection completed');
      
      if (result) {
        console.log(chalk.gray('\nDatabase schema information:'));
        console.log(result);
      }
      
    } catch (error) {
      spinner.fail('Failed to introspect database');
      console.error(chalk.red(`❌ Error: ${error instanceof Error ? error.message : String(error)}`));
      process.exit(1);
    }
  });

// Dagster Commands
program
  .command('dagster:asset:new <name>')
  .description('Generate a new Dagster asset')
  .option('-d, --description <desc>', 'Asset description')
  .option('--deps <dependencies>', 'Comma-separated list of dependencies')
  .option('--code <code>', 'Python code for the asset')
  .option('--schedule <schedule>', 'Cron schedule for the asset')
  .option('--tags <tags>', 'Comma-separated list of tags')
  .option('--compute-kind <kind>', 'Compute kind (e.g., pandas, spark)')
  .option('--io-manager <manager>', 'IO manager key')
  .action(async (name, options) => {
    console.log(logo);
    const spinner = ora('Generating Dagster asset...').start();
    
    try {
      const dagsterManager = await createDagsterManager();
      
      const assetOptions = {
        name,
        description: options.description,
        dependencies: options.deps ? options.deps.split(',').map((d: string) => d.trim()) : [],
        code: options.code,
        schedule: options.schedule,
        tags: options.tags ? options.tags.split(',').map((t: string) => t.trim()) : [],
        compute_kind: options.computeKind,
        io_manager: options.ioManager,
      };
      
      await dagsterManager.generateAsset(assetOptions);
      spinner.succeed(`Generated Dagster asset: ${name}`);
      
    } catch (error) {
      spinner.fail('Failed to generate Dagster asset');
      console.error(chalk.red(`❌ Error: ${error instanceof Error ? error.message : String(error)}`));
      process.exit(1);
    }
  });

program
  .command('dagster:job:new <name>')
  .description('Generate a new Dagster job')
  .option('-d, --description <desc>', 'Job description')
  .option('--assets <assets>', 'Comma-separated list of assets')
  .option('--schedule <schedule>', 'Cron schedule for the job')
  .option('--tags <tags>', 'Comma-separated list of tags')
  .action(async (name, options) => {
    console.log(logo);
    const spinner = ora('Generating Dagster job...').start();
    
    try {
      const dagsterManager = await createDagsterManager();
      
      const jobOptions = {
        name,
        description: options.description,
        assets: options.assets ? options.assets.split(',').map((a: string) => a.trim()) : [],
        schedule: options.schedule,
        tags: options.tags ? options.tags.split(',').map((t: string) => t.trim()) : [],
      };
      
      await dagsterManager.generateJob(jobOptions);
      spinner.succeed(`Generated Dagster job: ${name}`);
      
    } catch (error) {
      spinner.fail('Failed to generate Dagster job');
      console.error(chalk.red(`❌ Error: ${error instanceof Error ? error.message : String(error)}`));
      process.exit(1);
    }
  });

program
  .command('dagster:dbt:asset <model>')
  .description('Generate a Dagster asset for a DBT model')
  .action(async (model) => {
    console.log(logo);
    const spinner = ora('Generating Dagster asset for DBT model...').start();
    
    try {
      const dagsterManager = await createDagsterManager();
      await dagsterManager.generateDbtAsset(model);
      spinner.succeed(`Generated Dagster asset for DBT model: ${model}`);
      
    } catch (error) {
      spinner.fail('Failed to generate Dagster asset for DBT model');
      console.error(chalk.red(`❌ Error: ${error instanceof Error ? error.message : String(error)}`));
      process.exit(1);
    }
  });

program
  .command('dagster:run:asset <name>')
  .description('Run a specific Dagster asset')
  .action(async (name) => {
    console.log(logo);
    const spinner = ora(`Running Dagster asset: ${name}...`).start();
    
    try {
      const dagsterManager = await createDagsterManager();
      await dagsterManager.runAsset(name);
      spinner.succeed(`Dagster asset executed: ${name}`);
      
    } catch (error) {
      spinner.fail('Failed to run Dagster asset');
      console.error(chalk.red(`❌ Error: ${error instanceof Error ? error.message : String(error)}`));
      process.exit(1);
    }
  });

program
  .command('dagster:run:job <name>')
  .description('Run a specific Dagster job')
  .action(async (name) => {
    console.log(logo);
    const spinner = ora(`Running Dagster job: ${name}...`).start();
    
    try {
      const dagsterManager = await createDagsterManager();
      await dagsterManager.runJob(name);
      spinner.succeed(`Dagster job executed: ${name}`);
      
    } catch (error) {
      spinner.fail('Failed to run Dagster job');
      console.error(chalk.red(`❌ Error: ${error instanceof Error ? error.message : String(error)}`));
      process.exit(1);
    }
  });

program
  .command('dagster:dev')
  .description('Start Dagster development server')
  .option('-p, --port <port>', 'Port number', '3000')
  .action(async (options) => {
    console.log(logo);
    const spinner = ora('Starting Dagster development server...').start();
    
    try {
      const dagsterManager = await createDagsterManager();
      await dagsterManager.startDagster(parseInt(options.port));
      spinner.succeed('Dagster development server started');
      
    } catch (error) {
      spinner.fail('Failed to start Dagster development server');
      console.error(chalk.red(`❌ Error: ${error instanceof Error ? error.message : String(error)}`));
      process.exit(1);
    }
  });

program
  .command('dagster:validate')
  .description('Validate Dagster pipeline configuration')
  .action(async () => {
    console.log(logo);
    const spinner = ora('Validating Dagster pipeline...').start();
    
    try {
      const dagsterManager = await createDagsterManager();
      await dagsterManager.validatePipeline();
      spinner.succeed('Dagster pipeline validation passed');
      
    } catch (error) {
      spinner.fail('Dagster pipeline validation failed');
      console.error(chalk.red(`❌ Error: ${error instanceof Error ? error.message : String(error)}`));
      process.exit(1);
    }
  });

// Scaffold command (placeholder)
program
  .command('scaffold <type>')
  .description('Scaffold a new component (model, asset, job, etc.)')
  .action(async (type) => {
    console.log(logo);
    console.log(chalk.blue(`📦 Scaffolding ${type}...`));
    console.log(chalk.yellow('\n🚧 Coming soon: AI-powered scaffolding for:'));
    console.log(chalk.gray('  • DBT models'));
    console.log(chalk.gray('  • Dagster assets'));
    console.log(chalk.gray('  • Pipeline jobs'));
    console.log(chalk.gray('  • Tests and documentation'));
  });

// AI Commands
program
  .command('ai:generate:dbt <prompt>')
  .description('Generate a DBT model using AI')
  .option('-n, --name <name>', 'Model name')
  .option('--tables <tables>', 'Comma-separated list of available tables')
  .action(async (prompt, options) => {
    console.log(logo);
    const spinner = ora('Generating DBT model with AI...').start();
    
    try {
      const aiEngine = await createAIEngine();
      const dbtManager = await createDbtManager();
      
      const context = {
        projectName: 'dataweave',
        tables: options.tables ? options.tables.split(',').map((t: string) => ({
          name: t.trim(),
          columns: [] // In a real implementation, this would be introspected
        })) : [],
      };
      
      const result = await aiEngine.generateDbtModel(prompt, context);
      
      if (options.name) {
        // Create the model directly
        await dbtManager.generateModel({
          name: options.name,
          sql: result.sql,
          description: result.description,
        });
        spinner.succeed(`Generated and created DBT model: ${options.name}`);
      } else {
        spinner.succeed('DBT model generated');
        console.log(chalk.blue('\n📊 Generated SQL:'));
        console.log(result.sql);
        console.log(chalk.blue('\n📝 Description:'));
        console.log(result.description);
        console.log(chalk.gray('\nTo create this model, run:'));
        console.log(chalk.gray(`dataweave dbt:model:new <name> --sql "${result.sql.replace(/"/g, '\\"')}"`));
      }
      
    } catch (error) {
      spinner.fail('Failed to generate DBT model');
      console.error(chalk.red(`❌ Error: ${error instanceof Error ? error.message : String(error)}`));
      process.exit(1);
    }
  });

program
  .command('ai:generate:dagster <prompt>')
  .description('Generate a Dagster asset using AI')
  .option('-n, --name <name>', 'Asset name')
  .option('--tables <tables>', 'Comma-separated list of available tables')
  .action(async (prompt, options) => {
    console.log(logo);
    const spinner = ora('Generating Dagster asset with AI...').start();
    
    try {
      const aiEngine = await createAIEngine();
      const dagsterManager = await createDagsterManager();
      
      const context = {
        projectName: 'dataweave',
        tables: options.tables ? options.tables.split(',').map((t: string) => ({
          name: t.trim(),
          columns: [] // In a real implementation, this would be introspected
        })) : [],
      };
      
      const result = await aiEngine.generateDagsterAsset(prompt, context);
      
      if (options.name) {
        // Create the asset directly
        await dagsterManager.generateAsset({
          name: options.name,
          code: result.code,
          description: result.description,
        });
        spinner.succeed(`Generated and created Dagster asset: ${options.name}`);
      } else {
        spinner.succeed('Dagster asset generated');
        console.log(chalk.blue('\n⚡ Generated Python Code:'));
        console.log(result.code);
        console.log(chalk.blue('\n📝 Description:'));
        console.log(result.description);
        console.log(chalk.gray('\nTo create this asset, run:'));
        console.log(chalk.gray(`dataweave dagster:asset:new <name> --code "${result.code.replace(/"/g, '\\"')}"`));
      }
      
    } catch (error) {
      spinner.fail('Failed to generate Dagster asset');
      console.error(chalk.red(`❌ Error: ${error instanceof Error ? error.message : String(error)}`));
      process.exit(1);
    }
  });

program
  .command('ai:explain <file>')
  .description('Explain code using AI')
  .action(async (file) => {
    console.log(logo);
    const spinner = ora('Analyzing code with AI...').start();
    
    try {
      const filePath = resolve(process.cwd(), file);
      
      if (!existsSync(filePath)) {
        throw new Error(`File not found: ${file}`);
      }
      
      const code = await readFile(filePath, 'utf-8');
      const codeType = file.endsWith('.sql') ? 'sql' : 'python';
      
      const aiEngine = await createAIEngine();
      const explanation = await aiEngine.explainCode(code, codeType);
      
      spinner.succeed('Code explanation generated');
      console.log(chalk.blue('\n🤖 AI Explanation:'));
      console.log(explanation);
      
    } catch (error) {
      spinner.fail('Failed to explain code');
      console.error(chalk.red(`❌ Error: ${error instanceof Error ? error.message : String(error)}`));
      process.exit(1);
    }
  });

program
  .command('ai:optimize <file>')
  .description('Get optimization suggestions using AI')
  .action(async (file) => {
    console.log(logo);
    const spinner = ora('Analyzing code for optimizations...').start();
    
    try {
      const filePath = resolve(process.cwd(), file);
      
      if (!existsSync(filePath)) {
        throw new Error(`File not found: ${file}`);
      }
      
      const code = await readFile(filePath, 'utf-8');
      const codeType = file.endsWith('.sql') ? 'sql' : 'python';
      
      const aiEngine = await createAIEngine();
      const suggestions = await aiEngine.optimizeCode(code, codeType);
      
      spinner.succeed('Optimization suggestions generated');
      console.log(chalk.blue('\n🚀 AI Optimization Suggestions:'));
      console.log(suggestions);
      
    } catch (error) {
      spinner.fail('Failed to generate optimization suggestions');
      console.error(chalk.red(`❌ Error: ${error instanceof Error ? error.message : String(error)}`));
      process.exit(1);
    }
  });

program
  .command('ai:document <model>')
  .description('Generate documentation for a DBT model using AI')
  .action(async (model) => {
    console.log(logo);
    const spinner = ora('Generating documentation with AI...').start();
    
    try {
      // In a real implementation, you'd use glob to find the model file
      // For now, assume it's in staging
      const stagingPath = join(process.cwd(), 'data', 'dbt', 'models', 'staging', `${model}.sql`);
      
      if (!existsSync(stagingPath)) {
        throw new Error(`DBT model not found: ${model}`);
      }
      
      const sql = await readFile(stagingPath, 'utf-8');
      
      const aiEngine = await createAIEngine();
      const documentation = await aiEngine.generateDocumentation(model, sql);
      
      spinner.succeed('Documentation generated');
      console.log(chalk.blue('\n📚 AI-Generated Documentation:'));
      console.log(documentation);
      
      // Optionally save to file
      console.log(chalk.gray('\nSave this documentation to your model\'s schema.yml or README.md'));
      
    } catch (error) {
      spinner.fail('Failed to generate documentation');
      console.error(chalk.red(`❌ Error: ${error instanceof Error ? error.message : String(error)}`));
      process.exit(1);
    }
  });

// Info command
program
  .command('info')
  .description('Display information about dataweave')
  .action(() => {
    console.log(logo);
    console.log(chalk.bold('\n📊 About dataweave'));
    console.log(chalk.gray('\nDataweave is an AI-assisted CLI for building modern data pipelines.'));
    console.log(chalk.gray('It seamlessly integrates DBT, Dagster, and Supabase with intelligent'));
    console.log(chalk.gray('code generation and scaffolding capabilities.'));
    console.log(chalk.gray('\nDesigned for data engineers, ML engineers, and indie developers who'));
    console.log(chalk.gray('want to accelerate their data pipeline development with AI assistance.'));
    console.log(chalk.blue('\n🔗 Links:'));
    console.log(chalk.gray('  Documentation: Coming soon'));
    console.log(chalk.gray('  GitHub: https://github.com/yourusername/dataweave'));
    console.log(chalk.gray('  npm: https://www.npmjs.com/package/dataweave'));
  });

// Handle unknown commands
program.on('command:*', () => {
  console.error(chalk.red('\nInvalid command: %s'), program.args.join(' '));
  console.log('See --help for a list of available commands.\n');
  process.exit(1);
});

// Show help if no command provided
if (!process.argv.slice(2).length) {
  console.log(logo);
  program.outputHelp();
}

program.parse(process.argv);