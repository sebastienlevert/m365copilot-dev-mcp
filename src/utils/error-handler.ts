/**
 * Error handling and formatting utilities
 * Provides structured, actionable error messages for the LLM
 */

import { CLIExecutionResult, StructuredError, ToolResult } from '../types/atk.js';

/**
 * Parse ATK CLI error and create structured error response
 */
export function parseATKError(
  result: CLIExecutionResult,
  context: string
): StructuredError {
  const { stderr, exitCode } = result;
  const lowerStderr = stderr.toLowerCase();

  // Command not found
  if (lowerStderr.includes('command not found') ||
      lowerStderr.includes('is not recognized') ||
      lowerStderr.includes('enoent')) {
    return {
      error: 'CommandNotFound',
      reason: 'ATK CLI is not installed or not in PATH',
      suggestion: 'Install the ATK CLI globally with: npm install -g @microsoft/m365agentstoolkit-cli',
      documentation: 'atk://troubleshooting/installation',
      details: { stderr, exitCode }
    };
  }

  // Authentication errors
  if (lowerStderr.includes('not logged in') ||
      lowerStderr.includes('authentication') ||
      lowerStderr.includes('credentials')) {
    return {
      error: 'AuthenticationRequired',
      reason: 'Not logged in to Azure or Microsoft 365',
      suggestion: 'Log in with: az login (for Azure) or use Microsoft 365 account',
      documentation: 'atk://troubleshooting/authentication',
      details: { stderr, exitCode }
    };
  }

  // Azure subscription errors
  if (lowerStderr.includes('subscription') &&
      (lowerStderr.includes('not found') || lowerStderr.includes('invalid'))) {
    return {
      error: 'SubscriptionNotFound',
      reason: 'Azure subscription not found or not accessible',
      suggestion: 'Set your subscription with: az account set --subscription <subscription-id>',
      documentation: 'atk://troubleshooting/azure-subscription',
      details: { stderr, exitCode }
    };
  }

  // Resource already exists
  if (lowerStderr.includes('already exists') ||
      lowerStderr.includes('conflict')) {
    return {
      error: 'ResourceConflict',
      reason: 'Resource with this name already exists',
      suggestion: 'Use a different name or delete the existing resource first',
      documentation: 'atk://troubleshooting/resource-conflicts',
      details: { stderr, exitCode }
    };
  }

  // Permission errors
  if (lowerStderr.includes('permission denied') ||
      lowerStderr.includes('unauthorized') ||
      lowerStderr.includes('forbidden')) {
    return {
      error: 'PermissionDenied',
      reason: 'Insufficient permissions to perform this operation',
      suggestion: 'Ensure you have required permissions (Owner/Contributor role for Azure, Admin for Microsoft 365)',
      documentation: 'atk://troubleshooting/permissions',
      details: { stderr, exitCode }
    };
  }

  // Timeout errors
  if (stderr.includes('timed out') || stderr.includes('timeout')) {
    return {
      error: 'Timeout',
      reason: 'Command execution timed out',
      suggestion: 'The operation may take longer than expected. Try increasing the timeout or check your network connection.',
      documentation: 'atk://troubleshooting/timeouts',
      details: { stderr, exitCode }
    };
  }

  // Build errors
  if (lowerStderr.includes('build failed') ||
      lowerStderr.includes('compilation failed') ||
      lowerStderr.includes('build error')) {
    return {
      error: 'BuildFailed',
      reason: 'Application build or compilation failed',
      suggestion: 'Check the build errors, fix compilation issues, and ensure all dependencies are installed.',
      documentation: 'atk://troubleshooting/build-errors',
      details: { stderr, exitCode }
    };
  }

  // Validation errors
  if (lowerStderr.includes('validation') ||
      lowerStderr.includes('invalid manifest')) {
    return {
      error: 'ValidationFailed',
      reason: 'App manifest or configuration validation failed',
      suggestion: 'Review the error messages and fix validation issues. Use atk_validate for detailed validation.',
      documentation: 'atk://troubleshooting/validation',
      details: { stderr, exitCode }
    };
  }

  // Network errors
  if (lowerStderr.includes('network') ||
      lowerStderr.includes('econnrefused') ||
      lowerStderr.includes('enotfound') ||
      lowerStderr.includes('timeout')) {
    return {
      error: 'NetworkError',
      reason: 'Network connection error',
      suggestion: 'Check your internet connection and try again. Verify firewall settings allow ATK CLI connections.',
      documentation: 'atk://troubleshooting/network',
      details: { stderr, exitCode }
    };
  }

  // Project not found / directory errors
  if (lowerStderr.includes('no such file or directory') ||
      lowerStderr.includes('enoent') ||
      lowerStderr.includes('cannot find')) {
    return {
      error: 'ProjectNotFound',
      reason: 'Project directory or required files not found',
      suggestion: 'Ensure you are in a valid ATK project directory and all required files exist',
      documentation: 'atk://troubleshooting/project-structure',
      details: { stderr, exitCode }
    };
  }

  // Generic error
  return {
    error: 'ATKCommandFailed',
    reason: `${context} failed with exit code ${exitCode}`,
    suggestion: 'Review the error details below. Use atk_doctor to check your environment setup.',
    documentation: 'atk://troubleshooting/common-issues',
    details: {
      stderr,
      exitCode,
      stdout: result.stdout
    }
  };
}

/**
 * Create success tool result
 */
export function createSuccessResult(message: string, details?: any): ToolResult {
  const output = details
    ? `${message}\n\n${JSON.stringify(details, null, 2)}`
    : message;

  return {
    content: [{
      type: 'text',
      text: output
    }],
    isError: false
  };
}

/**
 * Create error tool result from structured error
 */
export function createErrorResult(structuredError: StructuredError): ToolResult {
  const errorText = `❌ ${structuredError.error}

**Reason:** ${structuredError.reason}

**Suggestion:** ${structuredError.suggestion}

${structuredError.documentation ? `**Documentation:** ${structuredError.documentation}\n` : ''}
${structuredError.details ? `**Details:**\n\`\`\`\n${JSON.stringify(structuredError.details, null, 2)}\n\`\`\`\n` : ''}`;

  return {
    content: [{
      type: 'text',
      text: errorText
    }],
    isError: true
  };
}

/**
 * Create error result from CLI execution result
 */
export function createErrorFromCLIResult(
  result: CLIExecutionResult,
  context: string
): ToolResult {
  const structuredError = parseATKError(result, context);
  return createErrorResult(structuredError);
}
