/**
 * ATK Validate Tool
 * Validates app manifest and project configuration
 */

import { z } from 'zod';
import { resolve, join } from 'path';
import { existsSync } from 'fs';
import { executeATKCommand } from '../utils/cli-executor.js';
import { createSuccessResult, createErrorResult } from '../utils/error-handler.js';
import { cleanCLIOutput } from '../utils/output-formatter.js';
import { ATK_TIMEOUTS, ToolResult } from '../types/atk.js';

export const ValidateSchema = z.object({
  projectPath: z.string().describe('Path to the ATK project directory'),
  manifestPath: z.string().optional().describe('Path to specific manifest file (optional)'),
  environment: z.string().default('local').describe('Environment configuration to validate against (defaults to local)')
});

export type ValidateArgs = z.infer<typeof ValidateSchema>;

/**
 * Execute atk validate command
 */
export async function executeValidateTool(args: ValidateArgs): Promise<ToolResult> {
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

  // Determine manifest path
  const manifestPath = args.manifestPath
    ? resolve(args.manifestPath)
    : join(absolutePath, 'appPackage', 'manifest.json');

  if (!existsSync(manifestPath)) {
    return createErrorResult({
      error: 'ManifestNotFound',
      reason: 'App manifest file not found',
      suggestion: 'Ensure manifest.json exists at: ' + manifestPath,
      documentation: 'atk://troubleshooting/project-structure',
      details: {
        projectPath: absolutePath,
        manifestPath
      }
    });
  }

  // Build command arguments
  const cmdArgs = ['validate'];

  if (args.manifestPath) {
    cmdArgs.push('--manifest-file', args.manifestPath);
  }

  if (args.environment) {
    cmdArgs.push('--env', args.environment);
  }

  // Extract progress callback if provided
  const onProgress = (args as any)._onProgress;

  const result = await executeATKCommand({
    command: 'atk',
    args: cmdArgs,
    cwd: absolutePath,
    timeout: ATK_TIMEOUTS.validate,
    onProgress
  });

  if (!result.success) {
    // Clean the error output
    const cleanedError = cleanCLIOutput(result.stderr || result.stdout);

    const validationMessage = `Validation failed

Project: ${absolutePath}
Manifest: ${manifestPath}

${cleanedError}`;

    return {
      content: [{
        type: 'text',
        text: validationMessage
      }],
      isError: true
    };
  }

  // Clean the success output
  const cleanedOutput = cleanCLIOutput(result.stdout);

  const successMessage = `Validation passed successfully

Project: ${absolutePath}
Manifest: ${manifestPath}

${cleanedOutput}`;

  return createSuccessResult(successMessage);
}

export const validateToolDefinition = {
  name: 'atk_validate',
  description: `Validate app manifest and project configuration.

**Purpose:**
Checks your app manifest (manifest.json) against Microsoft 365 requirements, ensuring it will be accepted during packaging and publishing.

**What It Validates:**
1. **Manifest Schema:**
   - Correct schema version
   - All required fields present
   - Valid field types and formats

2. **Icons:**
   - color.png exists and is 192x192 pixels
   - outline.png exists and is 32x32 pixels
   - PNG format and file size limits

3. **Bot Configuration:**
   - Valid bot ID (GUID format)
   - HTTPS endpoints
   - Supported scopes (personal, team, groupchat)
   - Command definitions

4. **Permissions:**
   - Valid permission requests
   - Appropriate OAuth scopes
   - RSC permissions format

5. **Metadata:**
   - Valid version number (semver)
   - Required descriptions
   - Privacy/terms URLs

**Prerequisites:**
- Valid ATK project structure
- manifest.json file exists
- Icon files present (if required)

**When to Use:**
- After creating new project
- Before packaging
- After changing manifest
- When troubleshooting publish errors
- As part of CI/CD pipeline

**Example Usage:**
{
  "projectPath": "./my-weather-agent"
}

With specific manifest:
{
  "projectPath": "./my-agent",
  "manifestPath": "./appPackage/manifest.dev.json",
  "environment": "dev"
}

**Validation vs Package:**
- **Validate**: Checks manifest only, no side effects
- **Package**: Validates + creates zip package

**Important Notes:**
- Run validate before package
- Validation errors must be fixed before publishing
- Some warnings are acceptable
- Validation is fast (< 30 seconds)

**Common Validation Errors:**

1. **"Required field missing"**
   - Add missing fields to manifest.json
   - Check manifest schema version compatibility

2. **"Invalid icon size"**
   - Resize color.png to exactly 192x192
   - Resize outline.png to exactly 32x32

3. **"Invalid URL format"**
   - Ensure URLs start with https://
   - Check for typos in URLs

4. **"Invalid version"**
   - Use semantic versioning (1.0.0)
   - Increment version for updates

5. **"Invalid GUID"**
   - Generate new GUID for bot ID
   - Use correct GUID format (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)

**Post-Validation:**
After validation passes:
- Package with atk_package
- Deploy to test environment
- Test thoroughly before production

**Documentation:** atk://docs/commands/validate
**Manifest Reference:** atk://docs/config/manifest`,
  inputSchema: {
    type: 'object',
    properties: {
      projectPath: {
        type: 'string',
        description: 'Path to the ATK project directory'
      },
      manifestPath: {
        type: 'string',
        description: 'Path to specific manifest file (optional, defaults to appPackage/manifest.json)'
      },
      environment: {
        type: 'string',
        default: 'local',
        description: 'Environment configuration to validate against (defaults to local)'
      }
    },
    required: ['projectPath']
  }
};
