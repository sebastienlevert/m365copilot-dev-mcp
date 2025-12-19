/**
 * ATK Compile TypeSpec Tool
 * Compiles TypeSpec agent definitions with detailed error reporting
 */

import { z } from 'zod';
import { resolve } from 'path';
import { existsSync } from 'fs';
import { executeATKCommand } from '../utils/cli-executor.js';
import { cleanCLIOutput } from '../utils/output-formatter.js';
import { createSuccessResult, createErrorResult } from '../utils/error-handler.js';
import { ATK_TIMEOUTS, ToolResult } from '../types/atk.js';

export const CompileTypeSpecSchema = z.object({
  projectPath: z.string().describe('Path to the ATK project directory'),
  validate: z.boolean().default(true).describe('Whether to validate after compilation')
});

export type CompileTypeSpecArgs = z.infer<typeof CompileTypeSpecSchema>;

/**
 * Execute TypeSpec compilation
 */
export async function executeCompileTypeSpecTool(rawArgs: unknown): Promise<ToolResult> {
  const args = CompileTypeSpecSchema.parse(rawArgs);

  // Resolve and validate project path
  const absolutePath = resolve(args.projectPath);

  if (!existsSync(absolutePath)) {
    return createErrorResult({
      error: 'ProjectNotFound',
      reason: `Project directory does not exist: ${absolutePath}`,
      suggestion: 'Verify the project path is correct',
      details: { projectPath: absolutePath }
    });
  }

  // Check for TypeSpec files
  const mainTspPath = `${absolutePath}/src/agent/main.tsp`;
  if (!existsSync(mainTspPath)) {
    return createErrorResult({
      error: 'TypeSpecNotFound',
      reason: 'No TypeSpec files found in project',
      suggestion: 'Ensure src/agent/main.tsp exists',
      details: { expectedPath: mainTspPath }
    });
  }

  // Extract progress callback if provided
  const onProgress = (args as any)._onProgress;

  // Run TypeSpec compilation
  const result = await executeATKCommand({
    command: 'npx',
    args: ['--package=@typespec/compiler', 'tsp', 'compile', './src/agent/main.tsp', '--config', './tspconfig.yaml'],
    cwd: absolutePath,
    timeout: ATK_TIMEOUTS.validate,
    onProgress
  });

  const cleanedOutput = cleanCLIOutput(result.stdout + '\n' + result.stderr);

  if (!result.success) {
    return {
      content: [{
        type: 'text',
        text: `TypeSpec compilation failed

Project: ${absolutePath}

${cleanedOutput}

Common issues:
- Check syntax errors (missing semicolons, braces)
- Verify imports are correct
- Check decorator parameters
- Ensure model types are valid`
      }],
      isError: true
    };
  }

  let message = `TypeSpec compilation successful

Project: ${absolutePath}

${cleanedOutput}`;

  // Optionally run validation
  if (args.validate) {
    const validateResult = await executeATKCommand({
      command: 'atk',
      args: ['validate', '--env', 'local'],
      cwd: absolutePath,
      timeout: ATK_TIMEOUTS.validate,
      onProgress
    });

    const validationOutput = cleanCLIOutput(validateResult.stdout);

    if (validateResult.success) {
      message += `\n\nValidation: Passed\n${validationOutput}`;
    } else {
      message += `\n\nValidation: Failed\n${validationOutput}`;
    }
  }

  return createSuccessResult(message);
}

export const compileTypeSpecToolDefinition = {
  name: 'compile_typespec',
  description: `Compile TypeSpec agent definitions with detailed error reporting.

**Purpose:**
Compiles TypeSpec files to generate manifest.json and declarativeAgent.json files. Essential step before provisioning or validating the agent.

**What It Does:**
- Runs TypeSpec compiler on src/agent/main.tsp
- Generates output files in .generated/ directory
- Reports compilation errors with line numbers
- Optionally validates the generated manifest

**When to Use:**
- After making changes to TypeSpec files
- Before provisioning
- To check for syntax/type errors
- During development workflow

**Example Usage:**
{
  "projectPath": "./my-agent",
  "validate": true
}

**Common Errors:**
- Syntax errors: Check line numbers in error messages
- Missing imports: Add required import statements
- Type mismatches: Verify parameter and return types
- Invalid decorators: Check decorator syntax and parameters`,
  inputSchema: {
    type: 'object',
    properties: {
      projectPath: {
        type: 'string',
        description: 'Path to the ATK project directory'
      },
      validate: {
        type: 'boolean',
        default: true,
        description: 'Whether to validate after compilation'
      }
    },
    required: ['projectPath']
  }
};
