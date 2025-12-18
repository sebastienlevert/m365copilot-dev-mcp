/**
 * ATK Publish Tool
 * Publishes application to Microsoft 365
 */

import { z } from 'zod';
import { resolve, join } from 'path';
import { existsSync } from 'fs';
import { executeATKCommand } from '../utils/cli-executor.js';
import { createSuccessResult, createErrorResult, createErrorFromCLIResult } from '../utils/error-handler.js';
import { cleanCLIOutput } from '../utils/output-formatter.js';
import { ATK_TIMEOUTS, ToolResult } from '../types/atk.js';

export const PublishSchema = z.object({
  projectPath: z.string().describe('Path to the ATK project directory'),
  environment: z.string().default('prod').describe('Environment to publish'),
  packagePath: z.string().optional().describe('Path to pre-built package zip file (optional)')
});

export type PublishArgs = z.infer<typeof PublishSchema>;

/**
 * Execute atk publish command
 */
export async function executePublishTool(rawArgs: unknown): Promise<ToolResult> {
  // Parse and validate args with defaults
  const args = PublishSchema.parse(rawArgs);

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

  // If package path provided, validate it exists
  if (args.packagePath) {
    const absolutePackagePath = resolve(args.packagePath);
    if (!existsSync(absolutePackagePath)) {
      return createErrorResult({
        error: 'PackageNotFound',
        reason: `Package file not found: ${absolutePackagePath}`,
        suggestion: 'Run atk_package first to create the package, or verify the package path',
        documentation: 'atk://docs/commands/package',
        details: { packagePath: absolutePackagePath }
      });
    }
  } else {
    // Check if default package exists
    const defaultPackagePath = join(absolutePath, 'appPackage', 'build', `appPackage.${args.environment}.zip`);
    if (!existsSync(defaultPackagePath)) {
      return createErrorResult({
        error: 'PackageNotBuilt',
        reason: 'Package has not been built yet',
        suggestion: `Run atk_package first with projectPath="${args.projectPath}" and environment="${args.environment}"`,
        documentation: 'atk://docs/commands/package',
        details: {
          expectedPackage: defaultPackagePath
        }
      });
    }
  }

  // Build command arguments
  const cmdArgs = ['publish', '--env', args.environment];

  // Extract progress callback if provided
  const onProgress = (args as any)._onProgress;

  const result = await executeATKCommand({
    command: 'atk',
    args: cmdArgs,
    cwd: absolutePath,
    timeout: ATK_TIMEOUTS.publish,
    onProgress
  });

  if (!result.success) {
    return createErrorFromCLIResult(result, 'Application publishing');
  }

  // Clean the output to remove ANSI codes and special characters
  const cleanedOutput = cleanCLIOutput(result.stdout);

  // Extract M365 Title ID from the output
  const output = result.stdout + '\n' + result.stderr;
  let titleId: string | null = null;

  // Try multiple patterns to find the title ID
  const patterns = [
    /TitleId:\s*([a-zA-Z0-9_-]+)/i,
    /Title ID[:\s]+([a-zA-Z0-9_-]+)/i,
    /titleId[:\s]+([a-zA-Z0-9_-]+)/i,
    /M365_TITLE_ID[=:\s]+([a-zA-Z0-9_-]+)/i,
    /TITLE_ID[=:\s]+([a-zA-Z0-9_-]+)/i,
    /declarativeAgent\.id[=:\s]+([a-zA-Z0-9_-]+)/i
  ];

  for (const pattern of patterns) {
    const match = output.match(pattern);
    if (match && match[1]) {
      titleId = match[1];
      break;
    }
  }

  // Build the success message with the M365 chat URL if title ID was found
  let chatUrlSection = '';
  if (titleId) {
    const chatUrl = `https://m365.cloud.microsoft/chat/?titleId=${titleId}`;
    chatUrlSection = `
Test Your Agent: ${chatUrl}

`;
  }

  const successMessage = `Publish completed successfully

${cleanedOutput}
${chatUrlSection}`;

  return createSuccessResult(successMessage);
}

export const publishToolDefinition = {
  name: 'atk_publish',
  description: `Publish application to Microsoft 365.

**Purpose:**
Uploads and registers your agent in Microsoft 365, making it available for users to install and use in Teams, Outlook, or Microsoft 365 app.

**What It Does:**
Executes the 'publish' lifecycle stage:
1. Validates the package
2. Uploads to Microsoft 365 tenant
3. Registers the app in app catalog
4. Configures availability scope
5. Sets up permissions and policies

**Prerequisites:**
- Valid ATK project
- Package built (run atk_package first)
- Deployed to Azure (for custom agents)
- Microsoft 365 admin permissions
- Logged into Microsoft 365

**Publishing Scopes:**
- **Personal**: Available for individual installation
- **Team**: Can be added to Teams channels
- **Organization**: Available to all users in tenant

**When to Use:**
- First time making app available to users
- After creating a new package version
- When updating app configuration or features
- For each environment (dev, prod separately)

**Example Usage:**
{
  "projectPath": "./my-weather-agent",
  "environment": "dev"
}

With pre-built package:
{
  "projectPath": "./my-agent",
  "environment": "prod",
  "packagePath": "./dist/appPackage.prod.zip"
}

**Publishing Workflow:**
1. Develop features locally
2. Deploy to Azure (atk_deploy)
3. Build package (atk_package)
4. Publish to M365 (atk_publish)
5. Test with users
6. Iterate and republish

**Important Notes:**
- Requires M365 admin rights for org-wide apps
- Test in dev environment first
- Publishing is per-tenant (not global)
- Updates require republishing
- Can take a few minutes to propagate

**Common Issues:**
- "Permission denied" → Need M365 admin permissions
- "Package not found" → Run atk_package first
- "Validation failed" → Fix manifest errors
- "Already exists" → Update version number or unpublish old version

**Post-Publishing:**
- App appears in Teams app catalog
- Users can discover and install
- Monitor usage in admin center
- Collect feedback for improvements

**Documentation:** atk://docs/commands/publish
**Workflow Prompt:** Use 'deploy-agent-complete' for full deployment workflow`,
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
        description: 'Environment to publish'
      },
      packagePath: {
        type: 'string',
        description: 'Path to pre-built package zip (optional, will use default if not specified)'
      }
    },
    required: ['projectPath']
  }
};
