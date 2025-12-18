/**
 * ATK Doctor Tool
 * Checks prerequisites and system configuration
 */

import { z } from 'zod';
import { executeATKCommand } from '../utils/cli-executor.js';
import { createSuccessResult, createErrorFromCLIResult } from '../utils/error-handler.js';
import { cleanCLIOutput } from '../utils/output-formatter.js';
import { ATK_TIMEOUTS, ToolResult } from '../types/atk.js';

export const DoctorSchema = z.object({
  verbose: z.boolean().default(false).describe('Show detailed diagnostic information')
});

export type DoctorArgs = z.infer<typeof DoctorSchema>;

/**
 * Execute atk doctor command
 */
export async function executeDoctorTool(args: DoctorArgs): Promise<ToolResult> {
  const cmdArgs = ['doctor'];

  if (args.verbose) {
    cmdArgs.push('--verbose');
  }

  // Extract progress callback if provided
  const onProgress = (args as any)._onProgress;

  const result = await executeATKCommand({
    command: 'atk',
    args: cmdArgs,
    timeout: ATK_TIMEOUTS.doctor,
    onProgress
  });

  if (!result.success) {
    return createErrorFromCLIResult(result, 'System diagnostics check');
  }

  // Clean the output to remove ANSI codes and special characters
  const cleanedOutput = cleanCLIOutput(result.stdout);

  const successMessage = `System diagnostics check completed successfully

${cleanedOutput}`;

  return createSuccessResult(successMessage);
}

export const doctorToolDefinition = {
  name: 'atk_doctor',
  description: `Check prerequisites and system configuration for Microsoft 365 Agents Toolkit.

**Purpose:**
Verifies that your development environment has all the required tools and configurations to build and deploy Microsoft 365 agents.

**Checks Performed:**
- Node.js version (requires 18+)
- npm availability and version
- Azure CLI installation (optional but recommended)
- Microsoft 365 account status
- ATK CLI installation and version
- Required environment variables

**When to Use:**
- Before creating your first project
- When troubleshooting setup issues
- After updating your development environment
- When ATK commands are failing unexpectedly

**Example Usage:**
{
  "verbose": false
}

**Common Issues:**
- "Node.js not found" → Install Node.js 18 or later
- "Azure CLI not found" → Install Azure CLI for cloud deployments
- "ATK CLI not found" → Reinstall with: npm install -g @microsoft/m365agentstoolkit-cli

**Documentation:** atk://docs/commands/doctor`,
  inputSchema: {
    type: 'object',
    properties: {
      verbose: {
        type: 'boolean',
        description: 'Show detailed diagnostic information',
        default: false
      }
    }
  }
};
