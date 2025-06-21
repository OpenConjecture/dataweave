import chalk from 'chalk';

export interface AIProvider {
  generate(prompt: string, context?: any): Promise<string>;
  explain(code: string, codeType: 'sql' | 'python'): Promise<string>;
  optimize(code: string, codeType: 'sql' | 'python'): Promise<string>;
}

export interface AIConfig {
  provider: 'openai' | 'anthropic' | 'local';
  apiKey?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface GenerationContext {
  tables?: TableSchema[];
  existingModels?: string[];
  projectName?: string;
  dbType?: string;
}

export interface TableSchema {
  name: string;
  columns: ColumnSchema[];
}

export interface ColumnSchema {
  name: string;
  type: string;
  nullable?: boolean;
  primaryKey?: boolean;
  foreignKey?: string;
}

export class AIEngine {
  private provider: AIProvider;
  private config: AIConfig;

  constructor(config: AIConfig) {
    this.config = config;
    this.provider = this.createProvider(config);
  }

  async generateDbtModel(prompt: string, context: GenerationContext = {}): Promise<{sql: string, description: string}> {
    console.log(chalk.blue('🤖 Generating DBT model with AI...'));
    
    const systemPrompt = this.buildDbtSystemPrompt(context);
    const fullPrompt = `${systemPrompt}\n\nUser Request: ${prompt}`;
    
    try {
      const response = await this.provider.generate(fullPrompt, context);
      const parsed = this.parseDbtResponse(response);
      
      console.log(chalk.green('✓ DBT model generated successfully'));
      return parsed;
    } catch (error) {
      console.error(chalk.red('❌ Failed to generate DBT model'));
      throw error;
    }
  }

  async generateDagsterAsset(prompt: string, context: GenerationContext = {}): Promise<{code: string, description: string}> {
    console.log(chalk.blue('🤖 Generating Dagster asset with AI...'));
    
    const systemPrompt = this.buildDagsterSystemPrompt(context);
    const fullPrompt = `${systemPrompt}\n\nUser Request: ${prompt}`;
    
    try {
      const response = await this.provider.generate(fullPrompt, context);
      const parsed = this.parseDagsterResponse(response);
      
      console.log(chalk.green('✓ Dagster asset generated successfully'));
      return parsed;
    } catch (error) {
      console.error(chalk.red('❌ Failed to generate Dagster asset'));
      throw error;
    }
  }

  async explainCode(code: string, codeType: 'sql' | 'python'): Promise<string> {
    console.log(chalk.blue('🤖 Explaining code with AI...'));
    
    try {
      const explanation = await this.provider.explain(code, codeType);
      console.log(chalk.green('✓ Code explanation generated'));
      return explanation;
    } catch (error) {
      console.error(chalk.red('❌ Failed to explain code'));
      throw error;
    }
  }

  async optimizeCode(code: string, codeType: 'sql' | 'python'): Promise<string> {
    console.log(chalk.blue('🤖 Optimizing code with AI...'));
    
    try {
      const optimized = await this.provider.optimize(code, codeType);
      console.log(chalk.green('✓ Code optimization suggestions generated'));
      return optimized;
    } catch (error) {
      console.error(chalk.red('❌ Failed to optimize code'));
      throw error;
    }
  }

  async generateDocumentation(modelName: string, sql: string): Promise<string> {
    console.log(chalk.blue('🤖 Generating documentation with AI...'));
    
    const prompt = `Generate comprehensive documentation for this DBT model:

Model Name: ${modelName}
SQL Code:
${sql}

Please provide:
1. A clear description of what this model does
2. Input sources and their purpose
3. Key transformations performed
4. Output schema and business meaning
5. Any important assumptions or limitations

Format the response as markdown.`;
    
    try {
      const documentation = await this.provider.generate(prompt);
      console.log(chalk.green('✓ Documentation generated'));
      return documentation;
    } catch (error) {
      console.error(chalk.red('❌ Failed to generate documentation'));
      throw error;
    }
  }

  private createProvider(config: AIConfig): AIProvider {
    switch (config.provider) {
      case 'openai':
        return new OpenAIProvider(config);
      case 'anthropic':
        return new AnthropicProvider(config);
      case 'local':
        return new LocalProvider(config);
      default:
        throw new Error(`Unsupported AI provider: ${config.provider}`);
    }
  }

  private buildDbtSystemPrompt(context: GenerationContext): string {
    const tableInfo = context.tables 
      ? `Available tables:\n${context.tables.map(t => this.formatTableSchema(t)).join('\n\n')}`
      : '';
    
    const existingModels = context.existingModels
      ? `Existing models: ${context.existingModels.join(', ')}`
      : '';
    
    return `You are an expert DBT developer. Generate a DBT model based on the user's request.

Context:
- Project: ${context.projectName || 'dataweave project'}
- Database: ${context.dbType || 'PostgreSQL'}
${tableInfo}
${existingModels}

Requirements:
1. Generate valid SQL that follows DBT best practices
2. Use appropriate DBT functions and macros
3. Include proper materialization strategy
4. Add meaningful column descriptions
5. Follow naming conventions (staging: stg_, intermediate: int_, marts: fct_/dim_)

Response format:
\`\`\`sql
-- Model description here
{{ config(materialized='view') }}

-- Your SQL here
\`\`\`

DESCRIPTION: Brief description of what the model does and its purpose.`;
  }

  private buildDagsterSystemPrompt(context: GenerationContext): string {
    const tableInfo = context.tables 
      ? `Available tables:\n${context.tables.map(t => this.formatTableSchema(t)).join('\n\n')}`
      : '';
    
    return `You are an expert Dagster developer. Generate a Dagster asset based on the user's request.

Context:
- Project: ${context.projectName || 'dataweave project'}
- Database: ${context.dbType || 'PostgreSQL'}
${tableInfo}

Requirements:
1. Generate valid Python code using Dagster decorators
2. Follow Dagster best practices for asset definitions
3. Include proper type hints and documentation
4. Use pandas for data manipulation when appropriate
5. Add meaningful asset descriptions

Response format:
\`\`\`python
from dagster import asset
import pandas as pd

@asset(description="Asset description here")
def asset_name():
    """
    Detailed docstring explaining the asset
    """
    # Your Python code here
    return data
\`\`\`

DESCRIPTION: Brief description of what the asset does and its purpose.`;
  }

  private formatTableSchema(table: TableSchema): string {
    const columns = table.columns.map(col => {
      const flags = [];
      if (col.primaryKey) flags.push('PK');
      if (col.foreignKey) flags.push(`FK -> ${col.foreignKey}`);
      if (!col.nullable) flags.push('NOT NULL');
      
      const flagStr = flags.length > 0 ? ` (${flags.join(', ')})` : '';
      return `  - ${col.name}: ${col.type}${flagStr}`;
    }).join('\n');
    
    return `Table: ${table.name}\n${columns}`;
  }

  private parseDbtResponse(response: string): {sql: string, description: string} {
    const sqlMatch = response.match(/```sql\n([\s\S]*?)\n```/);
    const descriptionMatch = response.match(/DESCRIPTION:\s*(.+)/);
    
    if (!sqlMatch) {
      throw new Error('Could not parse SQL from AI response');
    }
    
    return {
      sql: sqlMatch[1].trim(),
      description: descriptionMatch ? descriptionMatch[1].trim() : 'AI-generated DBT model'
    };
  }

  private parseDagsterResponse(response: string): {code: string, description: string} {
    const codeMatch = response.match(/```python\n([\s\S]*?)\n```/);
    const descriptionMatch = response.match(/DESCRIPTION:\s*(.+)/);
    
    if (!codeMatch) {
      throw new Error('Could not parse Python code from AI response');
    }
    
    return {
      code: codeMatch[1].trim(),
      description: descriptionMatch ? descriptionMatch[1].trim() : 'AI-generated Dagster asset'
    };
  }
}

// Mock provider for development - replace with actual OpenAI integration
class OpenAIProvider implements AIProvider {
  constructor(private config: AIConfig) {
    // Config stored as private property
  }

  async generate(prompt: string, _context?: any): Promise<string> {
    // Mock implementation - replace with actual OpenAI API call
    console.log(chalk.yellow('⚠️ Using mock OpenAI provider. Set OPENAI_API_KEY for real functionality.'));
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (prompt.includes('DBT model')) {
      return this.generateMockDbtResponse(prompt);
    } else if (prompt.includes('Dagster asset')) {
      return this.generateMockDagsterResponse(prompt);
    } else {
      return 'This is a mock response. Please configure a real AI provider.';
    }
  }

  async explain(_code: string, _codeType: 'sql' | 'python'): Promise<string> {
    console.log(chalk.yellow('⚠️ Using mock OpenAI provider. Set OPENAI_API_KEY for real functionality.'));
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return `## Code Explanation

This ${_codeType} code appears to:
1. Process data from input sources
2. Apply transformations and business logic
3. Return processed results

Note: This is a mock explanation. Configure a real AI provider for detailed analysis.`;
  }

  async optimize(_code: string, _codeType: 'sql' | 'python'): Promise<string> {
    console.log(chalk.yellow('⚠️ Using mock OpenAI provider. Set OPENAI_API_KEY for real functionality.'));
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return `## Optimization Suggestions

1. **Performance**: Consider adding indexes on frequently queried columns
2. **Readability**: Break complex queries into smaller, named components
3. **Maintainability**: Add comments explaining business logic

Note: This is a mock optimization. Configure a real AI provider for detailed suggestions.`;
  }

  private generateMockDbtResponse(prompt: string): string {
    return `\`\`\`sql
-- Generated DBT model based on user request
{{ config(materialized='view') }}

select
    id,
    name,
    email,
    created_at,
    updated_at
from {{ source('raw', 'users') }}
where created_at >= '2023-01-01'
\`\`\`

DESCRIPTION: Sample DBT model that selects user data with basic filtering.`;
  }

  private generateMockDagsterResponse(prompt: string): string {
    return `\`\`\`python
from dagster import asset
import pandas as pd

@asset(description="Sample data processing asset")
def sample_asset():
    """
    Processes sample data for analysis
    
    Returns:
        pd.DataFrame: Processed data
    """
    # Sample data processing
    data = pd.DataFrame({
        'id': [1, 2, 3],
        'value': [100, 200, 300]
    })
    
    # Apply transformations
    data['processed_value'] = data['value'] * 2
    
    return data
\`\`\`

DESCRIPTION: Sample Dagster asset that processes data and applies transformations.`;
  }
}

// Placeholder for other providers
class AnthropicProvider implements AIProvider {
  private config: AIConfig;

  constructor(config: AIConfig) {
    this.config = config;
    console.log(chalk.yellow('⚠️ Anthropic provider not yet implemented'));
  }

  async generate(prompt: string, _context?: any): Promise<string> {
    throw new Error('Anthropic provider not yet implemented');
  }

  async explain(_code: string, codeType: 'sql' | 'python'): Promise<string> {
    throw new Error('Anthropic provider not yet implemented');
  }

  async optimize(_code: string, _codeType: 'sql' | 'python'): Promise<string> {
    throw new Error('Anthropic provider not yet implemented');
  }
}

class LocalProvider implements AIProvider {
  private config: AIConfig;

  constructor(config: AIConfig) {
    this.config = config;
    console.log(chalk.yellow('⚠️ Local provider not yet implemented'));
  }

  async generate(prompt: string, _context?: any): Promise<string> {
    throw new Error('Local provider not yet implemented');
  }

  async explain(_code: string, codeType: 'sql' | 'python'): Promise<string> {
    throw new Error('Local provider not yet implemented');
  }

  async optimize(_code: string, _codeType: 'sql' | 'python'): Promise<string> {
    throw new Error('Local provider not yet implemented');
  }
}