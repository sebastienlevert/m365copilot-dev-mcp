/**
 * ATK Run Response Formatters
 * Format success messages for different ATK commands with appropriate context
 */

import { join } from 'path';
import { homedir } from 'os';
import { resolve } from 'path';

/**
 * Extract M365 Title ID from command output
 */
export function extractTitleId(output: string): string | null {
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
      return match[1];
    }
  }

  return null;
}

/**
 * Generate M365 chat URL from title ID
 */
export function generateChatUrl(titleId: string): string {
  return `https://m365.cloud.microsoft/chat/?titleId=${titleId}`;
}

/**
 * Format success message for "new" command
 */
export function formatNewCommandSuccess(args: {
  name: string;
  format?: string;
  targetDir?: string;
  cleanedOutput: string;
}): string {
  const defaultDir = join(homedir(), 'AgentsToolkitProjects');
  const targetDir = args.targetDir
    ? (args.targetDir.startsWith('~') ? join(homedir(), args.targetDir.slice(1)) : resolve(args.targetDir))
    : defaultDir;
  const projectPath = join(targetDir, args.name);

  return `Project created successfully

Project Location: ${projectPath}

${args.cleanedOutput}

CRITICAL - DO NOT EDIT THESE GENERATED FILES:
- appPackage/manifest.json (auto-generated)
- appPackage/declarativeAgent.json (auto-generated)
- .generated/ folder (all files auto-generated)

Files You CAN Edit:
${args.format === 'typespec' ? '- TypeSpec source files (*.tsp) - Agent instructions, capabilities, and definitions' : '- Source configuration files - Define agent behavior'}
- appPackage/color.png - App icon (color)
- appPackage/outline.png - App icon (outline)
- .env files - Environment variables
- m365agents.yml - Build configuration`;
}

/**
 * Format success message for commands that include Title ID (provision, deploy, publish)
 */
export function formatCommandWithTitleId(args: {
  command: string;
  cwd: string;
  atkArgs: string[];
  cleanedOutput: string;
  fullOutput: string;
}): string {
  let message = `ATK ${args.command} completed successfully

Working Directory: ${args.cwd}
Command: atk ${args.atkArgs.join(' ')}

${args.cleanedOutput}`;

  // Extract and add chat URL if title ID found
  const titleId = extractTitleId(args.fullOutput);
  if (titleId) {
    const chatUrl = generateChatUrl(titleId);
    message += `

Test Your Agent: ${chatUrl}
`;
  }

  // Add approval information for publish command
  if (args.command === 'publish') {
    message += `

Your agent has been added to the request queue in your tenant catalog.
To approve the agent, visit: https://admin.cloud.microsoft/?#/agents/all/requested

If you don't have admin permissions, share the link above with your administrator to approve the agent.
`;
  }

  return message;
}

/**
 * Format generic success message
 */
export function formatGenericSuccess(args: {
  command: string;
  cwd: string;
  atkArgs: string[];
  cleanedOutput: string;
}): string {
  return `ATK ${args.command} completed successfully

Working Directory: ${args.cwd}
Command: atk ${args.atkArgs.join(' ')}

${args.cleanedOutput}`;
}
