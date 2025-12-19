# MCP Server Usage Guidelines

## Critical: Always Use MCP Server Tools

**IMPORTANT**: When working with this MCP server, you MUST use the provided MCP tools for all operations. Do NOT use direct CLI commands.

### ❌ NEVER Use These Commands Directly

**CRITICAL**: Do NOT run tasks from `.vscode/tasks.json` or any task runner. Always use the CLI through MCP tools.

**NEVER EVER run these commands directly or in any combination**:
- `npm run compile` (use `compile_typespec` tool instead)
- `cd /path && npm run compile` (use `compile_typespec` tool instead)
- `npm run build`
- `npm run deploy`
- `atk provision`
- `atk deploy`
- `atk package`
- `atk publish`
- `atk validate`
- `atk compile`
- `atk new`
- `atk doctor`
- `atk --version`
- `atk auth login m365`
- `atk auth logout m365`
- `npx @microsoft/m365agentstoolkit-cli ...`
- Tasks from `.vscode/tasks.json` or any task runner
- Any other `atk` or CLI commands

### ✅ ALWAYS Use MCP Server Tools Instead

The MCP server provides 3 main tools:

| Instead of... | Use MCP Tool |
|---------------|--------------|
| `npm run compile` | `compile_typespec` tool |
| `atk new` | `atk_run` tool with `command: "new"` |
| `atk provision` | `atk_run` tool with `command: "provision"` |
| `atk deploy` | `atk_run` tool with `command: "deploy"` |
| `atk package` | `atk_run` tool with `command: "package"` |
| `atk publish` | `atk_run` tool with `command: "publish"` |
| `atk validate` | `atk_run` tool with `command: "validate"` |
| `atk doctor` | `atk_run` tool with `command: "doctor"` |
| `atk --version` | `atk_run` tool with `command: "version"` |
| `atk auth login m365` | `atk_run` tool with `command: "login"` |
| `atk auth logout m365` | `atk_run` tool with `command: "logout"` |

## Why Use MCP Server Tools?

1. **Consistent Interface**: All operations follow the same pattern and error handling
2. **Better Error Messages**: MCP tools provide structured error responses with suggestions
3. **Progress Tracking**: Operations report progress through the MCP protocol
4. **Validation**: Input validation happens before execution
5. **Logging**: All operations are logged consistently
6. **Integration**: Tools integrate with the MCP context and state

## 📢 What to Tell Users

**CRITICAL**: When providing suggestions or next steps to users, ALWAYS reference MCP tools, NEVER direct CLI commands.

❌ **WRONG - Never say these**:
- "Run `atk provision --env local`"
- "You can now run `npm run compile`"
- "Deploy with `atk deploy --env dev`"
- "Execute `atk validate`"

✅ **CORRECT - Always say these instead**:
- "Use the `atk_run` tool with `{\"command\": \"provision\", \"projectPath\": \"./project\", \"env\": \"local\"}`"
- "Use the `compile_typespec` tool with `{\"projectPath\": \"./project\"}`"
- "Deploy using the `atk_run` tool with `{\"command\": \"deploy\", \"projectPath\": \"./project\", \"env\": \"dev\"}`"
- "Validate with the `atk_run` tool with `{\"command\": \"validate\", \"projectPath\": \"./project\"}`"

**Remember**: The MCP server is the ONLY interface. All suggestions must go through the tools.

## Example: Compiling TypeSpec

❌ **WRONG:**
```bash
npm run compile
```

✅ **CORRECT:**
Use the `compile_typespec` tool:
```json
{
  "projectPath": "./my-agent"
}
```

## Example: Creating a New Project

❌ **WRONG:**
```bash
atk new my-agent --template declarative-agent --format typespec
```

✅ **CORRECT:**
Use the `atk_run` tool:
```json
{
  "command": "new",
  "name": "my-agent",
  "template": "declarative-agent",
  "format": "typespec"
}
```

## Example: Provisioning Resources

❌ **WRONG:**
```bash
atk provision --env dev
```

✅ **CORRECT:**
Use the `atk_run` tool:
```json
{
  "command": "provision",
  "projectPath": "./my-agent",
  "env": "dev"
}
```

## Example: Deploying an Agent

❌ **WRONG:**
```bash
atk deploy --env dev
```

✅ **CORRECT:**
Use the `atk_run` tool:
```json
{
  "command": "deploy",
  "projectPath": "./my-agent",
  "env": "dev"
}
```

## Available Tools

The MCP server provides 3 main tools:

### 1. `atk_run` - Unified ATK Command Runner

Run any ATK command through a single tool interface. The `command` parameter determines the operation:

**Project Management Commands:**
- `{"command": "new"}` - Create new agent projects
- `{"command": "doctor"}` - Diagnose environment setup
- `{"command": "version"}` - Check ATK version

**Authentication Commands:**
- `{"command": "login"}` - Login to Microsoft 365
- `{"command": "logout"}` - Logout from Microsoft 365

**Deployment Commands:**
- `{"command": "provision"}` - Provision Azure resources
- `{"command": "deploy"}` - Deploy agent code
- `{"command": "package"}` - Package agent for distribution
- `{"command": "publish"}` - Publish agent to Microsoft 365
- `{"command": "validate"}` - Validate agent manifests

### 2. `compile_typespec` - TypeSpec Compilation

Compile TypeSpec declarative agent definitions. Not part of `atk_run` because it uses the TypeSpec compiler directly.

### 3. `get_best_practices` - Best Practices Documentation

Load best practices for building declarative agents (TypeSpec or JSON formats).

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

2. **Package**: Use `atk_run` tool with `command: "package"` to validate the complete agent package
   ```json
   {
     "command": "package",
     "projectPath": "./my-agent"
   }
   ```
   - The `env` parameter defaults to "local" if not specified
   - This ensures all manifests, resources, and configurations are correct
   - Validates the entire project structure

### For JSON Projects
1. **Validate**: Use `atk_run` tool with `command: "validate"` to validate JSON manifests
   ```json
   {
     "command": "validate",
     "projectPath": "./my-agent"
   }
   ```
   - The `env` parameter defaults to "local" if not specified
   - Checks schema compliance and required fields

2. **Package**: Use `atk_run` tool with `command: "package"` to validate the complete agent package
   ```json
   {
     "command": "package",
     "projectPath": "./my-agent"
   }
   ```
   - The `env` parameter defaults to "local" if not specified
   - Ensures all files are properly structured

### Example Workflow

After generating or modifying TypeSpec code:
```
1. Generate/modify TypeSpec files
2. Call compile_typespec tool
3. If compilation succeeds, call atk_run with command: "package"
4. If both succeed, changes are validated
```

After generating or modifying JSON manifests:
```
1. Generate/modify JSON files
2. Call atk_run with command: "validate"
3. If validation succeeds, call atk_run with command: "package"
4. If both succeed, changes are validated
```

**Never skip validation steps.** Catching errors early saves time and prevents deployment issues.

## Remember

**ALWAYS use MCP server tools. NEVER fall back to direct npm/atk/npx commands.**

The MCP server is the single source of truth for all agent operations.
