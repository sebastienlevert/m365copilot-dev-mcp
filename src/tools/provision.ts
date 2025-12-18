/**
 * ATK Provision Tool
 * Provisions cloud resources for Microsoft 365 agents
 */

import { z } from 'zod';
import { resolve } from 'path';
import { existsSync } from 'fs';
import { executeATKCommand } from '../utils/cli-executor.js';
import { createSuccessResult, createErrorResult, createErrorFromCLIResult } from '../utils/error-handler.js';
import { cleanCLIOutput } from '../utils/output-formatter.js';
import { ATK_TIMEOUTS, ToolResult } from '../types/atk.js';

export const ProvisionSchema = z.object({
  projectPath: z.string().describe('Path to the ATK project directory'),
  environment: z.string().default('local').describe('Environment to provision (e.g., local, dev, staging, prod)'),
  resourceGroup: z.string().optional().describe('Azure resource group name (optional)'),
  subscriptionId: z.string().optional().describe('Azure subscription ID (optional)')
});

export type ProvisionArgs = z.infer<typeof ProvisionSchema>;

/**
 * Execute atk provision command
 */
export async function executeProvisionTool(rawArgs: unknown): Promise<ToolResult> {
  // Parse and validate args with defaults
  const args = ProvisionSchema.parse(rawArgs);

  // Resolve and validate project path
  const absolutePath = resolve(args.projectPath);

  if (!existsSync(absolutePath)) {
    return createErrorResult({
      error: 'ProjectNotFound',
      reason: `Project directory does not exist: ${absolutePath}`,
      suggestion: 'Verify the project path is correct. Use atk_new to create a new project first.',
      documentation: 'atk://troubleshooting/project-structure',
      details: { projectPath: absolutePath }
    });
  }

  // Check for m365agents.yml file
  const configFile = `${absolutePath}/m365agents.yml`;
  const envConfigFile = `${absolutePath}/m365agents.${args.environment}.yml`;

  if (!existsSync(configFile) && !existsSync(envConfigFile)) {
    return createErrorResult({
      error: 'ConfigurationNotFound',
      reason: 'Required m365agents.yml configuration file not found',
      suggestion: 'Ensure you are in a valid ATK project directory. The configuration file should exist at the project root.',
      documentation: 'atk://docs/config/m365agents',
      details: {
        projectPath: absolutePath,
        expectedFiles: [configFile, envConfigFile]
      }
    });
  }

  // Build command arguments
  const cmdArgs = ['provision', '--env', args.environment];

  // Set up environment variables for Azure if provided
  const env: Record<string, string> = {};
  if (args.subscriptionId) {
    env.AZURE_SUBSCRIPTION_ID = args.subscriptionId;
  }
  if (args.resourceGroup) {
    env.AZURE_RESOURCE_GROUP = args.resourceGroup;
  }

  // Extract progress callback if provided
  const onProgress = (args as any)._onProgress;

  const result = await executeATKCommand({
    command: 'atk',
    args: cmdArgs,
    cwd: absolutePath,
    env: Object.keys(env).length > 0 ? env : undefined,
    timeout: ATK_TIMEOUTS.provision,
    onProgress
  });

  if (!result.success) {
    return createErrorFromCLIResult(result, 'Resource provisioning');
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

  const successMessage = `Provision completed successfully

${cleanedOutput}
${chatUrlSection}`;

  return createSuccessResult(successMessage);
}

export const provisionToolDefinition = {
  name: 'atk_provision',
  description: `Provision cloud resources for Microsoft 365 agent deployment.

**Purpose:**
Creates and configures all required Azure cloud resources for your agent, including resource groups, app services, storage, and application registrations.

**What It Does:**
Executes the 'provision' lifecycle stage defined in m365agents.yml, which:
1. Creates Azure resource group (if needed)
2. Provisions compute resources (Azure Functions or App Service)
3. Creates storage accounts for state and files
4. Registers Azure AD application
5. Configures permissions and service principals
6. Generates environment-specific configuration (.env file)

**Prerequisites:**
- Valid ATK project (created with atk_new)
- Azure subscription
- Logged into Azure CLI (run: az login)
- Appropriate permissions (Contributor or Owner role)
- Internet connection

**When to Use:**
- First time deploying a new agent
- Creating new environment (dev, staging, prod)
- After changing cloud resource requirements
- When resource provisioning has failed and you need to retry

**Example Usage:**
{
  "projectPath": "./my-weather-agent",
  "environment": "dev"
}

With Azure subscription:
{
  "projectPath": "./my-agent",
  "environment": "prod",
  "subscriptionId": "12345678-1234-1234-1234-123456789012",
  "resourceGroup": "rg-myagent-prod"
}

**Important Notes:**
- This creates billable Azure resources
- Provision before deploy
- Can take 5-10 minutes to complete
- Generated secrets are saved in .env.{environment} file
- Each environment needs separate provisioning

**Common Issues:**
- "Not logged in" → Run: az login
- "Subscription not found" → Run: az account set --subscription <id>
- "Permission denied" → Need Contributor/Owner role
- "Resource already exists" → Delete existing resources or use different names

**Documentation:** atk://docs/commands/provision
**Lifecycle Guide:** atk://docs/lifecycle`,
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
        description: 'Environment to provision (e.g., dev, local, staging, prod)'
      },
      resourceGroup: {
        type: 'string',
        description: 'Azure resource group name (optional, will use default if not specified)'
      },
      subscriptionId: {
        type: 'string',
        description: 'Azure subscription ID (optional, will use default if not specified)'
      }
    },
    required: ['projectPath']
  }
};
