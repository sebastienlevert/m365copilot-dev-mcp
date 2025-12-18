/**
 * ATK Auth Login Tool
 * Authenticates with Microsoft 365 account
 */

import { z } from 'zod';
import { executeATKCommand } from '../utils/cli-executor.js';
import { createSuccessResult, createErrorFromCLIResult } from '../utils/error-handler.js';
import { ATK_TIMEOUTS, ToolResult } from '../types/atk.js';

export const LoginSchema = z.object({
  tenant: z.string().optional().describe('Authenticate with a specific Microsoft Entra tenant ID or domain name')
});

export type LoginArgs = z.infer<typeof LoginSchema>;

/**
 * Execute atk auth login m365 command
 */
export async function executeLoginTool(args: LoginArgs): Promise<ToolResult> {
  const cmdArgs = ['auth', 'login', 'm365', '--interactive', 'false'];

  if (args.tenant) {
    cmdArgs.push('--tenant', args.tenant);
  }

  // Extract progress callback if provided
  const onProgress = (args as any)._onProgress;

  const result = await executeATKCommand({
    command: 'atk',
    args: cmdArgs,
    timeout: ATK_TIMEOUTS.auth,
    onProgress
  });

  if (!result.success) {
    return createErrorFromCLIResult(result, 'Microsoft 365 authentication');
  }

  const successMessage = `✅ Successfully authenticated with Microsoft 365

**Authentication Status:**
${result.stdout}

**Next Steps:**
- Your credentials are now cached for future ATK commands
- You can provision resources with atk_provision
- You can deploy agents with atk_deploy
- You can publish agents with atk_publish
- To switch accounts, run atk_logout first, then atk_login again

**Documentation:** atk://docs/commands/auth-login`;

  return createSuccessResult(successMessage);
}

export const loginToolDefinition = {
  name: 'atk_login',
  description: `Authenticate with your Microsoft 365 account for agent development and deployment.

**Purpose:**
Logs you into Microsoft 365 to enable provisioning, deploying, and publishing agents. This command opens a browser window for interactive authentication and caches your credentials securely.

**When to Use:**
- Before provisioning resources (atk_provision)
- Before deploying agents (atk_deploy)
- Before publishing agents (atk_publish)
- When switching between Microsoft 365 accounts
- After authentication expires or is revoked

**Authentication Flow:**
1. Opens your default browser with Microsoft login page
2. Sign in with your Microsoft 365 account (work or school account)
3. Grant permissions for ATK to manage resources
4. Credentials are cached locally for future commands

**Tenant Options:**
- Without tenant: Authenticate with your default tenant
- With tenant ID: Authenticate with a specific tenant (for multi-tenant scenarios)
- With tenant domain: Use domain name (e.g., "contoso.onmicrosoft.com")

**Example Usage:**
{
  "tenant": ""
}

Or with specific tenant:
{
  "tenant": "72f988bf-86f1-41af-91ab-2d7cd011db47"
}

**Prerequisites:**
- Microsoft 365 account (work or school account)
- Browser available for interactive authentication
- Network connectivity to Microsoft services

**Common Issues:**
- "Browser failed to open" → Manually open the provided URL in a browser
- "Authentication timeout" → Complete the login flow within the time limit
- "Invalid tenant" → Verify tenant ID or domain name is correct
- "Insufficient permissions" → Ensure your account has rights to create resources

**Security Notes:**
- Credentials are stored securely using OS credential manager
- Session tokens expire after a period of inactivity
- Use atk_logout to remove cached credentials when done

**Documentation:** atk://docs/commands/auth-login`,
  inputSchema: {
    type: 'object',
    properties: {
      tenant: {
        type: 'string',
        description: 'Authenticate with a specific Microsoft Entra tenant ID or domain name (optional)'
      }
    }
  }
};
