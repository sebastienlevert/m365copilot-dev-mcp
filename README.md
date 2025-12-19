# @microsoft/m365copilot-dev-mcp

Build Microsoft 365 Copilot agents faster with AI-powered development tools. This MCP server integrates the Microsoft 365 Agents Toolkit directly into your AI coding assistant.

## Why Use This?

Stop context-switching between your AI assistant and terminal commands. Get intelligent guidance, automated workflows, and seamless project management—all within your AI coding environment.

## Features

- **3 Powerful Tools** - Unified commands for the entire agent lifecycle
  - `atk_run` - Execute any ATK command (new, provision, deploy, package, publish, validate, doctor, login, logout)
  - `compile_typespec` - Build type-safe agent definitions
  - `get_best_practices` - Access expert guidance on-demand
- **11 Guided Prompts** - Step-by-step workflows and best practices for common tasks
- **23 Documentation Resources** - Comprehensive guides, examples, and troubleshooting
- **TypeSpec-First** - Build declarative agents with full type safety and IntelliSense
- **Cross-Platform** - Works on Windows, macOS, and Linux

## Quick Start

Get started in 3 steps:

1. **Install the MCP server** (see Installation below)
2. **Configure your AI client** (see Configuration below)
3. **Start building**: Ask your AI assistant to create a new agent with `atk_run`

## Installation

### Prerequisites

- **Node.js** 18+ and npm 8+
- **Microsoft 365 account** with admin permissions
- **Azure CLI** (for cloud deployments)

### Option 1: Global Installation (Recommended)

```bash
npm install -g @microsoft/m365copilot-dev-mcp
```

### Option 2: Local Development

Clone and build from source:

```bash
git clone https://github.com/sebastienlevert/m365copilot-dev-mcp
cd m365copilot-dev-mcp
npm install
npm run build
npm link
```

This makes the `m365copilot-dev-mcp` command available locally for testing.

## Configuration

### Claude Desktop

Edit your Claude Desktop config file:
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

Add this configuration:

```json
{
  "mcpServers": {
    "m365copilot-dev": {
      "command": "m365copilot-dev-mcp"
    }
  }
}
```

### VS Code with GitHub Copilot

Add to your VS Code settings (`.vscode/settings.json` or User Settings):

```json
{
  "github.copilot.chat.mcp.servers": {
    "m365copilot-dev": {
      "command": "m365copilot-dev-mcp"
    }
  }
}
```

### Other MCP Clients

Configure stdio transport with command: `m365copilot-dev-mcp`

**⚠️ Important**: Restart your AI client after configuration changes to load the MCP server.

## Core Tools

### atk_run - Unified ATK Command Runner

Execute any Microsoft 365 Agents Toolkit command through a single interface.

**Supported commands**: `new`, `provision`, `deploy`, `package`, `publish`, `validate`, `doctor`, `login`, `logout`, `version`

**Example**: Create a new agent
```json
{
  "command": "new",
  "name": "my-customer-agent",
  "template": "declarative-agent",
  "format": "typespec"
}
```

**Example**: Deploy to Azure
```json
{
  "command": "deploy",
  "projectPath": "./my-customer-agent",
  "env": "dev"
}
```

### compile_typespec - TypeSpec Compilation

Build type-safe agent definitions from TypeSpec source files.

```json
{
  "projectPath": "./my-agent"
}
```

### get_best_practices - Expert Guidance

Access documentation on TypeSpec patterns, agent design, security, and more.

```json
{
  "topic": "typespec-patterns"
}
```

## Guided Workflows

Use prompts for step-by-step assistance:

- **create-declarative-agent** - Complete project creation workflow
- **deploy-agent-complete** - End-to-end deployment automation
- **configure-environments** - Multi-environment setup guidance
- **security-checklist** - Security review for your agent
- **troubleshoot-deployment** - Debug common deployment issues

...and 6 more specialized prompts for agent development.

## Documentation & Resources

Access 23 comprehensive resources through the MCP server:

- **Guides**: Commands reference, lifecycle stages, configuration docs
- **Examples**: Weather agent, declarative agent, API plugin patterns
- **Troubleshooting**: Common issues, installation help, debugging
- **Best Practices**: Security, TypeSpec patterns, authentication

Query resources via URIs like `atk://docs/commands` or `atk://examples/declarative-agent`.

## Get Started: Build Your First Agent

Once configured, simply ask your AI assistant:

> "Create a new M365 agent called customer-support-agent using TypeSpec"

The AI will use the `atk_run` tool to scaffold your project, guide you through the setup, and help you deploy it to Microsoft 365.

### Example Development Flow

1. **Create** - "Create a new declarative agent for handling FAQs"
2. **Validate** - "Validate my agent configuration"
3. **Deploy** - "Provision Azure resources and deploy to dev environment"
4. **Test** - "Package and publish my agent"

Your AI assistant handles all the complexity—you focus on building great agents.

### Common Workflows

**New Project**: Check prerequisites → Create project → Validate → Provision → Deploy  
**Update Code**: Validate → Deploy  
**Update Manifest**: Validate → Package → Publish  
**New Environment**: Provision → Deploy → Package → Publish

## Architecture & Technology

Built on industry-standard tools for reliability and performance:

- **MCP SDK** - Model Context Protocol for AI integration
- **Microsoft 365 Agents Toolkit** - Official M365 development tools
- **TypeScript** - Type-safe implementation with ESM modules
- **Zod** - Runtime validation for all tool inputs
- **Node.js 18+** - Modern JavaScript runtime

## Troubleshooting

**Authentication Issues**: Run `az login` to authenticate with Azure  
**ATK CLI Not Found**: The CLI is auto-downloaded via npx on first use (may take 10-30 seconds)  
**Environment Issues**: Use the `troubleshoot-deployment` prompt for guided debugging  
**Permission Errors**: Verify you have Contributor/Owner role in Azure and Admin in M365

Access detailed troubleshooting via `atk://troubleshooting/common-issues` resource.

## Security Best Practices

- Never commit `.env` files to version control
- Use Azure Key Vault for production secrets
- Follow least-privilege principle for Azure permissions
- Rotate credentials regularly
- Review the security-checklist prompt before deploying

## Contributing

Contributions welcome! See [AGENTS.md](./AGENTS.md) for the complete development guide.

**Key development steps**:
1. Clone the repository
2. Run `npm install` to install dependencies
3. Run `npm run build` to compile TypeScript
4. Run `npm link` to make the command available locally
5. Test changes with your MCP client

Focus areas for contributions:
- Additional workflow prompts for common scenarios
- More TypeSpec examples and patterns
- Enhanced error messages and guidance
- Cross-platform testing and compatibility
- Documentation improvements

## License

MIT License - see [LICENSE](./LICENSE) file for details.

## Resources & Support

- **Official Docs**: [Microsoft 365 Agents Toolkit](https://learn.microsoft.com/en-us/microsoftteams/platform/toolkit/microsoft-365-agents-toolkit-cli)
- **MCP Protocol**: [Model Context Protocol](https://modelcontextprotocol.io/)
- **Issues**: [GitHub Issues](https://github.com/sebastienlevert/m365copilot-dev-mcp/issues)
- **Stack Overflow**: Tag `microsoft-365-agents-toolkit`

## Ready to Build?

Install the MCP server, configure your AI client, and start building intelligent Microsoft 365 agents today. Your AI assistant is waiting to help you create amazing conversational experiences.

**Get started now:**
```bash
npm install -g @microsoft/m365copilot-dev-mcp
```

Then configure your AI client and ask: *"Help me create my first M365 Copilot agent"*

---

Built with ❤️ for Microsoft 365 developers | [View on GitHub](https://github.com/sebastienlevert/m365copilot-dev-mcp)
