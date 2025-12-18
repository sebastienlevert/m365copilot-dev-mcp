# @microsoft/m365copilot-dev-mcp

MCP (Model Context Protocol) server for Microsoft 365 Copilot development. Build, deploy, and manage M365 Copilot extensions and agents through a standardized interface.

## Overview

This MCP server provides comprehensive tooling for Microsoft 365 Copilot development, including:
- **Agents Toolkit (ATK)** - Complete project lifecycle from creation to publishing
- **Future capabilities** - Extensible architecture for additional M365 Copilot dev tools

## Features

- **8 MCP Tools** - Complete development workflow automation
  - 7 ATK tools (new, provision, deploy, package, publish, validate, doctor)
  - 1 version checking tool
- **6 Guided Prompts** - Step-by-step workflows and best practices
- **TypeSpec-Focused** - Build declarative agents with type-safe definitions
- **Declarative Agents** - Create sophisticated agents without custom code
- **11 Documentation Resources** - Comprehensive guides and examples
- **Stdio Transport** - Local MCP server for development
- **Cross-Platform** - Windows, macOS, and Linux support

## Installation

### Global Installation (Recommended)

```bash
npm install -g @microsoft/m365copilot-dev-mcp
```

### Local Installation

```bash
npm install @microsoft/m365copilot-dev-mcp
```

### Prerequisites

- Node.js 18.0.0 or later
- npm 8.0.0 or later
- Microsoft 365 Agents Toolkit CLI (automatically managed via npx)
- Azure CLI (for cloud deployments)
- Microsoft 365 account

**Note:** The ATK CLI is automatically downloaded and cached by npx on first use. The initial command execution may take a few seconds while npx downloads the CLI.

### Verify Installation

```bash
# The first command may take a moment while npx downloads the ATK CLI
m365copilot-dev-mcp --version
```

### Test ATK CLI

```bash
# This will invoke atk doctor through the MCP server
# First run downloads the ATK CLI (may take 10-30 seconds)
```

## MCP Client Configuration

### Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "m365copilot-dev": {
      "command": "m365copilot-dev-mcp"
    }
  }
}
```

### Other MCP Clients

Configure stdio transport with command: `m365copilot-dev-mcp`

### Important: Restart Required

After installing or updating the MCP server, you **must restart your MCP client** (e.g., quit and reopen Claude Desktop) for the changes to take effect. This ensures the client picks up the latest tool schemas.

## Available Tools

### Project Management

#### atk_new
Create new TypeSpec-based declarative agent projects.

**Default Directory:** Projects are created in `~/AgentsToolkitProjects` by default (automatically created if it doesn't exist).

```json
{
  "name": "my-customer-service-agent",
  "template": "declarative-agent",
  "format": "typespec"
}
```

**Custom Directory Example:**
```json
{
  "name": "my-customer-service-agent",
  "template": "declarative-agent",
  "format": "typespec",
  "directory": "./agents"
}
```

**Important for VS Code / GitHub Copilot:** After successful project creation, the coding agent should open the newly created workspace in VS Code and continue the chat session there. This allows direct interaction with the project files.

**Important for Command Line:** After successful project creation, coding agents should immediately change to the new project directory. The tool response includes the exact `cd` command to execute.

**⚠️ CRITICAL - DO NOT EDIT GENERATED FILES:**
Once the project is scaffolded, coding agents must NEVER edit:
- `appPackage/manifest.json` - Auto-generated from source definitions
- `appPackage/declarativeAgent.json` - Auto-generated from source definitions
- `.generated/` folder - All contents are auto-generated during build
- Manual edits will be overwritten and lost on next build

**Files You CAN Edit (Source Files):**
- TypeSpec source files (`src/*.tsp`) - Agent instructions, capabilities, and definitions (if using TypeSpec format)
- Source configuration files - Define agent behavior (if using JSON format)
- `appPackage/color.png`, `appPackage/outline.png` - App icons
- `.env` files - Environment variables
- `m365agents.yml` - Build configuration
- `package.json` - npm dependencies

**Template:**
- `declarative-agent` - Declarative agent with instructions and configuration

**Formats:**
- `typespec` (default, recommended) - Type-safe agent definitions with IntelliSense and validation
- `json` - Simple JSON-based configuration

**About Declarative Agents:**
Build sophisticated Microsoft 365 agents using TypeSpec for type-safe definitions. Define agent behavior through instructions and configuration without writing custom code. Perfect for conversational agents, FAQ bots, information assistants, and knowledge base queries.

**TypeSpec Benefits:**
- Type-safe agent and API definitions
- Full IntelliSense and IDE support
- Catch configuration errors at design time
- Clear contracts and documentation
- Automatic validation

#### atk_validate
Validate app manifest and configuration.

```json
{
  "projectPath": "./my-agent"
}
```

#### atk_doctor
Check system prerequisites.

```json
{
  "verbose": true
}
```

### Deployment

#### atk_provision
Provision Azure cloud resources.

```json
{
  "projectPath": "./my-agent",
  "environment": "dev",
  "subscriptionId": "optional"
}
```

#### atk_deploy
Deploy code to Azure.

```json
{
  "projectPath": "./my-agent",
  "environment": "dev"
}
```

#### atk_package
Build app package for Microsoft 365.

```json
{
  "projectPath": "./my-agent",
  "environment": "prod"
}
```

#### atk_publish
Publish to Microsoft 365.

```json
{
  "projectPath": "./my-agent",
  "environment": "prod"
}
```

## Workflow Prompts

### create-declarative-agent
Guided workflow for creating a TypeSpec-based declarative agent project.

```json
{
  "projectName": "my-customer-service-agent",
  "targetDirectory": "./agents"
}
```

Walks through: prerequisites check → TypeSpec project creation → validation → configuration guidance → next steps

### deploy-agent-complete
Complete deployment workflow from validation to publishing.

```json
{
  "projectPath": "./my-agent",
  "environment": "dev"
}
```

Handles: validation → provisioning → deployment → packaging → publishing

### setup-new-project
Interactive guide for setting up a new project from scratch.

```json
{
  "agentType": "declarative-agent",
  "projectName": "my-agent"
}
```

## Best Practice Prompts

### configure-environments
Environment configuration best practices for dev/staging/prod.

```json
{
  "projectPath": "./my-agent"
}
```

### troubleshoot-deployment
Diagnose and resolve deployment issues.

```json
{
  "projectPath": "./my-agent",
  "errorMessage": "optional error details"
}
```

### security-checklist
Security review for your agent.

```json
{
  "projectPath": "./my-agent"
}
```

## Documentation Resources

Access via MCP resource URIs:

### Command Reference
- `atk://docs/commands` - Complete ATK CLI reference
- `atk://docs/lifecycle` - Project lifecycle stages

### Configuration
- `atk://docs/config/m365agents` - m365agents.yml reference
- `atk://docs/config/manifest` - manifest.json reference
- `atk://docs/environments` - Environment management guide
- `atk://docs/project-structure` - **CRITICAL:** Which files to edit vs auto-generated files

### Examples
- `atk://examples/weather-agent` - Weather agent walkthrough
- `atk://examples/declarative-agent` - Declarative agent example
- `atk://examples/api-plugin` - API plugin example

### Troubleshooting
- `atk://troubleshooting/common-issues` - FAQ and solutions
- `atk://troubleshooting/installation` - Installation help

### Security
- `atk://docs/security-best-practices` - Security guidelines

## Quick Start

### Create Your First Agent

1. **Check Prerequisites**
```json
Use: atk_doctor
```

2. **Create Project** (creates in ~/AgentsToolkitProjects/my-first-agent/)
```json
Use: atk_new
{
  "name": "my-first-agent",
  "template": "declarative-agent",
  "format": "typespec"
}
```

3. **Open Workspace in VS Code** (for VS Code / GitHub Copilot users)
   - Open ~/AgentsToolkitProjects/my-first-agent in VS Code
   - Continue the chat session in the new workspace

   **OR for Command Line:**
```bash
cd ~/AgentsToolkitProjects/my-first-agent
```

4. **Validate Project**
```json
Use: atk_validate
{
  "projectPath": "."
}
```

5. **Provision Resources**
```json
Use: atk_provision
{
  "projectPath": ".",
  "environment": "dev"
}
```

6. **Deploy Code**
```json
Use: atk_deploy
{
  "projectPath": ".",
  "environment": "dev"
}
```

7. **Package & Publish**
```json
Use: atk_package
{
  "projectPath": ".",
  "environment": "dev"
}

Use: atk_publish
{
  "projectPath": ".",
  "environment": "dev"
}
```

### Use Guided Workflows

For step-by-step guidance with TypeSpec and declarative agents, use workflow prompts:

```json
Use prompt: create-declarative-agent
{
  "projectName": "my-customer-service-agent"
}
```

## Common Workflows

### New Project
```
doctor → new → validate → provision → deploy → package → publish
```

### Code Update
```
validate → deploy
```

### Manifest Update
```
validate → package → publish
```

### New Environment
```
provision → deploy → package → publish
```

## Architecture

### Components

- **Tools** - ATK CLI command wrappers with validation
- **Prompts** - Guided workflows and best practices
- **Resources** - Documentation and examples
- **CLI Executor** - Cross-platform command execution
- **Error Handler** - Structured error parsing and formatting

### Technology Stack

- **MCP SDK** - @modelcontextprotocol/sdk@^1.25.1
- **ATK CLI** - @microsoft/m365agentstoolkit-cli@^1.1.3
- **Validation** - zod@^3.23.8
- **Runtime** - Node.js 18+
- **Language** - TypeScript with ESM output

## Development

### Build from Source

```bash
# Clone repository
git clone https://github.com/microsoft/m365copilot-dev-mcp
cd m365copilot-dev-mcp

# Install dependencies
npm install

# Build
npm run build

# Test locally
npm link
```

### Project Structure

```
src/
├── index.ts              # Entry point
├── server.ts             # MCP server setup
├── tools/                # Tool implementations
│   ├── new.ts
│   ├── provision.ts
│   ├── deploy.ts
│   ├── package.ts
│   ├── publish.ts
│   ├── validate.ts
│   └── doctor.ts
├── prompts/              # Workflow prompts
│   ├── workflows.ts
│   └── best-practices.ts
├── resources/            # Documentation resources
│   ├── documentation.ts
│   └── examples.ts
├── utils/                # Utilities
│   ├── cli-executor.ts
│   ├── logger.ts
│   └── error-handler.ts
└── types/                # Type definitions
    └── atk.ts
```

## Troubleshooting

### Common Issues

**ATK CLI Not Found**
```bash
npm install -g @microsoft/m365agentstoolkit-cli
atk --version
```

**Authentication Errors**
```bash
az login
az account show
```

**Permission Issues**
- Need Contributor/Owner role for Azure
- Need Admin permissions for Microsoft 365

**Environment Not Provisioned**
- Run `atk_provision` before `atk_deploy`
- Check .env.{environment} file exists

### Get Help

Use the troubleshooting prompt:
```json
Use prompt: troubleshoot-deployment
{
  "projectPath": "./my-agent",
  "errorMessage": "error details"
}
```

Or check resources:
- `atk://troubleshooting/common-issues`
- [Documentation](./docs/TROUBLESHOOTING.md)

## Security

### Best Practices

- Never commit .env files to version control
- Use Azure Key Vault for production secrets
- Rotate credentials regularly
- Follow least-privilege principle
- Review security checklist prompt

### Reporting Security Issues

Please report security vulnerabilities to Microsoft Security Response Center (MSRC) at https://msrc.microsoft.com/create-report

## Contributing

Contributions are welcome! Please read our development guidelines for best practices.

### Development Guide

**[AGENTS.md](./AGENTS.md)** - Comprehensive development guide including:
- Technology stack and architecture
- Critical implementation rules
- Build and test workflow
- Quality standards and testing requirements
- Step-by-step guides for adding features
- Common pitfalls and debugging techniques

**Key Requirements:**
- Always build and link after changes: `npm run build && npm link`
- Test from actual MCP client before committing
- Write tests for all new features
- Focus on TypeSpec and declarative agents only
- Never write to stdout (use stderr for logging)

### Areas for Contribution

- Additional workflow prompts for declarative agents
- More TypeSpec examples and tutorials
- Enhanced error messages with better guidance
- Cross-platform testing (Windows/macOS/Linux)
- Documentation improvements
- Test coverage expansion

## License

MIT License - see LICENSE file for details

## Support

- [Official Documentation](https://learn.microsoft.com/en-us/microsoftteams/platform/toolkit/microsoft-365-agents-toolkit-cli)
- [GitHub Issues](https://github.com/microsoft/m365copilot-dev-mcp/issues)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/microsoft-365-agents-toolkit)

## Related Projects

- [Microsoft 365 Agents Toolkit](https://github.com/OfficeDev/microsoft-365-agents-toolkit)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Claude Desktop](https://claude.ai/download)

## Changelog

### 0.1.0 (Initial Release)

- 7 MCP tools for ATK CLI operations
- 6 guided workflow and best practice prompts
- 11 documentation and example resources
- Stdio transport for local development
- Cross-platform support (Windows/macOS/Linux)
- TypeScript with full type safety
- Comprehensive error handling
- Rich tool descriptions for LLM guidance

---

Built with ❤️ for Microsoft 365 developers
