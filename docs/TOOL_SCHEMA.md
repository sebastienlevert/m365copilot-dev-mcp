# ATK MCP Tool Schemas

This document defines the exact parameters for each MCP tool. These schemas are what the MCP client will see.

## 🔴 CRITICAL FOR VS CODE / GITHUB COPILOT

**After creating a project with `atk_new`, you MUST:**
1. Open the newly created workspace in VS Code
2. Continue the chat session in the new workspace context
3. This allows you to work with project files directly

The success message will include the exact workspace path to open.

## ⚠️ CRITICAL RULE FOR CODING AGENTS

**After creating an ATK project, NEVER edit these files:**

- **`appPackage/manifest.json`** - Auto-generated from source definitions
- **`appPackage/declarativeAgent.json`** - Auto-generated from source definitions
- **`.generated/`** folder - All files are auto-generated during build
- These files are regenerated on every build and manual edits will be **overwritten and lost**

**Only edit source files:**
- `src/*.tsp` - TypeSpec source files (agent instructions, capabilities, definitions)
- `appPackage/*.png` - App icons
- `.env` files - Environment variables
- `m365agents.yml` - Build configuration
- `package.json` - npm dependencies

**For complete guidance, refer to:** `atk://docs/project-structure` resource

## atk_new - Create New Project

### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `name` | string | Yes | - | Project name (will be used as directory name) |
| `template` | string | Yes | - | Project template type. Must be: `declarative-agent` |
| `format` | string | No | `typespec` | Declarative agent format. Options: `typespec` (recommended) or `json` |
| `directory` | string | No | `~/AgentsToolkitProjects` | Target directory (defaults to ~/AgentsToolkitProjects, automatically created if it doesn't exist) |

### Valid Examples

**TypeSpec format (uses default directory ~/AgentsToolkitProjects):**
```json
{
  "name": "my-customer-agent",
  "template": "declarative-agent",
  "format": "typespec"
}
```
This creates: `~/AgentsToolkitProjects/my-customer-agent/`

**JSON format (uses default directory):**
```json
{
  "name": "my-simple-agent",
  "template": "declarative-agent",
  "format": "json"
}
```
This creates: `~/AgentsToolkitProjects/my-simple-agent/`

**With custom directory:**
```json
{
  "name": "my-agent",
  "template": "declarative-agent",
  "format": "typespec",
  "directory": "./agents"
}
```
This creates: `./agents/my-agent/` (relative to current directory)

### Invalid Examples

❌ **DO NOT USE `language` parameter:**
```json
{
  "name": "my-agent",
  "template": "declarative-agent",
  "language": "typescript"  // ❌ WRONG - this parameter doesn't exist
}
```

❌ **DO NOT USE other templates:**
```json
{
  "name": "my-agent",
  "template": "weather-agent"  // ❌ WRONG - only declarative-agent is supported
}
```

## atk_validate - Validate Project

### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `projectPath` | string | No | `./` | Path to the ATK project directory |

### Example
```json
{
  "projectPath": "./my-agent"
}
```

## atk_provision - Provision Resources

### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `projectPath` | string | No | `./` | Path to the ATK project directory |
| `environment` | string | No | `dev` | Target environment |
| `subscriptionId` | string | No | - | Azure subscription ID |

### Example
```json
{
  "projectPath": "./my-agent",
  "environment": "dev"
}
```

## atk_deploy - Deploy Code

### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `projectPath` | string | No | `./` | Path to the ATK project directory |
| `environment` | string | Yes | - | Target environment |

### Example
```json
{
  "projectPath": "./my-agent",
  "environment": "dev"
}
```

## atk_package - Build Package

### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `projectPath` | string | No | `./` | Path to the ATK project directory |
| `environment` | string | No | `dev` | Target environment |

### Example
```json
{
  "projectPath": "./my-agent",
  "environment": "prod"
}
```

## atk_publish - Publish to M365

### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `projectPath` | string | No | `./` | Path to the ATK project directory |
| `environment` | string | No | `prod` | Target environment |

### Example
```json
{
  "projectPath": "./my-agent",
  "environment": "prod"
}
```

## atk_doctor - Check Prerequisites

### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `verbose` | boolean | No | `false` | Show detailed diagnostic information |

### Example
```json
{
  "verbose": true
}
```

---

## Important Notes

1. **No `language` parameter**: The `atk_new` tool does NOT have a `language` or `programming-language` parameter. Use `format` instead.

2. **Only declarative agents**: This MCP server focuses exclusively on declarative agents. The `template` parameter must always be `declarative-agent`.

3. **Default is TypeSpec**: If you don't specify `format`, it defaults to `typespec` (recommended).

4. **MCP Client Restart Required**: After updating the MCP server with `npm link`, you must restart your MCP client (like Claude Desktop) to pick up the new schema.

## Troubleshooting

### Problem: LLM is using `"language": "typescript"`

**Cause**: The MCP client hasn't picked up the new schema yet.

**Solution**:
1. Restart your MCP client completely (e.g., quit and reopen Claude Desktop)
2. Verify the schema in the MCP client's tool list
3. If problem persists, check that `atk-mcp` command points to the correct build:
   ```bash
   which atk-mcp
   atk-mcp --version  # Should show 0.1.0
   ```
