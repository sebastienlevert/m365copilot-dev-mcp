/**
 * ATK Run Tool
 * Unified tool for running all ATK CLI commands
 */

import { z } from 'zod';
import { executeATKCommand } from '../utils/cli-executor.js';
import { cleanCLIOutput } from '../utils/output-formatter.js';
import { createSuccessResult, createErrorResult } from '../utils/error-handler.js';
import { ATK_TIMEOUTS, ToolResult, DeclarativeAgentFormat } from '../types/atk.js';
import { resolve, join } from 'path';
import { existsSync, mkdirSync, readFileSync } from 'fs';
import { homedir } from 'os';
import { formatNewCommandSuccess, formatCommandWithTitleId, formatGenericSuccess } from './atk-run-formatters.js';

// Define the schema for all ATK commands
export const ATKRunSchema = z.object({
  command: z.enum([
    'new',
    'provision',
    'deploy',
    'package',
    'publish',
    'validate',
    'doctor',
    'version',
    'login',
    'logout'
  ]).describe('The ATK command to run'),

  // Common parameters
  projectPath: z.string().optional().describe('Path to the project directory (not needed for doctor/version/login/logout)'),
  env: z.string().optional().describe('Environment name (dev, local, prod, etc.) - used by provision, deploy, package, publish'),

  // New project parameters
  name: z.string().optional().describe('Project name (required for new command)'),
  template: z.string().optional().describe('Template type (required for new command)'),
  format: z.string().optional().describe('Format type (required for new command)'),
  targetDir: z.string().optional().describe('Target directory for new project'),

  // Login parameters
  tenant: z.string().optional().describe('Tenant ID for login'),

  // Additional flags
  interactive: z.boolean().optional().describe('Run in interactive mode'),
  verbose: z.boolean().optional().describe('Enable verbose output')
});

export type ATKRunArgs = z.infer<typeof ATKRunSchema>;

/**
 * Check if m365agents.yml file contains a deploy action
 * Returns true if deploy action exists
 */
function hasDeployAction(projectPath: string, env?: string): boolean {
  try {
    // Check environment-specific config first, then fall back to main config
    const configFiles = env
      ? [`${projectPath}/m365agents.${env}.yml`, `${projectPath}/m365agents.yml`]
      : [`${projectPath}/m365agents.yml`];

    for (const configFile of configFiles) {
      if (existsSync(configFile)) {
        const content = readFileSync(configFile, 'utf-8');
        // Check if the file contains a deploy action
        // Look for "deploy:" at the start of a line (with optional whitespace)
        if (/^\s*deploy\s*:/m.test(content)) {
          return true;
        }
      }
    }

    return false;
  } catch {
    // If we can't read the file, assume deploy action exists
    // The actual command will handle any file errors
    return true;
  }
}

/**
 * Check if user is logged in with a Microsoft employee account (@microsoft.com)
 * Returns true if user is a Microsoft employee
 */
async function isMicrosoftEmployee(): Promise<boolean> {
  try {
    // Run atk auth list to get current user info
    const result = await executeATKCommand({
      command: 'atk',
      args: ['auth', 'list'],
      timeout: 10000
    });

    if (result.success) {
      const output = result.stdout + '\n' + result.stderr;
      // Check for the pattern "Your Microsoft 365 account is: *@microsoft.com"
      const msftAccountPattern = /Your Microsoft 365 account is:.*@microsoft\.com/i;
      return msftAccountPattern.test(output);
    }

    return false;
  } catch {
    // If we can't determine, allow the operation to proceed
    // The actual ATK command will handle auth errors
    return false;
  }
}

/**
 * Execute ATK command with appropriate parameters
 */
export async function executeATKRunTool(rawArgs: unknown): Promise<ToolResult> {
  const args = ATKRunSchema.parse(rawArgs);
  const onProgress = (args as any)._onProgress;

  // Set default env to "local" for commands that use it (except publish)
  if (!args.env && (args.command === 'provision' || args.command === 'deploy' || args.command === 'package' || args.command === 'validate')) {
    args.env = 'local';
  }

  // Check for Microsoft employee attempting to publish
  if (args.command === 'publish') {
    const isMsftEmployee = await isMicrosoftEmployee();
    if (isMsftEmployee) {
      return createErrorResult({
        error: 'MicrosoftEmployeePublishNotAllowed',
        reason: 'Microsoft employees (@microsoft.com) cannot use the publish command through this tool',
        suggestion: 'Use the Microsoft 365 Core Dev Center to publish your app instead: https://substrate.microsoft.net/v2/build',
        details: {
          command: 'publish',
          alternativeUrl: 'https://substrate.microsoft.net/v2/build'
        }
      });
    }
  }

  // Determine working directory early
  let cwd = process.cwd();

  // Build the ATK command arguments based on the command type
  // Special handling for login/logout - they use 'atk auth login/logout m365'
  // Special handling for version - it uses 'atk --version'
  const atkArgs: string[] = [];
  if (args.command === 'login') {
    atkArgs.push('auth', 'login', 'm365');
  } else if (args.command === 'logout') {
    atkArgs.push('auth', 'logout', 'm365');
  } else if (args.command === 'version') {
    atkArgs.push('--version');
  } else {
    atkArgs.push(args.command);
  }

  // Handle command-specific arguments
  switch (args.command) {
    case 'new':
      if (!args.name || !args.template || !args.format) {
        return createErrorResult({
          error: 'MissingParameters',
          reason: 'The "new" command requires name, template, and format parameters',
          suggestion: 'Provide name, template, and format in the arguments',
          details: { command: 'new' }
        });
      }

      // Resolve target directory - default to ~/AgentsToolkitProjects
      const defaultDir = join(homedir(), 'AgentsToolkitProjects');
      let targetDir: string;

      if (args.targetDir) {
        // User specified a directory
        targetDir = args.targetDir.startsWith('~')
          ? join(homedir(), args.targetDir.slice(1))
          : resolve(args.targetDir);
      } else {
        // Use default directory
        targetDir = defaultDir;

        // Create default directory if it doesn't exist
        if (!existsSync(targetDir)) {
          try {
            mkdirSync(targetDir, { recursive: true });
          } catch (error) {
            return createErrorResult({
              error: 'DirectoryCreationFailed',
              reason: `Failed to create default directory: ${targetDir}`,
              suggestion: 'Check file system permissions or specify a custom directory with targetDir parameter',
              details: { targetDir, error: String(error) }
            });
          }
        }
      }

      const projectPath = join(targetDir, args.name);

      // Check if project directory already exists
      if (existsSync(projectPath)) {
        return createErrorResult({
          error: 'ProjectAlreadyExists',
          reason: `Directory already exists: ${projectPath}`,
          suggestion: 'Use a different project name or delete the existing directory',
          details: { projectPath }
        });
      }

      // Build ATK command arguments (non-interactive mode)
      atkArgs.push('--interactive', 'false');
      atkArgs.push('--app-name', args.name);
      atkArgs.push('--capability', args.template);
      atkArgs.push('--folder', targetDir);

      // Add TypeSpec plugin if format is typespec
      if (args.format === DeclarativeAgentFormat.TYPESPEC || args.format === 'typespec') {
        atkArgs.push('--with-plugin', 'type-spec');
      }

      // Set cwd to target directory for new command
      cwd = targetDir;
      break;

    case 'provision':
    case 'deploy':
    case 'package':
    case 'publish':
      if (!args.projectPath) {
        return createErrorResult({
          error: 'MissingProjectPath',
          reason: `The "${args.command}" command requires a projectPath parameter`,
          suggestion: 'Provide the path to the project directory',
          details: { command: args.command }
        });
      }
      if (args.env) {
        atkArgs.push('--env', args.env);
      }
      break;

    case 'validate':
      if (!args.projectPath) {
        return createErrorResult({
          error: 'MissingProjectPath',
          reason: 'The "validate" command requires a projectPath parameter',
          suggestion: 'Provide the path to the project directory',
          details: { command: 'validate' }
        });
      }
      if (args.env) {
        atkArgs.push('--env', args.env);
      }
      break;

    case 'login':
      if (args.tenant) {
        atkArgs.push('--tenant', args.tenant);
      }
      break;

    case 'doctor':
    case 'version':
    case 'logout':
      // No additional arguments needed
      break;
  }

  // Add common flags
  if (args.interactive) {
    atkArgs.push('--interactive');
  }
  if (args.verbose) {
    atkArgs.push('--verbose');
  }

  // Update working directory if projectPath is provided
  if (args.projectPath) {
    cwd = resolve(args.projectPath);
    if (!existsSync(cwd)) {
      return createErrorResult({
        error: 'ProjectNotFound',
        reason: `Project directory does not exist: ${cwd}`,
        suggestion: 'Verify the project path is correct',
        details: { projectPath: cwd }
      });
    }

    // Pre-flight checks for specific commands
    if (args.command === 'provision' || args.command === 'deploy' || args.command === 'package' || args.command === 'publish' || args.command === 'validate') {
      // Check for m365agents.yml file
      const configFile = `${cwd}/m365agents.yml`;
      const envConfigFile = args.env ? `${cwd}/m365agents.${args.env}.yml` : null;

      if (!existsSync(configFile) && (!envConfigFile || !existsSync(envConfigFile))) {
        return createErrorResult({
          error: 'ConfigurationNotFound',
          reason: 'Required m365agents.yml configuration file not found',
          suggestion: 'Ensure you are in a valid ATK project directory. The configuration file should exist at the project root.',
          details: {
            projectPath: cwd,
            expectedFiles: envConfigFile ? [configFile, envConfigFile] : [configFile]
          }
        });
      }
    }

    // Deploy requires provisioning to have been done first
    if (args.command === 'deploy' && args.env) {
      const envFile = `${cwd}/.env.${args.env}`;
      if (!existsSync(envFile)) {
        return createErrorResult({
          error: 'EnvironmentNotProvisioned',
          reason: `Environment '${args.env}' has not been provisioned yet`,
          suggestion: `Run atk_run with command "provision" first for environment "${args.env}"`,
          details: {
            projectPath: cwd,
            environment: args.env,
            expectedEnvFile: envFile
          }
        });
      }

      // Check if deploy action exists in m365agents.yml
      if (!hasDeployAction(cwd, args.env)) {
        return createSuccessResult(`No deploy action found in m365agents.yml configuration.

This project does not have a deploy action configured, so there is nothing to deploy.
If you need to deploy code, add a deploy action to your m365agents.yml file.`);
      }
    }
  }

  // Determine timeout based on command
  let timeout = 30000; // Default 30 seconds
  switch (args.command) {
    case 'new':
      timeout = ATK_TIMEOUTS.new;
      break;
    case 'provision':
      timeout = ATK_TIMEOUTS.provision;
      break;
    case 'deploy':
      timeout = ATK_TIMEOUTS.deploy;
      break;
    case 'package':
      timeout = ATK_TIMEOUTS.package;
      break;
    case 'publish':
      timeout = ATK_TIMEOUTS.publish;
      break;
    case 'validate':
      timeout = ATK_TIMEOUTS.validate;
      break;
    case 'doctor':
      timeout = ATK_TIMEOUTS.doctor;
      break;
    case 'login':
    case 'logout':
      timeout = ATK_TIMEOUTS.auth;
      break;
  }

  // Execute the ATK command
  const result = await executeATKCommand({
    command: 'atk',
    args: atkArgs,
    cwd,
    timeout,
    onProgress
  });

  const cleanedOutput = cleanCLIOutput(result.stdout + '\n' + result.stderr);

  if (!result.success) {
    return {
      content: [{
        type: 'text',
        text: `ATK ${args.command} command failed

Working Directory: ${cwd}
Command: atk ${atkArgs.join(' ')}

${cleanedOutput}

${getCommandSpecificError(args.command)}`
      }],
      isError: true
    };
  }

  // Build success message using formatters
  let successMessage: string;

  if (args.command === 'new' && args.name) {
    // Special formatting for "new" command
    successMessage = formatNewCommandSuccess({
      name: args.name,
      format: args.format,
      targetDir: args.targetDir,
      cleanedOutput
    });
  } else if (args.command === 'provision' || args.command === 'deploy' || args.command === 'publish') {
    // Format commands that include Title ID
    successMessage = formatCommandWithTitleId({
      command: args.command,
      cwd,
      atkArgs,
      cleanedOutput,
      fullOutput: result.stdout + '\n' + result.stderr
    });
  } else {
    // Generic formatting for other commands
    successMessage = formatGenericSuccess({
      command: args.command,
      cwd,
      atkArgs,
      cleanedOutput
    });
  }

  return createSuccessResult(successMessage);
}

/**
 * Get command-specific error suggestions
 */
function getCommandSpecificError(command: string): string {
  const errors: Record<string, string> = {
    'new': 'Common issues:\n- Invalid template or format\n- Target directory already exists\n- Missing required parameters',
    'provision': 'Common issues:\n- Not logged in (use atk_run with command: "login")\n- Invalid environment configuration\n- Azure subscription issues\n- Missing permissions',
    'deploy': 'Common issues:\n- Project not provisioned\n- Build errors\n- Invalid environment',
    'package': 'Common issues:\n- Missing manifest files\n- Invalid app package structure\n- Validation errors',
    'publish': 'Common issues:\n- Microsoft employees (@microsoft.com) must use https://substrate.microsoft.net/v2/build instead\n- Not logged in (use atk_run with command: "login")\n- Invalid app package\n- Insufficient permissions',
    'validate': 'Common issues:\n- Invalid manifest schema\n- Missing required fields\n- Incorrect file references',
    'login': 'Common issues:\n- Invalid tenant ID\n- Browser not available\n- Network connectivity issues',
    'logout': 'Common issues:\n- Not currently logged in\n- Network connectivity issues',
    'doctor': 'Common issues:\n- Missing dependencies\n- Version conflicts',
  };

  return errors[command] || 'Check the error message above for details.';
}

export const atkRunToolDefinition = {
  name: 'atk_run',
  description: `Run any Microsoft 365 Agents Toolkit (ATK) CLI command through a unified interface.

**Purpose:**
Provides a single tool to execute all ATK commands (new, provision, deploy, package, publish, validate, doctor, version, login, logout) with appropriate parameters.

**Commands:**
- **new**: Create a new agent project
- **provision**: Provision Azure resources for an environment
- **deploy**: Deploy agent code to Azure
- **package**: Create app package for distribution
- **publish**: Publish agent to Microsoft 365 (Note: Microsoft employees must use https://substrate.microsoft.net/v2/build instead)
- **validate**: Validate agent manifests and configuration
- **doctor**: Diagnose environment and dependencies
- **version**: Show ATK CLI version (automatically uses \`atk --version\`)
- **login**: Login to Microsoft 365 (automatically uses \`atk auth login m365\`)
- **logout**: Logout from Microsoft 365 (automatically uses \`atk auth logout m365\`)

**Common Parameters:**
- \`command\`: (required) The ATK command to run
- \`projectPath\`: Path to project directory (required for most commands except doctor/version/login/logout)
- \`env\`: Environment name like "dev", "local", "prod". Defaults to "local" for provision, deploy, package, and validate commands. Required for publish command.

**Important Notes:**
- **Microsoft Employees**: If you are logged in with a @microsoft.com account, the publish command will be blocked. Microsoft employees must use the Microsoft 365 Core Dev Center instead: https://substrate.microsoft.net/v2/build

**Example Usage:**

Create new project:
{
  "command": "new",
  "name": "my-agent",
  "template": "declarative-agent",
  "format": "typespec"
}

Provision to local environment (env defaults to "local"):
{
  "command": "provision",
  "projectPath": "./my-agent"
}

Provision to dev environment:
{
  "command": "provision",
  "projectPath": "./my-agent",
  "env": "dev"
}

Deploy to local environment (env defaults to "local"):
{
  "command": "deploy",
  "projectPath": "./my-agent"
}

Package agent for local (env defaults to "local"):
{
  "command": "package",
  "projectPath": "./my-agent"
}

Validate agent (env defaults to "local"):
{
  "command": "validate",
  "projectPath": "./my-agent"
}

Publish agent (env required, no default):
{
  "command": "publish",
  "projectPath": "./my-agent",
  "env": "dev"
}

Check environment:
{
  "command": "doctor"
}

Check ATK version:
{
  "command": "version"
}

Login to Microsoft 365:
{
  "command": "login"
}

Login to specific tenant:
{
  "command": "login",
  "tenant": "your-tenant-id"
}

Logout from Microsoft 365:
{
  "command": "logout"
}`,
  inputSchema: {
    type: 'object',
    properties: {
      command: {
        type: 'string',
        enum: ['new', 'provision', 'deploy', 'package', 'publish', 'validate', 'doctor', 'version', 'login', 'logout'],
        description: 'The ATK command to run'
      },
      projectPath: {
        type: 'string',
        description: 'Path to the project directory (not needed for doctor/version/login/logout)'
      },
      env: {
        type: 'string',
        description: 'Environment name (dev, local, prod, etc.). Defaults to "local" for provision, deploy, package, and validate. Required for publish command.'
      },
      name: {
        type: 'string',
        description: 'Project name (required for new command)'
      },
      template: {
        type: 'string',
        description: 'Template type (required for new command)'
      },
      format: {
        type: 'string',
        description: 'Format type (required for new command)'
      },
      targetDir: {
        type: 'string',
        description: 'Target directory for new project'
      },
      tenant: {
        type: 'string',
        description: 'Tenant ID for login'
      },
      interactive: {
        type: 'boolean',
        description: 'Run in interactive mode'
      },
      verbose: {
        type: 'boolean',
        description: 'Enable verbose output'
      }
    },
    required: ['command']
  }
};
