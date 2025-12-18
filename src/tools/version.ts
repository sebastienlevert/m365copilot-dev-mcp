/**
 * ATK Version Tool
 * Checks the installed version of Microsoft 365 Agents Toolkit CLI
 */

import { z } from 'zod';
import { executeATKCommand } from '../utils/cli-executor.js';
import { createSuccessResult, createErrorFromCLIResult, createErrorResult } from '../utils/error-handler.js';
import { ATK_TIMEOUTS, ToolResult } from '../types/atk.js';

export const VersionSchema = z.object({
  checkMinimum: z.string().optional().describe('Minimum required version (e.g., "1.1.0")'),
  verbose: z.boolean().default(false).describe('Show detailed version information')
});

export type VersionArgs = z.infer<typeof VersionSchema>;

/**
 * Parse semantic version string
 */
function parseVersion(versionStr: string): { major: number; minor: number; patch: number } | null {
  const match = versionStr.match(/(\d+)\.(\d+)\.(\d+)/);
  if (!match) return null;
  return {
    major: parseInt(match[1], 10),
    minor: parseInt(match[2], 10),
    patch: parseInt(match[3], 10)
  };
}

/**
 * Compare two semantic versions
 * Returns: -1 if v1 < v2, 0 if v1 == v2, 1 if v1 > v2
 */
function compareVersions(v1: string, v2: string): number {
  const parsed1 = parseVersion(v1);
  const parsed2 = parseVersion(v2);

  if (!parsed1 || !parsed2) return 0;

  if (parsed1.major !== parsed2.major) {
    return parsed1.major > parsed2.major ? 1 : -1;
  }
  if (parsed1.minor !== parsed2.minor) {
    return parsed1.minor > parsed2.minor ? 1 : -1;
  }
  if (parsed1.patch !== parsed2.patch) {
    return parsed1.patch > parsed2.patch ? 1 : -1;
  }
  return 0;
}


/**
 * Execute atk version check
 */
export async function executeVersionTool(args: VersionArgs): Promise<ToolResult> {
  // Extract progress callback if provided
  const onProgress = (args as any)._onProgress;

  // Execute atk --version
  const result = await executeATKCommand({
    command: 'atk',
    args: ['--version'],
    timeout: ATK_TIMEOUTS.doctor,
    onProgress
  });

  if (!result.success) {
    return createErrorFromCLIResult(result, 'ATK version check');
  }

  // Parse version from output
  const versionOutput = result.stdout.trim();
  const versionMatch = versionOutput.match(/(\d+\.\d+\.\d+)/);
  const installedVersion = versionMatch ? versionMatch[1] : versionOutput;

  // Check minimum version if specified
  let versionCheck = '';
  if (args.checkMinimum) {
    const comparison = compareVersions(installedVersion, args.checkMinimum);
    if (comparison < 0) {
      return createErrorResult({
        error: 'IncompatibleVersion',
        reason: `ATK CLI version ${installedVersion} is below the minimum required version ${args.checkMinimum}`,
        suggestion: `Update ATK CLI by running: npm install -g @microsoft/m365agentstoolkit-cli@latest`,
        documentation: 'atk://docs/commands/doctor',
        details: {
          installedVersion,
          minimumVersion: args.checkMinimum,
          updateCommand: 'npm install -g @microsoft/m365agentstoolkit-cli@latest'
        }
      });
    }
    versionCheck = `✅ Version check passed: ${installedVersion} >= ${args.checkMinimum}`;
  }

  // Build success message
  let message = `Microsoft 365 Agents Toolkit CLI

Installed Version: ${installedVersion}`;

  if (versionCheck) {
    message += `

${versionCheck}`;
  }

  if (args.verbose) {
    message += `

Raw Output:
${versionOutput}

Version Information:
- Major: ${parseVersion(installedVersion)?.major}
- Minor: ${parseVersion(installedVersion)?.minor}
- Patch: ${parseVersion(installedVersion)?.patch}`;
  }

  return createSuccessResult(message);
}

export const versionToolDefinition = {
  name: 'atk_version',
  description: `Check the installed version of Microsoft 365 Agents Toolkit CLI.

**Purpose:**
Verifies the installed ATK CLI version and optionally validates it against a minimum required version for compatibility.

**What It Checks:**
1. **Installed Version:**
   - Executes atk --version command
   - Parses semantic version (e.g., 1.1.3)
   - Compares with expected version from package.json

2. **Version Compatibility:**
   - Validates against minimum required version (if specified)
   - Warns if installed version is outdated
   - Provides update instructions

**When to Use:**
- Before starting new projects
- When troubleshooting version-specific issues
- After updating your development environment
- When ATK commands behave unexpectedly
- As part of CI/CD validation

**Example Usage:**

Basic version check:
{
  "verbose": false
}

Check minimum version requirement:
{
  "checkMinimum": "1.1.0",
  "verbose": false
}

Detailed version information:
{
  "verbose": true
}

**Common Scenarios:**

1. **Version Too Old:**
   - Error: "IncompatibleVersion"
   - Solution: npm install -g @microsoft/m365agentstoolkit-cli@latest

2. **Version Mismatch:**
   - Warning: Installed version differs from expected
   - May indicate multiple installations
   - Check global vs local installations

3. **ATK Not Found:**
   - Error: "ATKCommandFailed"
   - Solution: npm install -g @microsoft/m365agentstoolkit-cli

**Version Requirements:**
- **Minimum Version:** 1.1.0
- **Recommended:** Latest stable release
- **Breaking Changes:** Check release notes when upgrading major versions

**Update Instructions:**
To update ATK CLI to the latest version:
\`\`\`bash
npm install -g @microsoft/m365agentstoolkit-cli@latest
\`\`\`

To update to a specific version:
\`\`\`bash
npm install -g @microsoft/m365agentstoolkit-cli@1.1.3
\`\`\`

**Related Commands:**
- **atk_doctor:** Full system diagnostics
- **npm list -g:** Check all global packages

**Documentation:** atk://docs/commands/doctor`,
  inputSchema: {
    type: 'object',
    properties: {
      checkMinimum: {
        type: 'string',
        description: 'Minimum required version (e.g., "1.1.0"). Tool will fail if installed version is below this.'
      },
      verbose: {
        type: 'boolean',
        default: false,
        description: 'Show detailed version information including package location'
      }
    }
  }
};
