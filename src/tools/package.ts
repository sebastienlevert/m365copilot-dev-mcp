/**
 * ATK Package Tool
 * Builds application package for publishing to Microsoft 365
 */

import { z } from 'zod';
import { resolve, join } from 'path';
import { existsSync } from 'fs';
import { executeATKCommand } from '../utils/cli-executor.js';
import { createSuccessResult, createErrorResult, createErrorFromCLIResult } from '../utils/error-handler.js';
import { cleanCLIOutput } from '../utils/output-formatter.js';
import { ATK_TIMEOUTS, ToolResult } from '../types/atk.js';

export const PackageSchema = z.object({
  projectPath: z.string().describe('Path to the ATK project directory'),
  environment: z.string().default('local').describe('Environment configuration to use'),
  outputPath: z.string().optional().describe('Output path for the package zip file')
});

export type PackageArgs = z.infer<typeof PackageSchema>;

/**
 * Execute atk package command
 */
export async function executePackageTool(rawArgs: unknown): Promise<ToolResult> {
  // Parse and validate args with defaults
  const args = PackageSchema.parse(rawArgs);

  // Resolve and validate project path
  const absolutePath = resolve(args.projectPath);

  if (!existsSync(absolutePath)) {
    return createErrorResult({
      error: 'ProjectNotFound',
      reason: `Project directory does not exist: ${absolutePath}`,
      suggestion: 'Verify the project path is correct',
      documentation: 'atk://troubleshooting/project-structure',
      details: { projectPath: absolutePath }
    });
  }

  // Check for manifest file
  const manifestFile = join(absolutePath, 'appPackage', 'manifest.json');
  if (!existsSync(manifestFile)) {
    return createErrorResult({
      error: 'ManifestNotFound',
      reason: 'App manifest file not found',
      suggestion: 'Ensure appPackage/manifest.json exists in your project',
      documentation: 'atk://troubleshooting/project-structure',
      details: {
        projectPath: absolutePath,
        expectedManifest: manifestFile
      }
    });
  }

  // Build command arguments
  const cmdArgs = ['package', '--env', args.environment];

  if (args.outputPath) {
    cmdArgs.push('--output-folder', args.outputPath);
  }

  // Extract progress callback if provided
  const onProgress = (args as any)._onProgress;

  const result = await executeATKCommand({
    command: 'atk',
    args: cmdArgs,
    cwd: absolutePath,
    timeout: ATK_TIMEOUTS.package,
    onProgress
  });

  if (!result.success) {
    return createErrorFromCLIResult(result, 'Package creation');
  }

  // Clean the output to remove ANSI codes and special characters
  const cleanedOutput = cleanCLIOutput(result.stdout);

  // Determine package path
  const defaultPackagePath = join(absolutePath, 'appPackage', 'build', `appPackage.${args.environment}.zip`);
  const packagePath = args.outputPath
    ? join(args.outputPath, `appPackage.${args.environment}.zip`)
    : defaultPackagePath;

  const successMessage = `Package completed successfully

Package Location: ${packagePath}

${cleanedOutput}`;

  return createSuccessResult(successMessage);
}

export const packageToolDefinition = {
  name: 'atk_package',
  description: `Build application package for publishing to Microsoft 365.

**Purpose:**
Creates a zip package containing your agent's manifest and resources, ready for upload to Microsoft 365 admin center or automated publishing.

**What It Does:**
1. Validates the app manifest (manifest.json)
2. Collects all required resources (icons, files)
3. Packages everything into a .zip file
4. Validates against Microsoft 365 requirements
5. Outputs package to build directory

**Package Structure:**
appPackage.{environment}.zip contains:
- manifest.json - App manifest with agent definition
- color.png - App icon (192x192)
- outline.png - App icon outline (32x32)
- Additional resources defined in manifest

**Prerequisites:**
- Valid ATK project
- Valid manifest.json in appPackage directory
- Required icons and resources present
- Project deployed to Azure (for production packages)

**When to Use:**
- Before publishing to Microsoft 365
- After changing manifest configuration
- Before distributing to users
- For compliance review submissions

**Example Usage:**
{
  "projectPath": "./my-weather-agent",
  "environment": "dev"
}

With custom output:
{
  "projectPath": "./my-agent",
  "environment": "prod",
  "outputPath": "./dist/packages"
}

**Package vs Deploy:**
- **Deploy**: Uploads code to Azure
- **Package**: Creates M365 app package for end users

**Important Notes:**
- Package must pass validation before publishing
- Use correct environment (prod for production)
- Test package in dev environment first
- Keep package files under version control

**Common Issues:**
- "Manifest validation failed" → Fix errors in manifest.json
- "Icon not found" → Ensure color.png and outline.png exist
- "Invalid manifest" → Run atk_validate first
- "Package too large" → Reduce resource file sizes

**Documentation:** atk://docs/commands/package`,
  inputSchema: {
    type: 'object',
    properties: {
      projectPath: {
        type: 'string',
        description: 'Path to the ATK project directory'
      },
      environment: {
        type: 'string',
        default: 'dev',
        description: 'Environment configuration to use'
      },
      outputPath: {
        type: 'string',
        description: 'Custom output path for the package (optional)'
      }
    },
    required: ['projectPath']
  }
};
