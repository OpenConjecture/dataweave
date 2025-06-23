import { describe, it, expect, beforeEach } from 'vitest';
import { AIEngine } from '../src/ai';

describe('AIEngine', () => {
  let aiEngine: AIEngine;

  beforeEach(() => {
    aiEngine = new AIEngine({
      provider: 'openai',
      apiKey: 'test-key',
      model: 'gpt-4',
      temperature: 0.7,
      maxTokens: 1000,
    });
  });

  describe('generateDbtModel', () => {
    it('should generate DBT model with mock provider', async () => {
      const result = await aiEngine.generateDbtModel(
        'Create a model that calculates user metrics'
      );
      
      expect(result).toHaveProperty('sql');
      expect(result).toHaveProperty('description');
      expect(result.sql).toContain('select');
      expect(result.sql).toContain('{{ config(materialized=\'view\') }}');
      expect(result.description).toContain('Sample DBT model');
    });

    it('should generate DBT model with context', async () => {
      const context = {
        tables: [
          {
            name: 'users',
            columns: [
              { name: 'id', type: 'bigint', primaryKey: true },
              { name: 'email', type: 'varchar' },
              { name: 'created_at', type: 'timestamp' },
            ],
          },
        ],
        projectName: 'test-project',
        dbType: 'postgres',
      };

      const result = await aiEngine.generateDbtModel(
        'Create a staging model for users',
        context
      );
      
      expect(result.sql).toBeTruthy();
      expect(result.description).toBeTruthy();
    });
  });

  describe('generateDagsterAsset', () => {
    it('should generate Dagster asset with mock provider', async () => {
      const result = await aiEngine.generateDagsterAsset(
        'Create an asset that processes user data'
      );
      
      expect(result).toHaveProperty('code');
      expect(result).toHaveProperty('description');
      expect(result.code).toContain('from dagster import asset');
      expect(result.code).toContain('@asset');
      expect(result.code).toContain('def sample_asset():');
      expect(result.description).toContain('Sample Dagster asset');
    });

    it('should generate Dagster asset with context', async () => {
      const context = {
        tables: [
          {
            name: 'orders',
            columns: [
              { name: 'id', type: 'bigint' },
              { name: 'user_id', type: 'bigint' },
              { name: 'amount', type: 'decimal' },
            ],
          },
        ],
      };

      const result = await aiEngine.generateDagsterAsset(
        'Process order data for analytics',
        context
      );
      
      expect(result.code).toBeTruthy();
      expect(result.description).toBeTruthy();
    });
  });

  describe('explainCode', () => {
    it('should explain SQL code', async () => {
      const sql = `
        select 
          user_id,
          count(*) as order_count,
          sum(amount) as total_amount
        from orders
        group by user_id
      `;

      const explanation = await aiEngine.explainCode(sql, 'sql');
      
      expect(explanation).toContain('Code Explanation');
      expect(explanation).toContain('sql');
      expect(explanation).toContain('transformations');
    });

    it('should explain Python code', async () => {
      const python = `
        import pandas as pd
        
        def process_data(df):
            return df.groupby('category').sum()
      `;

      const explanation = await aiEngine.explainCode(python, 'python');
      
      expect(explanation).toContain('Code Explanation');
      expect(explanation).toContain('python');
      expect(explanation).toContain('transformations');
    });
  });

  describe('optimizeCode', () => {
    it('should provide optimization suggestions for SQL', async () => {
      const sql = 'select * from huge_table where date > \'2023-01-01\'';

      const suggestions = await aiEngine.optimizeCode(sql, 'sql');
      
      expect(suggestions).toContain('Optimization Suggestions');
      expect(suggestions).toContain('Performance');
      expect(suggestions).toContain('indexes');
    });

    it('should provide optimization suggestions for Python', async () => {
      const python = 'for i in range(1000000): print(i)';

      const suggestions = await aiEngine.optimizeCode(python, 'python');
      
      expect(suggestions).toContain('Optimization Suggestions');
      expect(suggestions).toContain('Performance');
    });
  });

  describe('generateDocumentation', () => {
    it('should generate documentation for DBT model', async () => {
      const sql = `
        {{ config(materialized='table') }}
        
        select 
          user_id,
          count(*) as order_count,
          sum(amount) as total_revenue
        from {{ ref('stg_orders') }}
        group by user_id
      `;

      const docs = await aiEngine.generateDocumentation('user_metrics', sql);
      
      expect(docs).toContain('user_metrics');
      expect(docs).toContain('documentation');
      expect(docs).toBeTruthy();
    });
  });

  describe('buildDbtSystemPrompt', () => {
    it('should build system prompt without context', async () => {
      const engine = aiEngine as any; // Access private method
      const prompt = engine.buildDbtSystemPrompt({});
      
      expect(prompt).toContain('expert DBT developer');
      expect(prompt).toContain('Generate a DBT model');
      expect(prompt).toContain('best practices');
      expect(prompt).toContain('SQL');
    });

    it('should build system prompt with table context', async () => {
      const engine = aiEngine as any;
      const context = {
        tables: [
          {
            name: 'users',
            columns: [
              { name: 'id', type: 'bigint', primaryKey: true },
              { name: 'email', type: 'varchar', nullable: false },
            ],
          },
        ],
        projectName: 'test-project',
        dbType: 'PostgreSQL',
      };

      const prompt = engine.buildDbtSystemPrompt(context);
      
      expect(prompt).toContain('test-project');
      expect(prompt).toContain('PostgreSQL');
      expect(prompt).toContain('Table: users');
      expect(prompt).toContain('id: bigint (PK, NOT NULL)');
      expect(prompt).toContain('email: varchar (NOT NULL)');
    });

    it('should build system prompt with existing models', async () => {
      const engine = aiEngine as any;
      const context = {
        existingModels: ['stg_users', 'stg_orders'],
      };

      const prompt = engine.buildDbtSystemPrompt(context);
      
      expect(prompt).toContain('Existing models: stg_users, stg_orders');
    });
  });

  describe('buildDagsterSystemPrompt', () => {
    it('should build Dagster system prompt', async () => {
      const engine = aiEngine as any;
      const prompt = engine.buildDagsterSystemPrompt({});
      
      expect(prompt).toContain('expert Dagster developer');
      expect(prompt).toContain('Generate a Dagster asset');
      expect(prompt).toContain('Python code');
      expect(prompt).toContain('@asset');
    });
  });

  describe('parseDbtResponse', () => {
    it('should parse valid DBT response', async () => {
      const engine = aiEngine as any;
      const response = `Here's your DBT model:

\`\`\`sql
{{ config(materialized='view') }}

select * from users
\`\`\`

DESCRIPTION: A simple user model`;

      const result = engine.parseDbtResponse(response);
      
      expect(result.sql).toContain('select * from users');
      expect(result.sql).toContain('{{ config(materialized=\'view\') }}');
      expect(result.description).toBe('A simple user model');
    });

    it('should throw error for invalid DBT response', async () => {
      const engine = aiEngine as any;
      const response = 'No SQL code here';

      expect(() => engine.parseDbtResponse(response)).toThrow(
        'Could not parse SQL from AI response'
      );
    });

    it('should use default description when missing', async () => {
      const engine = aiEngine as any;
      const response = `\`\`\`sql
select * from users
\`\`\``;

      const result = engine.parseDbtResponse(response);
      
      expect(result.description).toBe('AI-generated DBT model');
    });
  });

  describe('parseDagsterResponse', () => {
    it('should parse valid Dagster response', async () => {
      const engine = aiEngine as any;
      const response = `Here's your Dagster asset:

\`\`\`python
from dagster import asset

@asset
def my_asset():
    return {"data": "value"}
\`\`\`

DESCRIPTION: A simple asset`;

      const result = engine.parseDagsterResponse(response);
      
      expect(result.code).toContain('@asset');
      expect(result.code).toContain('def my_asset():');
      expect(result.description).toBe('A simple asset');
    });

    it('should throw error for invalid Dagster response', async () => {
      const engine = aiEngine as any;
      const response = 'No Python code here';

      expect(() => engine.parseDagsterResponse(response)).toThrow(
        'Could not parse Python code from AI response'
      );
    });
  });

  describe('formatTableSchema', () => {
    it('should format table schema correctly', async () => {
      const engine = aiEngine as any;
      const table = {
        name: 'users',
        columns: [
          { name: 'id', type: 'bigint', primaryKey: true, nullable: false },
          { name: 'email', type: 'varchar', nullable: false },
          { name: 'name', type: 'varchar', nullable: true },
          { name: 'org_id', type: 'bigint', foreignKey: 'organizations.id', nullable: true },
        ],
      };

      const formatted = engine.formatTableSchema(table);
      
      expect(formatted).toContain('Table: users');
      expect(formatted).toContain('id: bigint (PK, NOT NULL)');
      expect(formatted).toContain('email: varchar (NOT NULL)');
      expect(formatted).toContain('name: varchar');
      expect(formatted).toContain('org_id: bigint (FK -> organizations.id)');
    });
  });

  describe('error handling', () => {
    it('should handle AI provider errors gracefully', async () => {
      // Test with invalid provider configuration
      const invalidEngine = new AIEngine({
        provider: 'anthropic' as any, // Not implemented
        apiKey: 'test',
      });

      await expect(
        invalidEngine.generateDbtModel('test prompt')
      ).rejects.toThrow('Anthropic provider not yet implemented');
    });
  });
});