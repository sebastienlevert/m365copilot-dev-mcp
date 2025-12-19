# MCP Server Usage Guidelines

## Critical: Always Use MCP Server Tools

**IMPORTANT**: When working with this MCP server, you MUST use the provided MCP tools for all operations. Do NOT use direct CLI commands.

### ❌ NEVER Use These Commands Directly

- `npm run compile`
- `npm run build`
- `npm run deploy`
- `atk provision`
- `atk deploy`
- `atk package`
- `atk publish`
- `atk validate`
- `atk compile`
- `npx @microsoft/m365agentstoolkit-cli ...`
- Any other `atk` or CLI commands

### ✅ ALWAYS Use MCP Server Tools Instead

The MCP server provides dedicated tools for all operations:

| Instead of... | Use MCP Tool |
|---------------|--------------|
| `npm run compile` or `atk compile` | `compile_typespec` |
| `atk provision` | `atk_provision` |
| `atk deploy` | `atk_deploy` |
| `atk package` | `atk_package` |
| `atk publish` | `atk_publish` |
| `atk validate` | `atk_validate` |
| `atk new` | `atk_new` |
| `atk doctor` | `atk_doctor` |
| `atk version` | `atk_version` |
| `atk login` | `atk_login` |
| `atk logout` | `atk_logout` |

## Why Use MCP Server Tools?

1. **Consistent Interface**: All operations follow the same pattern and error handling
2. **Better Error Messages**: MCP tools provide structured error responses with suggestions
3. **Progress Tracking**: Operations report progress through the MCP protocol
4. **Validation**: Input validation happens before execution
5. **Logging**: All operations are logged consistently
6. **Integration**: Tools integrate with the MCP context and state

## Example: Compiling TypeSpec

❌ **WRONG:**
```bash
npm run compile
```
or
```bash
atk compile
```

✅ **CORRECT:**
Use the `compile_typespec` tool through MCP

## Example: Deploying an Agent

❌ **WRONG:**
```bash
atk deploy --env dev
```

✅ **CORRECT:**
Use the `atk_deploy` tool through MCP with parameters:
```json
{
  "env": "dev"
}
```

## Available Tools

Use these MCP tools for all operations:

### Project Management
- `atk_new` - Create new agent projects
- `atk_doctor` - Diagnose environment setup
- `atk_version` - Check ATK version

### Authentication
- `atk_login` - Login to Microsoft 365
- `atk_logout` - Logout from Microsoft 365

### Development
- `compile_typespec` - Compile TypeSpec declarative agents
- `get_best_practices` - Load best practices documentation

### Deployment
- `atk_provision` - Provision Azure resources
- `atk_deploy` - Deploy agent code
- `atk_package` - Package agent for distribution
- `atk_publish` - Publish agent to Microsoft 365
- `atk_validate` - Validate agent manifests

## Validation After Code Generation

**CRITICAL**: After every successful code generation or modification, you MUST validate your changes:

### For TypeSpec Projects
1. **Compile**: Use `compile_typespec` tool to compile TypeSpec code
   - This catches syntax errors, type errors, and validation issues
   - Must complete successfully before proceeding
2. **Package**: Use `atk_package` tool to validate the complete agent package
   - This ensures all manifests, resources, and configurations are correct
   - Validates the entire project structure

### For JSON Projects
1. **Validate**: Use `atk_validate` tool to validate JSON manifests
   - Checks schema compliance and required fields
2. **Package**: Use `atk_package` tool to validate the complete agent package
   - Ensures all files are properly structured

### Example Workflow

After generating or modifying TypeSpec code:
```
1. Generate/modify TypeSpec files
2. Call compile_typespec tool
3. If compilation succeeds, call atk_package tool
4. If both succeed, changes are validated
```

After generating or modifying JSON manifests:
```
1. Generate/modify JSON files
2. Call atk_validate tool
3. If validation succeeds, call atk_package tool
4. If both succeed, changes are validated
```

**Never skip validation steps.** Catching errors early saves time and prevents deployment issues.

## Remember

**ALWAYS use MCP server tools. NEVER fall back to direct npm/atk/npx commands.**

The MCP server is the single source of truth for all agent operations.
