/**
 * Get Best Practices Tool
 * Retrieves the official Declarative Agent best practices from local documentation
 */

import { z } from 'zod';
import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createSuccessResult, createErrorResult } from '../utils/error-handler.js';
import { ToolResult } from '../types/atk.js';
import { info as logInfo, error as logError } from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..', '..');

const TYPESPEC_BEST_PRACTICES_PATH = join(PROJECT_ROOT, 'docs', 'TYPESPEC_BEST_PRACTICES.md');
const JSON_BEST_PRACTICES_PATH = join(PROJECT_ROOT, 'docs', 'JSON_BEST_PRACTICES.md');
const ATK_CLI_REFERENCE_PATH = join(PROJECT_ROOT, 'docs', 'ATK_CLI_REFERENCE.md');

export const GetBestPracticesSchema = z.object({
  type: z.enum(['typespec', 'json', 'both']).optional().default('typespec')
});

export type GetBestPracticesArgs = z.infer<typeof GetBestPracticesSchema>;

/**
 * Load best practices from local documentation
 */
async function loadBestPractices(type: 'typespec' | 'json' | 'both'): Promise<string> {
  try {
    logInfo(`Loading ${type} best practices from local documentation...`);

    // Always load CLI reference
    const cliReference = await readFile(ATK_CLI_REFERENCE_PATH, 'utf-8');

    if (type === 'both') {
      const [typespecContent, jsonContent] = await Promise.all([
        readFile(TYPESPEC_BEST_PRACTICES_PATH, 'utf-8'),
        readFile(JSON_BEST_PRACTICES_PATH, 'utf-8')
      ]);
      logInfo('Successfully loaded both best practices and CLI reference');
      return `# TypeSpec Best Practices\n\n${typespecContent}\n\n---\n\n# JSON Best Practices\n\n${jsonContent}\n\n---\n\n# ATK CLI Reference\n\n${cliReference}`;
    } else if (type === 'typespec') {
      const content = await readFile(TYPESPEC_BEST_PRACTICES_PATH, 'utf-8');
      logInfo('Successfully loaded TypeSpec best practices and CLI reference');
      return `${content}\n\n---\n\n# ATK CLI Reference\n\n${cliReference}`;
    } else {
      const content = await readFile(JSON_BEST_PRACTICES_PATH, 'utf-8');
      logInfo('Successfully loaded JSON best practices and CLI reference');
      return `${content}\n\n---\n\n# ATK CLI Reference\n\n${cliReference}`;
    }
  } catch (err) {
    const error = err as Error;
    logError('Failed to load best practices', {
      type,
      error: error.message
    });
    throw new Error(`Failed to load best practices: ${error.message}`);
  }
}

/**
 * Execute get best practices
 */
export async function executeGetBestPracticesTool(rawArgs: unknown): Promise<ToolResult> {
  const args = GetBestPracticesSchema.parse(rawArgs);

  try {
    const content = await loadBestPractices(args.type);

    const typeLabel = args.type === 'both' ? 'TypeSpec and JSON' :
                      args.type === 'typespec' ? 'TypeSpec' : 'JSON';

    const successMessage = `# ${typeLabel} Declarative Agent Best Practices & ATK CLI Reference

> **Source**: Local Documentation (docs/${args.type === 'both' ? 'TYPESPEC_BEST_PRACTICES.md, JSON_BEST_PRACTICES.md, and ATK_CLI_REFERENCE.md' : args.type === 'typespec' ? 'TYPESPEC_BEST_PRACTICES.md and ATK_CLI_REFERENCE.md' : 'JSON_BEST_PRACTICES.md and ATK_CLI_REFERENCE.md'})
> **Location**: MCP Server Documentation

---

${content}

---

## What's Next?

Now that you have the best practices and CLI reference loaded, you can:

1. **Ask questions** about any of the patterns, practices, or CLI commands
2. **Use the MCP server tools**:
   - \`compile_typespec\` - Compile TypeSpec declarative agents
   - \`get_best_practices\` - Load best practices documentation (you just did this!)
3. **Run ATK CLI commands directly**:
   - ALWAYS use: \`npx -p @microsoft/m365agentstoolkit-cli@latest atk <command>\`
   - Example: \`npx -p @microsoft/m365agentstoolkit-cli@latest atk provision --env dev\`
   - All available commands are documented above in the ATK CLI Reference section
4. **Reference this guide** while building your declarative agent

## 🚨 CRITICAL: NEVER USE VSCODE TASKS

**ABSOLUTELY FORBIDDEN - DO NOT USE .vscode/tasks.json:**

⛔ **NEVER suggest running tasks from .vscode/tasks.json**
⛔ **NEVER run "Create resources" task** (use \`npx -p @microsoft/m365agentstoolkit-cli@latest atk provision\` instead)
⛔ **NEVER run "Deploy" task** (use \`npx -p @microsoft/m365agentstoolkit-cli@latest atk deploy\` instead)
⛔ **NEVER run "Compile" task** (use \`compile_typespec\` tool instead)
⛔ **NEVER run ANY task from VS Code task runner**
⛔ **NEVER use \`npm run compile\`** (use \`compile_typespec\` tool instead)
⛔ **NEVER use \`cd\` commands followed by npm commands**

**If you see tasks in .vscode/tasks.json, IGNORE THEM COMPLETELY.**

**Why?** Tasks use outdated command patterns and don't provide proper error handling or progress reporting. Always use direct CLI commands or MCP tools instead.

**ALWAYS use the correct commands:**
- TypeSpec compilation: Use \`compile_typespec\` MCP tool
- ATK commands: Use \`npx -p @microsoft/m365agentstoolkit-cli@latest atk <command>\`

**Remember:** The MCP server provides:
- \`compile_typespec\` for TypeSpec compilation
- \`get_best_practices\` for loading documentation (includes CLI reference)
- Direct command execution for ATK CLI with \`npx @latest\`

---

## 📝 Response Formatting Guidelines

When you run ATK commands, format your responses to provide helpful context to users:

**After Creating a New Project:**
- Show project location
- List command used
- Warn about auto-generated files (DO NOT EDIT)
- List files that CAN be edited
- Provide clear next steps

**After Provisioning/Deploying:**
- Show working directory and environment
- List command used
- If Title ID is found, format as clickable link: \`🚀 Test Your Agent:\n🔗 [Open in Microsoft 365 Copilot](https://m365.cloud.microsoft/chat/?titleId={id})\`
- **CRITICAL:** Check env/.env.{environment} file for AGENT_SCOPE=shared
- Only suggest sharing commands if AGENT_SCOPE=shared is present in the env file
- Provide next steps (deploy, package, and share only if AGENT_SCOPE=shared)

**After Publishing:**
- Show command used and Title ID
- Format test link as clickable: \`🚀 Test Your Agent:\n🔗 [Open in Microsoft 365 Copilot](https://m365.cloud.microsoft/chat/?titleId={id})\`
- Include clickable approval link: \`📋 To approve the agent:\n🔗 [Open Admin Center - Agent Approvals](https://admin.cloud.microsoft/?#/agents/all/requested)\`
- Note that admin approval is required

**After Sharing:**
- Show command used
- List who the agent was shared with
- Explain what users can now do
- Suggest next steps (testing, feedback)

**Title ID Extraction and Link Formatting:**

Extract Title ID using these patterns:
- \`TitleId: U_xyz123\`
- \`Title ID: U_xyz123\`
- \`M365_TITLE_ID=U_xyz123\`
- \`declarativeAgent.id: U_xyz123\`

Then format as clickable links:
- Test link: \`🚀 Test Your Agent:\n🔗 [Open in Microsoft 365 Copilot](https://m365.cloud.microsoft/chat/?titleId={id})\`
- Approval link: \`📋 To approve:\n🔗 [Open Admin Center - Agent Approvals](https://admin.cloud.microsoft/?#/agents/all/requested)\`

**⚠️ CRITICAL - Checking AGENT_SCOPE Before Suggesting Sharing:**

Before suggesting share commands:
1. Read the \`env/.env.{environment}\` file
2. Look for \`AGENT_SCOPE=shared\`
3. **ONLY suggest sharing if AGENT_SCOPE=shared is present**
4. If AGENT_SCOPE is not set or has a different value, DO NOT suggest sharing

Agents without AGENT_SCOPE=shared should not be shared with users or tenant.

See docs/agent/usage-guidelines.md for complete formatting examples.`;

    return createSuccessResult(successMessage);

  } catch (error) {
    const err = error as Error;
    return createErrorResult({
      error: 'BestPracticesLoadFailed',
      reason: `Failed to load ${args.type} best practices: ${err.message}`,
      suggestion: 'Ensure the best practices markdown files exist in the docs/ folder.',
      details: {
        type: args.type,
        error: err.message
      }
    });
  }
}

export const getBestPracticesToolDefinition = {
  name: 'get_best_practices',
  description: `⚠️ CRITICAL: Call this tool FIRST before ANY agent or ATK work!

🚨 NEVER USE .vscode/tasks.json - If you see tasks, IGNORE THEM and use CLI commands instead!

Gets comprehensive best practices and ATK CLI reference documentation for Microsoft 365 Copilot declarative agents.

MANDATORY: You MUST call this tool BEFORE:
- Running ANY ATK CLI commands (provision, deploy, package, share, validate, etc.)
- Creating new agents
- Modifying existing agents
- Adding capabilities, features, or APIs to agents
- Enhancing or making agents "fully-featured"
- Working with agent instructions or scoping
- Any code generation involving declarative agents, TypeSpec, JSON manifests, API plugins, or capabilities
- Using TypeSpec or JSON to build agents

This tool provides:
1. Best practices for agent development (TypeSpec or JSON)
2. Complete ATK CLI reference with all commands, parameters, and examples
3. Correct command syntax (npx -p @microsoft/m365agentstoolkit-cli@latest)
4. Critical warnings about what NOT to do (.vscode tasks, incorrect commands)

The documentation does not change, so once called during the current session, you do not need to invoke it again. Returns a comprehensive markdown guide.`,
  inputSchema: {
    type: 'object',
    properties: {
      type: {
        type: 'string',
        enum: ['typespec', 'json', 'both'],
        description: 'Type of best practices to load: typespec (default), json, or both',
        default: 'typespec'
      }
    },
    required: []
  }
};
