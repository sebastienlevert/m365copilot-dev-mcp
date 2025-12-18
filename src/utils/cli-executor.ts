/**
 * CLI command execution utility
 * Handles cross-platform command execution with proper error handling
 */

import { spawn } from 'child_process';
import { resolve } from 'path';
import { CLIExecutionOptions, CLIExecutionResult, ProgressCallback } from '../types/atk.js';
import { info, error as logError, warn } from './logger.js';

/**
 * Execute an ATK CLI command
 * @param options Execution options
 * @returns Execution result
 */
export async function executeATKCommand(
  options: CLIExecutionOptions
): Promise<CLIExecutionResult> {
  const { command, args, cwd, env, timeout = 60000, onProgress } = options;

  // Resolve working directory to absolute path
  const absoluteCwd = cwd ? resolve(cwd) : process.cwd();

  // Build full command
  const fullCommand = buildCommand(command, args);

  info(`Executing ATK command: ${fullCommand}`, {
    cwd: absoluteCwd,
    timeout
  });

  // Notify progress
  if (onProgress) {
    onProgress(`Starting command: ${command} ${args.join(' ')}`, 'info');
  }

  try {
    return await executeCommand(fullCommand, absoluteCwd, env, timeout, onProgress);
  } catch (err) {
    const error = err as Error;
    logError(`Command execution failed: ${error.message}`, {
      command: fullCommand,
      error: error.stack
    });

    if (onProgress) {
      onProgress(`Command failed: ${error.message}`, 'error');
    }

    return {
      success: false,
      stdout: '',
      stderr: error.message,
      exitCode: -1,
      error
    };
  }
}

/**
 * Build command string with arguments
 */
function buildCommand(command: string, args: string[]): string {
  // For ATK commands, use npx with the correct binary name
  if (command === 'atk') {
    // The @microsoft/m365agentstoolkit-cli package provides the 'atk' binary
    // We need to use npx to run it, specifying the package name and then the binary
    // Always use @latest to ensure the most recent version is used
    const subcommand = args.join(' ');
    return `npx --yes -p @microsoft/m365agentstoolkit-cli@latest atk ${subcommand}`;
  }

  // For other commands, just join them
  return `${command} ${args.join(' ')}`;
}

/**
 * Execute command with cross-platform shell support
 */
function executeCommand(
  command: string,
  cwd: string,
  env: Record<string, string> | undefined,
  timeout: number,
  onProgress?: ProgressCallback
): Promise<CLIExecutionResult> {
  return new Promise((resolve, reject) => {
    const isWindows = process.platform === 'win32';
    const shell = isWindows ? 'cmd' : 'sh';
    const shellArg = isWindows ? '/c' : '-c';

    // Merge environment variables
    const mergedEnv = {
      ...process.env,
      ...env
    };

    const child = spawn(shell, [shellArg, command], {
      cwd,
      env: mergedEnv,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';
    let didTimeout = false;
    let timeoutId: NodeJS.Timeout | null = null;

    // Set up timeout
    if (timeout > 0) {
      timeoutId = setTimeout(() => {
        didTimeout = true;
        warn(`Command timed out after ${timeout}ms: ${command}`);
        child.kill('SIGTERM');

        // Force kill after 5 seconds if still running
        setTimeout(() => {
          if (!child.killed) {
            child.kill('SIGKILL');
          }
        }, 5000);
      }, timeout);
    }

    // Collect stdout
    child.stdout.on('data', (data) => {
      const text = data.toString();
      stdout += text;
      // Log to stderr for debugging (never stdout!)
      info(`[ATK Output] ${text.trim()}`);

      // Send progress update
      if (onProgress) {
        const lines = text.trim().split('\n');
        lines.forEach((line: string) => {
          if (line.trim()) {
            onProgress(line.trim(), 'info');
          }
        });
      }
    });

    // Collect stderr
    child.stderr.on('data', (data) => {
      const text = data.toString();
      stderr += text;
      warn(`[ATK Error] ${text.trim()}`);

      // Send progress update for errors
      if (onProgress) {
        const lines = text.trim().split('\n');
        lines.forEach((line: string) => {
          if (line.trim()) {
            onProgress(line.trim(), 'error');
          }
        });
      }
    });

    // Handle process completion
    child.on('close', (code) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      if (didTimeout) {
        resolve({
          success: false,
          stdout,
          stderr: stderr + '\nCommand timed out',
          exitCode: -1,
          error: new Error(`Command timed out after ${timeout}ms`)
        });
        return;
      }

      const exitCode = code ?? 0;
      const success = exitCode === 0;

      if (!success) {
        warn(`Command exited with code ${exitCode}: ${command}`);
      } else {
        info(`Command completed successfully: ${command}`);
      }

      resolve({
        success,
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        exitCode,
        ...((!success) && { error: new Error(`Command failed with exit code ${exitCode}`) })
      });
    });

    // Handle spawn errors (e.g., command not found)
    child.on('error', (err) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      logError(`Failed to spawn command: ${err.message}`, {
        command,
        error: err.stack
      });

      reject(err);
    });
  });
}

/**
 * Check if ATK CLI is available
 */
export async function checkATKAvailable(): Promise<boolean> {
  try {
    const result = await executeATKCommand({
      command: 'atk',
      args: ['--version'],
      timeout: 10000
    });

    return result.success;
  } catch {
    return false;
  }
}
