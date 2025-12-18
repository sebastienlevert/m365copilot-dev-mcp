# M365 Copilot Developer MCP - Project Vision

## Overview

**@microsoft/m365copilot-dev-mcp** is a comprehensive MCP (Model Context Protocol) server designed for Microsoft 365 Copilot development. While it currently focuses on the Agents Toolkit (ATK), the architecture is designed to support a broader ecosystem of M365 Copilot development tools.

## Why Rebrand from atk-mcp?

The original `@microsoft/atk-mcp` name was too narrow and tightly coupled to just the Agents Toolkit. Microsoft 365 Copilot development encompasses much more than ATK, including:

- **Copilot Studio** - Low-code copilot building
- **Plugins and Extensions** - Extending Copilot capabilities
- **Custom APIs** - Building backend services for copilots
- **Testing Tools** - Validating copilot behavior
- **Documentation** - Learning resources and best practices
- **Community Tools** - Third-party integrations and utilities

By rebranding to `m365copilot-dev-mcp`, we position this as a **platform** for M365 Copilot development, not just an ATK wrapper.

## Current Capabilities (v0.1.0)

### Agents Toolkit Integration
- **8 MCP Tools**:
  - `atk_new` - Create new agent projects
  - `atk_provision` - Provision Azure resources
  - `atk_deploy` - Deploy agent code
  - `atk_package` - Package for publishing
  - `atk_publish` - Publish to M365
  - `atk_validate` - Validate manifests
  - `atk_doctor` - Check prerequisites
  - `atk_version` - Verify ATK CLI version

- **6 Guided Prompts**:
  - Workflow automation
  - Best practices
  - Step-by-step guidance

- **11 Documentation Resources**:
  - ATK commands reference
  - Project structure guides
  - Troubleshooting docs

## Future Expansion Areas

### 1. Copilot Studio Integration
```typescript
// Future tools
- copilot_studio_list - List copilots in tenant
- copilot_studio_publish - Publish to Copilot Studio
- copilot_studio_test - Test copilot responses
```

### 2. Plugin Management
```typescript
// Future tools
- plugin_create - Create new plugin project
- plugin_test - Test plugin locally
- plugin_deploy - Deploy plugin to environment
```

### 3. Testing & Debugging
```typescript
// Future tools
- test_conversation - Test conversational flows
- debug_plugin_calls - Debug API plugin invocations
- validate_responses - Validate copilot responses
```

### 4. Documentation & Learning
```typescript
// Future resources
- copilot://samples/* - Sample projects
- copilot://tutorials/* - Interactive tutorials
- copilot://patterns/* - Design patterns
```

### 5. Development Utilities
```typescript
// Future tools
- env_switch - Switch between dev/test/prod environments
- logs_stream - Stream copilot logs
- analytics_view - View usage analytics
```

## Architecture Principles

### 1. Modular Design
Each capability area (ATK, Copilot Studio, Plugins, etc.) is implemented as a separate module with:
- Independent tool definitions
- Separate prompt collections
- Dedicated resource URIs

### 2. Resource URI Namespacing
- `atk://` - ATK-specific resources
- `copilot-studio://` - Copilot Studio resources
- `plugin://` - Plugin development resources
- `m365://` - General M365 Copilot resources

### 3. Tool Naming Conventions
- ATK tools: `atk_*` (e.g., `atk_new`, `atk_deploy`)
- Studio tools: `studio_*` (e.g., `studio_publish`, `studio_test`)
- Plugin tools: `plugin_*` (e.g., `plugin_create`, `plugin_test`)
- General tools: `m365_*` (e.g., `m365_validate`, `m365_deploy`)

### 4. Backward Compatibility
All ATK tools and resources maintain their current names and behavior. New capabilities are additive, not breaking.

## Adding New Capabilities

### Example: Adding Copilot Studio Tools

1. **Create tool module**: `src/tools/copilot-studio/`
```typescript
// src/tools/copilot-studio/publish.ts
export const studioPublishToolDefinition = {
  name: 'studio_publish',
  description: 'Publish copilot to Copilot Studio',
  inputSchema: { /* ... */ }
};

export async function executeStudioPublishTool(args: any) {
  // Implementation
}
```

2. **Register in tool registry**: `src/tools/index.ts`
```typescript
import { studioPublishToolDefinition, executeStudioPublishTool }
  from './copilot-studio/publish.js';

const toolRegistry: Map<string, ToolRegistryEntry> = new Map([
  // ... existing ATK tools
  ['studio_publish', {
    definition: studioPublishToolDefinition,
    executor: executeStudioPublishTool,
    schema: StudioPublishSchema
  }]
]);
```

3. **Add documentation resources**: `src/resources/copilot-studio.ts`
```typescript
export const copilotStudioResources = [
  {
    uri: 'copilot-studio://docs/publishing',
    name: 'Copilot Studio Publishing Guide',
    description: 'How to publish copilots to Copilot Studio',
    mimeType: 'text/markdown'
  }
];
```

4. **Create workflow prompts**: `src/prompts/copilot-studio.ts`
```typescript
export const copilotStudioPrompts = [
  {
    name: 'publish-to-studio',
    description: 'Guide through publishing to Copilot Studio',
    arguments: [/* ... */]
  }
];
```

## Installation & Usage

### For End Users
```bash
# Install globally
npm install -g @microsoft/m365copilot-dev-mcp

# Use with Claude Desktop
# Add to claude_desktop_config.json:
{
  "mcpServers": {
    "m365copilot-dev": {
      "command": "m365copilot-dev-mcp"
    }
  }
}
```

### For Contributors
```bash
# Clone repository
git clone https://github.com/microsoft/m365copilot-dev-mcp
cd m365copilot-dev-mcp

# Install dependencies
npm install

# Run tests
npm test

# Build
npm run build
```

## Contribution Guidelines

When adding new capabilities:

1. **Scope Check**: Ensure it relates to M365 Copilot development
2. **Naming**: Follow the established naming conventions
3. **Documentation**: Add comprehensive docs and examples
4. **Testing**: Write tests for all new tools and prompts
5. **Integration**: Ensure it works with existing capabilities

## Success Metrics

- **Tool Coverage**: Number of M365 Copilot dev scenarios covered
- **Developer Satisfaction**: Feedback from community
- **Adoption**: Number of active users
- **Extensibility**: Ease of adding new capabilities

## Roadmap

### v0.2.0 (Q1 2025)
- Copilot Studio basic integration
- Enhanced testing tools
- More workflow prompts

### v0.3.0 (Q2 2025)
- Plugin management tools
- Advanced debugging utilities
- Community contributions

### v1.0.0 (Q3 2025)
- Stable API
- Complete documentation
- Production-ready tooling

## Community

- **GitHub**: [microsoft/m365copilot-dev-mcp](https://github.com/microsoft/m365copilot-dev-mcp)
- **Issues**: Report bugs and request features
- **Discussions**: Share ideas and get help
- **Contributing**: See CONTRIBUTING.md for guidelines

---

**Vision Statement**: Become the definitive MCP server for Microsoft 365 Copilot development, providing developers with a comprehensive, extensible toolkit that covers the entire copilot lifecycle from creation to deployment to monitoring.
