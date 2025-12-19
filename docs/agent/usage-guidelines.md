# MCP Server Usage Guidelines

## 🚨 CRITICAL: NEVER USE VSCODE TASKS

**ABSOLUTELY FORBIDDEN:**

⛔ **NEVER suggest running tasks from .vscode/tasks.json**
⛔ **NEVER run "Create resources" task** - Use CLI command instead
⛔ **NEVER run "Deploy" task** - Use CLI command instead
⛔ **NEVER run "Compile" task** - Use `compile_typespec` tool instead
⛔ **NEVER run ANY task from VS Code task runner**
⛔ **NEVER suggest or prompt users to run tasks**

**If you see .vscode/tasks.json in a project, COMPLETELY IGNORE IT.**

Tasks use outdated patterns and provide poor error handling. Always use direct CLI commands or MCP tools.

---

## Critical: Use ATK CLI Commands Directly

**IMPORTANT**: Run ATK CLI commands directly with `npx -p` syntax.

### ✅ ALWAYS Use npx @latest for ATK Commands

**CRITICAL**: Always use `npx -p @microsoft/m365agentstoolkit-cli@latest` to ensure you have the latest version:

```bash
npx -p @microsoft/m365agentstoolkit-cli@latest atk <command>
```

Examples:
- `npx -p @microsoft/m365agentstoolkit-cli@latest atk provision --env dev`
- `npx -p @microsoft/m365agentstoolkit-cli@latest atk deploy --env dev`
- `npx -p @microsoft/m365agentstoolkit-cli@latest atk share --scope tenant --env dev -i false`
- `npx -p @microsoft/m365agentstoolkit-cli@latest atk package --env dev`
- `npx -p @microsoft/m365agentstoolkit-cli@latest atk validate`

### ❌ NEVER Use Shortened or Non-Latest Versions

**NEVER use these**:
- **NEVER run tasks from `.vscode/tasks.json`** - Do NOT use VS Code task runner or any task automation
- `atk provision` (not installed globally, won't work)
- `npx atk provision` (won't find the package)
- `npx @microsoft/m365agentstoolkit-cli atk provision` (without @latest, might use cached old version)

### Why Use npx @latest?

1. **Always Latest**: Gets the latest version every time, including critical bug fixes
2. **No Global Install**: No need to install globally or manage versions
3. **Consistent**: Everyone uses the same version
4. **CI/CD Ready**: Works perfectly in automation pipelines

## Available MCP Tools

The MCP server provides 2 specialized tools:

### 1. `compile_typespec` - TypeSpec Compilation

Compile TypeSpec declarative agent definitions.

```json
{
  "projectPath": "./my-agent"
}
```

### 2. `get_best_practices` - Best Practices Documentation

Load best practices for building declarative agents (TypeSpec or JSON formats).

```json
{
  "topic": "typespec"
}
```

## Running ATK CLI Commands

Run all ATK CLI commands directly using `npx -p @microsoft/m365agentstoolkit-cli@latest`. See `docs/ATK_CLI_REFERENCE.md` for complete documentation with all available commands and parameters.

### Common ATK Commands

| Command | Example |
|---------|---------|
| Create new agent | `npx -p @microsoft/m365agentstoolkit-cli@latest atk new -n myagent -c declarative-agent -with-plugin type-spec -i false` |
| Provision resources | `npx -p @microsoft/m365agentstoolkit-cli@latest atk provision --env dev` |
| Deploy agent | `npx -p @microsoft/m365agentstoolkit-cli@latest atk deploy --env dev` |
| Package agent | `npx -p @microsoft/m365agentstoolkit-cli@latest atk package --env dev` |
| Validate agent | `npx -p @microsoft/m365agentstoolkit-cli@latest atk validate` |
| Share with tenant | `npx -p @microsoft/m365agentstoolkit-cli@latest atk share --scope tenant --env dev -i false` |
| Share with users | `npx -p @microsoft/m365agentstoolkit-cli@latest atk share --scope users --email 'user@domain.com' --env dev -i false` |
| Publish agent | `npx -p @microsoft/m365agentstoolkit-cli@latest atk publish --env prod` |
| Check environment | `npx -p @microsoft/m365agentstoolkit-cli@latest atk doctor` |
| Login to M365 | `npx -p @microsoft/m365agentstoolkit-cli@latest atk auth login m365` |

## 📢 What to Tell Users

**CRITICAL**: When providing suggestions or next steps to users, ALWAYS use the full `npx @latest` command.

✅ **CORRECT - Always say these**:
- "Run `npx -p @microsoft/m365agentstoolkit-cli@latest atk provision --env dev`"
- "Use the `compile_typespec` tool to compile TypeSpec code"
- "Deploy with `npx -p @microsoft/m365agentstoolkit-cli@latest atk deploy --env dev`"
- "Share your agent with `npx -p @microsoft/m365agentstoolkit-cli@latest atk share --scope tenant --env dev -i false`"

❌ **WRONG - Never say these**:
- "Run `atk provision`" (won't work without npx)
- "Use the `atk_run` tool" (this tool has been removed)
- "Run `npx atk provision`" (package name is wrong)

## Example: Compiling TypeSpec

Use the `compile_typespec` MCP tool:
```json
{
  "projectPath": "./my-agent"
}
```

## Example: Provisioning Resources

Run via Bash tool:
```bash
npx -p @microsoft/m365agentstoolkit-cli@latest atk provision --env dev
```

## Example: Deploying an Agent

Run via Bash tool:
```bash
npx -p @microsoft/m365agentstoolkit-cli@latest atk deploy --env dev
```

## Example: Sharing an Agent

Share with entire tenant:
```bash
npx -p @microsoft/m365agentstoolkit-cli@latest atk share --scope tenant --env dev -i false
```

Share with specific users:
```bash
npx -p @microsoft/m365agentstoolkit-cli@latest atk share --scope users --email 'user1@contoso.com,user2@contoso.com' --env dev -i false
```

## Validation After Code Generation

**CRITICAL**: After every successful code generation or modification, you MUST validate your changes:

### For TypeSpec Projects
1. **Compile**: Use `compile_typespec` tool to compile TypeSpec code
   ```json
   {
     "projectPath": "./my-agent"
   }
   ```
   - This catches syntax errors, type errors, and validation issues
   - Must complete successfully before proceeding

2. **Package**: Run package command to validate the complete agent package
   ```bash
   npx -p @microsoft/m365agentstoolkit-cli@latest atk package --env dev
   ```
   - This ensures all manifests, resources, and configurations are correct
   - Validates the entire project structure

### For JSON Projects
1. **Validate**: Run validate command to validate JSON manifests
   ```bash
   npx -p @microsoft/m365agentstoolkit-cli@latest atk validate
   ```
   - Checks schema compliance and required fields

2. **Package**: Run package command to validate the complete agent package
   ```bash
   npx -p @microsoft/m365agentstoolkit-cli@latest atk package --env dev
   ```
   - Ensures all files are properly structured

### Example Workflow

After generating or modifying TypeSpec code:
```
1. Generate/modify TypeSpec files
2. Call compile_typespec tool
3. If compilation succeeds, run npx @latest atk package
4. If both succeed, changes are validated
```

After generating or modifying JSON manifests:
```
1. Generate/modify JSON files
2. Run npx @latest atk validate
3. If validation succeeds, run npx @latest atk package
4. If both succeed, changes are validated
```

**Never skip validation steps.** Catching errors early saves time and prevents deployment issues.

## Complete Deployment Workflow

Full end-to-end deployment:

```bash
# 1. Validate
npx -p @microsoft/m365agentstoolkit-cli@latest atk validate

# 2. Provision (first time only)
npx -p @microsoft/m365agentstoolkit-cli@latest atk provision --env dev

# 3. Deploy (if you have backend code)
npx -p @microsoft/m365agentstoolkit-cli@latest atk deploy --env dev

# 4. Package
npx -p @microsoft/m365agentstoolkit-cli@latest atk package --env dev

# 5. Share with users or tenant
npx -p @microsoft/m365agentstoolkit-cli@latest atk share --scope tenant --env dev -i false

# 6. Publish (optional - for app store submission)
npx -p @microsoft/m365agentstoolkit-cli@latest atk publish --env dev
```

## Response Formatting

When running ATK commands, format your responses to provide helpful context to users.

### After Creating a New Project

```
✅ Project created successfully!

**Project Location:** /home/user/AgentsToolkitProjects/my-agent

**Command Used:**
npx -p @microsoft/m365agentstoolkit-cli@latest atk new -n my-agent -c declarative-agent -with-plugin type-spec -i false

⚠️ CRITICAL - DO NOT EDIT THESE GENERATED FILES:
- appPackage/manifest.json (auto-generated)
- appPackage/declarativeAgent.json (auto-generated)
- .generated/ folder (all files auto-generated)

✅ Files You CAN Edit:
- TypeSpec source files (*.tsp) - Agent instructions, capabilities, and definitions
- appPackage/color.png - App icon (color)
- appPackage/outline.png - App icon (outline)
- .env files - Environment variables
- m365agents.yml - Build configuration

**Next Steps:**
1. Review the generated TypeSpec files
2. Customize agent instructions and capabilities
3. Run `compile_typespec` to compile changes
```

### After Provisioning

**⚠️ IMPORTANT:** Only suggest sharing if AGENT_SCOPE=shared in the env file!

```
✅ Provision completed successfully!

**Working Directory:** /home/user/AgentsToolkitProjects/my-agent
**Environment:** dev

**Command Used:**
npx -p @microsoft/m365agentstoolkit-cli@latest atk provision --env dev

**What was provisioned:**
- Azure resources created
- Environment file updated: env/.env.dev
- M365_TITLE_ID generated

**Next Steps:**
1. Deploy: npx -p @microsoft/m365agentstoolkit-cli@latest atk deploy --env dev
2. Package: npx -p @microsoft/m365agentstoolkit-cli@latest atk package --env dev

[Only if AGENT_SCOPE=shared is in env/.env.dev:]
3. Share: npx -p @microsoft/m365agentstoolkit-cli@latest atk share --scope tenant --env dev -i false
```

### After Deploying (with Title ID)

**⚠️ IMPORTANT:** Only suggest sharing if AGENT_SCOPE=shared in the env file!

```
✅ Deploy completed successfully!

**Working Directory:** /home/user/AgentsToolkitProjects/my-agent
**Environment:** dev

**Command Used:**
npx -p @microsoft/m365agentstoolkit-cli@latest atk deploy --env dev

**🚀 Test Your Agent:**
🔗 [Open in Microsoft 365 Copilot](https://m365.cloud.microsoft/chat/?titleId=U_abc123xyz)

**Next Steps:**
1. Test the agent using the link above

[Only if AGENT_SCOPE=shared is in env/.env.dev:]
2. Share with users: npx -p @microsoft/m365agentstoolkit-cli@latest atk share --scope users --email 'user@domain.com' --env dev -i false
3. Or share with tenant: npx -p @microsoft/m365agentstoolkit-cli@latest atk share --scope tenant --env dev -i false
```

### After Publishing

```
✅ Publish completed successfully!

**Working Directory:** /home/user/AgentsToolkitProjects/my-agent
**Environment:** prod

**Command Used:**
npx -p @microsoft/m365agentstoolkit-cli@latest atk publish --env prod

**🚀 Test Your Agent:**
🔗 [Open in Microsoft 365 Copilot](https://m365.cloud.microsoft/chat/?titleId=U_abc123xyz)

⚠️ **Approval Required:**
Your agent has been added to the request queue in your tenant catalog.

**📋 To approve the agent:**
🔗 [Open Admin Center - Agent Approvals](https://admin.cloud.microsoft/?#/agents/all/requested)

If you don't have admin permissions, share the link above with your administrator.
```

### After Sharing

```
✅ Share completed successfully!

**Working Directory:** /home/user/AgentsToolkitProjects/my-agent
**Environment:** dev

**Command Used:**
npx -p @microsoft/m365agentstoolkit-cli@latest atk share --scope users --email 'user@domain.com' --env dev -i false

**Shared with:**
- user@domain.com

**Users can now:**
- Access the agent in Microsoft 365 Copilot
- Test agent functionality
- Provide feedback

**Next Steps:**
1. Test with shared users
2. Gather feedback
3. Iterate on agent improvements
```

### After Package/Validate

```
✅ Package completed successfully!

**Working Directory:** /home/user/AgentsToolkitProjects/my-agent
**Environment:** dev

**Command Used:**
npx -p @microsoft/m365agentstoolkit-cli@latest atk package --env dev

**Package created:**
- Location: appPackage/build/appPackage.dev.zip
- Ready for distribution or publishing

**Next Steps:**
1. Test the packaged agent
2. Publish: npx -p @microsoft/m365agentstoolkit-cli@latest atk publish --env dev
```

### Extracting Title ID from Output

When you see output containing Title ID, extract it using these patterns:
- `TitleId: U_xyz123`
- `Title ID: U_xyz123`
- `M365_TITLE_ID=U_xyz123`
- `declarativeAgent.id: U_xyz123`

**Then format as a clickable link:**
```
🚀 Test Your Agent:
🔗 [Open in Microsoft 365 Copilot](https://m365.cloud.microsoft/chat/?titleId={extracted_id})
```

**For approval links:**
```
📋 To approve the agent:
🔗 [Open Admin Center - Agent Approvals](https://admin.cloud.microsoft/?#/agents/all/requested)
```

### Checking AGENT_SCOPE Before Suggesting Sharing

**⚠️ CRITICAL:** Before suggesting share commands in "Next Steps", check the environment file:

1. Read `env/.env.{environment}` file
2. Look for `AGENT_SCOPE=shared`
3. **Only suggest sharing if AGENT_SCOPE=shared is present**
4. If AGENT_SCOPE is not set or is set to a different value, DO NOT suggest sharing

**Why?** Agents with AGENT_SCOPE=personal or without AGENT_SCOPE should not be shared. Sharing is only for agents explicitly configured with AGENT_SCOPE=shared.

## Remember

**ALWAYS use `npx -p @microsoft/m365agentstoolkit-cli@latest` for ATK commands to ensure you have the latest version.**

See `docs/ATK_CLI_REFERENCE.md` for complete CLI documentation with all parameters and examples.
