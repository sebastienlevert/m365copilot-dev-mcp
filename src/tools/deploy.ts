/**
 * ATK Deploy Tool
 * Deploys application code to provisioned cloud resources
 */

import { z } from 'zod';
import { resolve } from 'path';
import { existsSync } from 'fs';
import { executeATKCommand } from '../utils/cli-executor.js';
import { createSuccessResult, createErrorResult, createErrorFromCLIResult } from '../utils/error-handler.js';
import { cleanCLIOutput } from '../utils/output-formatter.js';
import { ATK_TIMEOUTS, ToolResult } from '../types/atk.js';

export const DeploySchema = z.object({
  projectPath: z.string().describe('Path to the ATK project directory'),
  environment: z.string().default('local').describe('Environment to deploy to (e.g., local, dev, staging, prod)'),
  skipBuild: z.boolean().default(false).describe('Skip build step before deployment')
});

export type DeployArgs = z.infer<typeof DeploySchema>;

/**
 * Execute atk deploy command
 */
export async function executeDeployTool(args: DeployArgs): Promise<ToolResult> {
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

  // Check if provisioning has been done (look for .env file)
  const envFile = `${absolutePath}/.env.${args.environment}`;
  if (!existsSync(envFile)) {
    return createErrorResult({
      error: 'EnvironmentNotProvisioned',
      reason: `Environment '${args.environment}' has not been provisioned yet`,
      suggestion: `Run atk_provision first with projectPath="${args.projectPath}" and environment="${args.environment}"`,
      documentation: 'atk://docs/lifecycle',
      details: {
        projectPath: absolutePath,
        environment: args.environment,
        expectedEnvFile: envFile
      }
    });
  }

  // Build command arguments
  const cmdArgs = ['deploy', '--env', args.environment];

  // Extract progress callback if provided
  const onProgress = (args as any)._onProgress;

  const result = await executeATKCommand({
    command: 'atk',
    args: cmdArgs,
    cwd: absolutePath,
    timeout: ATK_TIMEOUTS.deploy,
    onProgress
  });

  if (!result.success) {
    return createErrorFromCLIResult(result, 'Application deployment');
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

  const successMessage = `Deploy completed successfully

${cleanedOutput}
${chatUrlSection}`;

  return createSuccessResult(successMessage);
}

export const deployToolDefinition = {
  name: 'atk_deploy',
  description: `Deploy application code to provisioned cloud resources.

**Purpose:**
Builds and deploys your agent's code to the Azure resources that were created during provisioning.

**What It Does:**
Executes the 'deploy' lifecycle stage defined in m365agents.yml:
1. Builds the application (compiles TypeScript, bundles dependencies)
2. Packages the built code
3. Uploads to Azure (Functions or App Service)
4. Updates application configuration
5. Restarts services to apply changes

**Prerequisites:**
- Valid ATK project
- Resources already provisioned (run atk_provision first)
- .env.{environment} file exists with resource configuration
- Logged into Azure CLI
- Internet connection

**Deploy vs Provision:**
- **Provision**: Creates cloud resources (infrastructure)
- **Deploy**: Updates application code (your agent logic)

**When to Use:**
- After creating new features or fixing bugs
- After changing agent logic or configuration
- After updating dependencies
- When code needs to be refreshed in cloud

**Example Usage:**
{
  "projectPath": "./my-weather-agent",
  "environment": "dev"
}

For production:
{
  "projectPath": "./my-agent",
  "environment": "prod",
  "skipBuild": false
}

**Important Notes:**
- Always provision before first deploy
- Deployment updates code, not infrastructure
- Takes 2-5 minutes typically
- Code is live immediately after deployment
- Test thoroughly before deploying to production

**Common Issues:**
- "Environment not provisioned" → Run atk_provision first
- "Build failed" → Check for compilation errors in code
- "Upload failed" → Check Azure CLI authentication and permissions
- "Deployment timeout" → Large projects may need more time

**Documentation:** atk://docs/commands/deploy
**Workflow Prompt:** Use 'deploy-agent-complete' for guided deployment`,
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
        description: 'Environment to deploy to'
      },
      skipBuild: {
        type: 'boolean',
        default: false,
        description: 'Skip build step (only if already built)'
      }
    },
    required: ['projectPath']
  }
};
