/**
 * Type definitions for ATK CLI operations
 */

/**
 * ATK project templates
 * Focus on declarative agents with TypeSpec
 */
export enum ATKTemplate {
  DECLARATIVE_AGENT = 'declarative-agent'
}

/**
 * Declarative agent format
 * TypeSpec provides type-safe agent and API definitions
 * JSON provides simple configuration-based agents
 */
export enum DeclarativeAgentFormat {
  TYPESPEC = 'typespec',
  JSON = 'json'
}

/**
 * Common environments
 */
export enum Environment {
  LOCAL = 'local',
  DEV = 'dev',
  STAGING = 'staging',
  PROD = 'prod'
}

/**
 * Progress callback for CLI execution
 */
export type ProgressCallback = (message: string, level?: 'info' | 'error') => void;

/**
 * CLI execution options
 */
export interface CLIExecutionOptions {
  command: string;
  args: string[];
  cwd?: string;
  env?: Record<string, string>;
  timeout?: number;
  onProgress?: ProgressCallback;
}

/**
 * CLI execution result
 */
export interface CLIExecutionResult {
  success: boolean;
  stdout: string;
  stderr: string;
  exitCode: number;
  error?: Error;
}

/**
 * Structured error response
 */
export interface StructuredError {
  error: string;
  reason: string;
  suggestion: string;
  documentation?: string;
  details?: any;
}

/**
 * ATK command timeouts (milliseconds)
 */
export const ATK_TIMEOUTS = {
  new: 60000,        // 1 minute
  validate: 30000,   // 30 seconds
  doctor: 30000,     // 30 seconds
  provision: 600000, // 10 minutes
  deploy: 600000,    // 10 minutes
  package: 120000,   // 2 minutes
  publish: 300000,   // 5 minutes
  auth: 120000       // 2 minutes
} as const;

/**
 * MCP tool result
 */
export interface ToolResult {
  content: Array<{
    type: string;
    text: string;
  }>;
  isError?: boolean;
}
