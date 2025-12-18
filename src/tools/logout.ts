/**
 * ATK Auth Logout Tool
 * Logs out from Microsoft 365 account
 */

import { z } from 'zod';
import { executeATKCommand } from '../utils/cli-executor.js';
import { createSuccessResult, createErrorFromCLIResult } from '../utils/error-handler.js';
import { ATK_TIMEOUTS, ToolResult } from '../types/atk.js';

export const LogoutSchema = z.object({});

export type LogoutArgs = z.infer<typeof LogoutSchema>;

/**
 * Execute atk auth logout m365 command
 */
export async function executeLogoutTool(args: LogoutArgs): Promise<ToolResult> {
  const cmdArgs = ['auth', 'logout', 'm365'];

  // Extract progress callback if provided
  const onProgress = (args as any)._onProgress;

  const result = await executeATKCommand({
    command: 'atk',
    args: cmdArgs,
    timeout: ATK_TIMEOUTS.auth,
    onProgress
  });

  if (!result.success) {
    return createErrorFromCLIResult(result, 'Microsoft 365 logout');
  }

  const successMessage = `✅ Successfully logged out from Microsoft 365

**Logout Status:**
${result.stdout}

**What Happened:**
- Your cached Microsoft 365 credentials have been removed
- All authentication tokens have been cleared
- You'll need to run atk_login again to use commands that require authentication

**Next Steps:**
- Run atk_login to authenticate with a different account
- Run atk_login to re-authenticate with the same account
- Continue using commands that don't require authentication (atk_doctor, atk_validate, etc.)

**Documentation:** atk://docs/commands/auth-logout`;

  return createSuccessResult(successMessage);
}

export const logoutToolDefinition = {
  name: 'atk_logout',
  description: `Log out from your Microsoft 365 account and clear cached credentials.

**Purpose:**
Removes cached Microsoft 365 credentials from your local system. Use this when switching accounts, troubleshooting authentication issues, or when you're done working with agent development.

**When to Use:**
- Switching between Microsoft 365 accounts
- Troubleshooting authentication or permission issues
- Security best practice: logging out when done working
- Before authenticating with a different tenant
- After completing agent development work

**What Gets Cleared:**
- Microsoft 365 authentication tokens
- Cached credentials from OS credential manager
- Active session information

**Important Notes:**
- This only affects local credentials, not your Microsoft 365 account
- You'll need to run atk_login again before provisioning, deploying, or publishing
- Commands that don't require authentication (atk_doctor, atk_validate) will still work
- Does not affect any deployed agents or Azure resources

**Example Usage:**
{}

**After Logout:**
You'll need to authenticate again (atk_login) before using these commands:
- atk_provision (requires M365 authentication)
- atk_deploy (requires M365 authentication)
- atk_publish (requires M365 authentication)

**Security Best Practices:**
- Log out when switching between work/personal accounts
- Log out on shared development machines
- Log out if you suspect credential compromise

**Documentation:** atk://docs/commands/auth-logout`,
  inputSchema: {
    type: 'object',
    properties: {}
  }
};
