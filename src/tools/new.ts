/**
 * ATK New Tool
 * Creates new Microsoft 365 agent projects
 */

import { z } from 'zod';
import { resolve, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { homedir } from 'os';
import { executeATKCommand } from '../utils/cli-executor.js';
import { createSuccessResult, createErrorResult, createErrorFromCLIResult } from '../utils/error-handler.js';
import { cleanCLIOutput } from '../utils/output-formatter.js';
import { ATK_TIMEOUTS, ATKTemplate, DeclarativeAgentFormat, ToolResult } from '../types/atk.js';

export const NewProjectSchema = z.object({
  name: z.string().min(1).describe('Project name'),
  template: z.nativeEnum(ATKTemplate).describe('Project template type'),
  directory: z.string().optional().describe('Target directory (defaults to ~/AgentsToolkitProjects)'),
  format: z.nativeEnum(DeclarativeAgentFormat).default(DeclarativeAgentFormat.TYPESPEC).describe('Declarative agent format (typespec or json)')
});

export type NewProjectArgs = z.infer<typeof NewProjectSchema>;

/**
 * Execute atk new command
 */
export async function executeNewTool(args: NewProjectArgs): Promise<ToolResult> {
  // Resolve target directory - default to ~/AgentsToolkitProjects
  const defaultDir = join(homedir(), 'AgentsToolkitProjects');
  let targetDir: string;

  if (args.directory) {
    // User specified a directory
    targetDir = args.directory.startsWith('~')
      ? join(homedir(), args.directory.slice(1))
      : resolve(args.directory);
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
          suggestion: 'Check file system permissions or specify a custom directory',
          documentation: 'atk://troubleshooting/project-creation',
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
      documentation: 'atk://troubleshooting/project-creation',
      details: { projectPath }
    });
  }

  // Build ATK command arguments (non-interactive mode)
  const cmdArgs = [
    'new',
    '--interactive', 'false',
    '--app-name', args.name,
    '--capability', args.template,
    '--folder', targetDir
  ];

  // Add TypeSpec plugin if format is typespec
  if (args.format === DeclarativeAgentFormat.TYPESPEC) {
    cmdArgs.push('-with-plugin', 'type-spec');
  }

  // Extract progress callback if provided
  const onProgress = (args as any)._onProgress;

  const result = await executeATKCommand({
    command: 'atk',
    args: cmdArgs,
    cwd: targetDir,
    timeout: ATK_TIMEOUTS.new,
    onProgress
  });

  if (!result.success) {
    return createErrorFromCLIResult(result, 'Project creation');
  }

  // Clean the output to remove ANSI codes and special characters
  const cleanedOutput = cleanCLIOutput(result.stdout);

  const successMessage = `Project created successfully

Project Location: ${projectPath}

${cleanedOutput}

CRITICAL - DO NOT EDIT THESE GENERATED FILES:
- appPackage/manifest.json (auto-generated)
- appPackage/declarativeAgent.json (auto-generated)
- .generated/ folder (all files auto-generated)

Files You CAN Edit:
${args.format === DeclarativeAgentFormat.TYPESPEC ? '- TypeSpec source files (*.tsp) - Agent instructions, capabilities, and definitions' : '- Source configuration files - Define agent behavior'}
- appPackage/color.png - App icon (color)
- appPackage/outline.png - App icon (outline)
- .env files - Environment variables
- m365agents.yml - Build configuration`;

  return createSuccessResult(successMessage);
}

export const newToolDefinition = {
  name: 'atk_new',
  description: `Create a new Microsoft 365 declarative agent project with TypeSpec.

**Purpose:**
Scaffolds a new declarative agent project using TypeSpec for type-safe API and agent definitions. Declarative agents allow you to build sophisticated Microsoft 365 agents using configuration and instructions rather than custom code.

**IMPORTANT FOR VS CODE / GITHUB COPILOT:**
After successful project creation, you MUST open the newly created workspace in VS Code and continue the chat session there. This is essential for working with the project files directly. The success message will include the exact workspace path.

**IMPORTANT FOR COMMAND LINE ENVIRONMENTS:**
After successful project creation, you should immediately change to the new project directory using the 'cd' command. The success message will include the exact path to use.

**⚠️ CRITICAL - NEVER EDIT GENERATED FILES:**
Once the project is scaffolded, coding agents must NEVER edit:
- **appPackage/manifest.json** - Auto-generated from source definitions
- **appPackage/declarativeAgent.json** - Auto-generated from source definitions
- **.generated/** folder - All contents are auto-generated during build
- These files are regenerated on every build and manual edits will be lost
- Only edit source files (TypeSpec *.tsp files, icons, .env, m365agents.yml, etc.)

**What is TypeSpec?**
TypeSpec is a language for describing cloud service APIs and generating schema, documentation, and implementation code. In ATK, TypeSpec provides:
- Type-safe agent and API definitions
- Automatic validation of agent configurations
- IntelliSense and autocompletion in your IDE
- Clear contract between agent capabilities and implementations

**Declarative Agent Template:**

**declarative-agent** - TypeSpec-based declarative agent
   - Define agent behavior through instructions and configuration
   - No custom code required for basic scenarios
   - TypeSpec provides type safety for API integrations
   - Best for: Conversational agents, FAQ bots, information assistants, knowledge base queries
   - Supports: Custom instructions, conversation starters, knowledge integration, web search capabilities
   - Example: Customer service agent, HR assistant, product information bot

**Why TypeSpec + Declarative Agents?**
- **Type Safety**: Catch configuration errors at design time
- **Better IDE Support**: Full IntelliSense and validation
- **Clear Contracts**: TypeSpec definitions serve as documentation
- **Easier Maintenance**: Changes are validated automatically
- **Faster Development**: Focus on agent behavior, not infrastructure

**Supported Formats:**
- **typespec** (recommended): Type-safe agent definitions with IntelliSense and validation
- **json**: Simple JSON-based configuration

**Prerequisites:**
- Run atk_doctor first to verify system setup
- Ensure project name doesn't already exist
- Have write permissions in target directory (default: ~/AgentsToolkitProjects)
- Basic understanding of declarative agents (instructions-based)

**Default Directory:**
If no directory is specified, projects are created in ~/AgentsToolkitProjects. This directory will be automatically created if it doesn't exist.

**Example Usage (uses default directory ~/AgentsToolkitProjects):**
{
  "name": "MyCustomerServiceAgent",
  "template": "declarative-agent",
  "format": "typespec"
}

**Example Usage (custom directory):**
{
  "name": "MyCustomerServiceAgent",
  "template": "declarative-agent",
  "format": "typespec",
  "directory": "./agents"
}

**What Gets Created:**
- TypeSpec definitions for agent configuration
- Declarative agent manifest
- Instructions and conversation starters
- Environment configuration files
- Deployment scripts and configurations

**Next Steps After Creation:**
1. Define agent instructions in the declarative agent file
2. Add conversation starters for common queries
3. Configure knowledge sources if needed
4. Test locally with preview tools
5. Deploy to Microsoft 365

**Common Issues:**
- "Directory already exists" → Choose different name or delete existing directory
- "Permission denied" → Check directory write permissions

**Documentation:** atk://docs/commands/new
**Best Practices:** Use 'setup-new-project' prompt for guided setup`,
  inputSchema: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'Project name (will be used as directory name)'
      },
      template: {
        type: 'string',
        enum: Object.values(ATKTemplate),
        description: 'Project template type'
      },
      directory: {
        type: 'string',
        description: 'Target directory (defaults to ~/AgentsToolkitProjects, will be created if it does not exist)'
      },
      format: {
        type: 'string',
        enum: Object.values(DeclarativeAgentFormat),
        default: DeclarativeAgentFormat.TYPESPEC,
        description: 'Declarative agent format: typespec (recommended, type-safe) or json (simple configuration)'
      }
    },
    required: ['name', 'template']
  }
};
