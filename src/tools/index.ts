/**
 * Tool registry and exports
 * Provides centralized tool management for MCP server
 */

import { compileTypeSpecToolDefinition, executeCompileTypeSpecTool, CompileTypeSpecSchema, CompileTypeSpecArgs } from './compile-typespec.js';
import { getBestPracticesToolDefinition, executeGetBestPracticesTool, GetBestPracticesSchema, GetBestPracticesArgs } from './get-best-practices.js';
import { ToolResult } from '../types/atk.js';
import { createErrorResult } from '../utils/error-handler.js';
import { error as logError } from '../utils/logger.js';

/**
 * Tool definition type
 */
export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
}

/**
 * Tool executor function type
 */
type ToolExecutor = (args: any) => Promise<ToolResult>;

/**
 * Tool registry mapping tool names to their executors and schemas
 */
interface ToolRegistryEntry {
  definition: ToolDefinition;
  executor: ToolExecutor;
  schema: any;
}

const toolRegistry: Map<string, ToolRegistryEntry> = new Map([
  ['compile_typespec', {
    definition: compileTypeSpecToolDefinition,
    executor: executeCompileTypeSpecTool,
    schema: CompileTypeSpecSchema
  }],
  ['get_best_practices', {
    definition: getBestPracticesToolDefinition,
    executor: executeGetBestPracticesTool,
    schema: GetBestPracticesSchema
  }]
]);

/**
 * Get all tool definitions
 */
export function listTools(): ToolDefinition[] {
  return Array.from(toolRegistry.values()).map(entry => entry.definition);
}

/**
 * Execute a tool by name
 * @param name Tool name
 * @param args Tool arguments
 * @param onProgress Optional progress callback
 */
export async function callTool(
  name: string,
  args: any,
  onProgress?: (message: string, level?: 'info' | 'error') => void
): Promise<ToolResult> {
  const entry = toolRegistry.get(name);

  if (!entry) {
    logError(`Tool not found: ${name}`);
    return createErrorResult({
      error: 'ToolNotFound',
      reason: `Tool '${name}' is not registered`,
      suggestion: `Available tools: ${Array.from(toolRegistry.keys()).join(', ')}`,
      details: { requestedTool: name }
    });
  }

  try {
    // Validate arguments using Zod schema
    const validatedArgs = entry.schema.parse(args);

    // Add progress callback to args if provided
    if (onProgress) {
      validatedArgs._onProgress = onProgress;
    }

    // Execute the tool
    return await entry.executor(validatedArgs);

  } catch (err) {
    const error = err as Error;
    logError(`Tool execution failed: ${name}`, {
      error: error.message,
      stack: error.stack
    });

    // Handle Zod validation errors
    if (error.name === 'ZodError') {
      return createErrorResult({
        error: 'InvalidArguments',
        reason: 'Tool arguments validation failed',
        suggestion: 'Check the tool input schema and provide valid arguments',
        details: {
          tool: name,
          validationError: error.message
        }
      });
    }

    // Handle other errors
    return createErrorResult({
      error: 'ToolExecutionError',
      reason: `Failed to execute tool: ${error.message}`,
      suggestion: 'Check the error details and try again. Run `npx -p @microsoft/m365agentstoolkit-cli@latest atk doctor` to verify system setup.',
      details: {
        tool: name,
        error: error.message,
        stack: error.stack
      }
    });
  }
}

/**
 * Get tool definition by name
 */
export function getTool(name: string): ToolDefinition | undefined {
  const entry = toolRegistry.get(name);
  return entry?.definition;
}

/**
 * Check if tool exists
 */
export function hasTool(name: string): boolean {
  return toolRegistry.has(name);
}

// Export all tool schemas and executors for direct use if needed
export {
  CompileTypeSpecSchema,
  GetBestPracticesSchema,
  executeCompileTypeSpecTool,
  executeGetBestPracticesTool
};

// Export type definitions
export type {
  CompileTypeSpecArgs,
  GetBestPracticesArgs
};
