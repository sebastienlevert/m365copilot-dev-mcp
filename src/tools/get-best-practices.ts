/**
 * Get Best Practices Tool
 * Retrieves the official Declarative Agent best practices from local documentation
 */

import { z } from 'zod';
import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createSuccessResult, createErrorResult } from '../utils/error-handler.js';
import { ToolResult } from '../types/atk.js';
import { info as logInfo, error as logError } from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..', '..');

const TYPESPEC_BEST_PRACTICES_PATH = join(PROJECT_ROOT, 'docs', 'TYPESPEC_BEST_PRACTICES.md');
const JSON_BEST_PRACTICES_PATH = join(PROJECT_ROOT, 'docs', 'JSON_BEST_PRACTICES.md');

export const GetBestPracticesSchema = z.object({
  type: z.enum(['typespec', 'json', 'both']).optional().default('typespec')
});

export type GetBestPracticesArgs = z.infer<typeof GetBestPracticesSchema>;

/**
 * Load best practices from local documentation
 */
async function loadBestPractices(type: 'typespec' | 'json' | 'both'): Promise<string> {
  try {
    logInfo(`Loading ${type} best practices from local documentation...`);

    if (type === 'both') {
      const [typespecContent, jsonContent] = await Promise.all([
        readFile(TYPESPEC_BEST_PRACTICES_PATH, 'utf-8'),
        readFile(JSON_BEST_PRACTICES_PATH, 'utf-8')
      ]);
      logInfo('Successfully loaded both best practices');
      return `# TypeSpec Best Practices\n\n${typespecContent}\n\n---\n\n# JSON Best Practices\n\n${jsonContent}`;
    } else if (type === 'typespec') {
      const content = await readFile(TYPESPEC_BEST_PRACTICES_PATH, 'utf-8');
      logInfo('Successfully loaded TypeSpec best practices');
      return content;
    } else {
      const content = await readFile(JSON_BEST_PRACTICES_PATH, 'utf-8');
      logInfo('Successfully loaded JSON best practices');
      return content;
    }
  } catch (err) {
    const error = err as Error;
    logError('Failed to load best practices', {
      type,
      error: error.message
    });
    throw new Error(`Failed to load best practices: ${error.message}`);
  }
}

/**
 * Execute get best practices
 */
export async function executeGetBestPracticesTool(rawArgs: unknown): Promise<ToolResult> {
  const args = GetBestPracticesSchema.parse(rawArgs);

  try {
    const content = await loadBestPractices(args.type);

    const typeLabel = args.type === 'both' ? 'TypeSpec and JSON' :
                      args.type === 'typespec' ? 'TypeSpec' : 'JSON';

    const successMessage = `# ${typeLabel} Declarative Agent Best Practices

> **Source**: Local Documentation (docs/${args.type === 'both' ? 'TYPESPEC_BEST_PRACTICES.md and JSON_BEST_PRACTICES.md' : args.type === 'typespec' ? 'TYPESPEC_BEST_PRACTICES.md' : 'JSON_BEST_PRACTICES.md'})
> **Location**: MCP Server Documentation

---

${content}

---

## What's Next?

Now that you have the best practices loaded, you can:

1. **Ask questions** about any of the patterns or practices
2. **Use other tools** like:
   - \`compile_typespec\` - Compile TypeSpec declarative agents
   - Other ATK tools for building and deploying agents
3. **Reference this guide** while building your declarative agent

All tools in this MCP server follow these best practices when generating code.`;

    return createSuccessResult(successMessage);

  } catch (error) {
    const err = error as Error;
    return createErrorResult({
      error: 'BestPracticesLoadFailed',
      reason: `Failed to load ${args.type} best practices: ${err.message}`,
      suggestion: 'Ensure the best practices markdown files exist in the docs/ folder.',
      details: {
        type: args.type,
        error: err.message
      }
    });
  }
}

export const getBestPracticesToolDefinition = {
  name: 'get_best_practices',
  description: `Gets best practices for building Microsoft 365 Copilot declarative agents. Call it for any code generation or operation involving declarative agents, TypeSpec, JSON manifests, API plugins, or capabilities. These best practices do not change so once it has been called during the current session, you do not need to invoke it again. Returns a markdown string.`,
  inputSchema: {
    type: 'object',
    properties: {
      type: {
        type: 'string',
        enum: ['typespec', 'json', 'both'],
        description: 'Type of best practices to load: typespec (default), json, or both',
        default: 'typespec'
      }
    },
    required: []
  }
};
