# @microsoft/m365copilot-dev-mcp

Build Microsoft 365 Copilot agents faster with AI-powered development tools. This MCP server integrates the Microsoft 365 Agents Toolkit directly into your AI coding assistant.

## Why Use This?

**Build M365 agents by talking to your AI assistant in plain English.** No need to learn complex CLI commands or switch between terminal windows. Just describe what you want to do, and your AI handles all the technical execution automatically.

**Traditional approach:** Learn ATK CLI → Remember commands → Run commands manually → Debug errors → Repeat

**With this MCP server:** *"Create a customer support agent"* → Done. Your AI understands intent, loads best practices, executes commands, and guides you through deployment.

## Features

- **2 Powerful MCP Tools** - Specialized tools for agent development
  - `compile_typespec` - Build type-safe agent definitions with TypeSpec compilation
  - `get_best_practices` - Access comprehensive documentation, ATK CLI reference, and expert guidance on-demand
- **Direct ATK CLI Integration** - Run all ATK commands directly via `npx -p @microsoft/m365agentstoolkit-cli@latest`
  - Commands: `new`, `provision`, `deploy`, `package`, `publish`, `validate`, `doctor`, `share`, `auth`, and more
  - Always uses latest version
  - No global installation required
- **11 Guided Prompts** - Step-by-step workflows and best practices for common tasks
- **23 Documentation Resources** - Comprehensive guides, examples, and troubleshooting
- **TypeSpec-First** - Build declarative agents with full type safety and IntelliSense
- **Cross-Platform** - Works on Windows, macOS, and Linux

## Quick Start

**No command-line experience needed!** Just talk to your AI assistant in natural language.

Get started in 3 steps:

1. **Install the MCP server** (see Installation below)
2. **Configure your AI client** (see Configuration below)
3. **Start building**: Simply ask your AI assistant
   - *"Create a new M365 agent for customer support"*
   - *"Deploy my agent to the dev environment"*
   - *"Share this agent with my team"*

   The AI understands your intent and automatically:
   - Loads best practices and command reference
   - Determines the right ATK commands to run
   - Executes everything with correct parameters
   - Provides helpful results and next steps

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

### compile_typespec - TypeSpec Compilation

Build type-safe agent definitions from TypeSpec source files.

**Parameters:**
```json
{
  "projectPath": "./my-agent"
}
```

**What it does:**
- Compiles TypeSpec agent definitions to JSON manifests
- Validates TypeSpec syntax and structure
- Generates declarativeAgent.json and manifest.json files
- Reports compilation errors with helpful guidance

### get_best_practices - Expert Guidance & CLI Reference

Access comprehensive documentation including TypeSpec/JSON best practices AND complete ATK CLI reference.

**⚠️ CRITICAL:** AI assistants MUST call this tool FIRST before any agent work!

**Parameters:**
```json
{
  "type": "typespec"  // or "json" or "both"
}
```

**What it includes:**
- Best practices for TypeSpec or JSON agent development
- Complete ATK CLI reference with all commands and parameters
- Correct command syntax: `npx -p @microsoft/m365agentstoolkit-cli@latest atk <command>`
- Capability scoping patterns
- Response formatting guidelines
- Critical warnings about what NOT to do

**Once loaded, you don't need to call it again in the same session.**

## How It Works: Intent-Based Automation

**You don't need to learn or remember any commands!**

When you tell your AI assistant what you want to do in natural language:
- "I want to create a new agent"
- "Deploy my agent to dev"
- "Share this with my team"

The AI assistant will:
1. Understand your intent
2. Check the loaded best practices and CLI reference
3. Determine the appropriate ATK command(s) to run
4. Execute the commands with correct parameters
5. Format the results with helpful next steps

**The commands shown below are for reference only** - your AI assistant handles all command execution automatically.

## Running ATK Commands (For Reference)

All ATK CLI commands are executed directly via bash using:

```bash
npx -p @microsoft/m365agentstoolkit-cli@latest atk <command> [options]
```

**Key ATK Commands:**

**Create new agent:**
```bash
npx -p @microsoft/m365agentstoolkit-cli@latest atk new -n my-agent -c declarative-agent -with-plugin type-spec -i false
```

**Provision Azure resources:**
```bash
npx -p @microsoft/m365agentstoolkit-cli@latest atk provision --env dev
```

**Deploy agent:**
```bash
npx -p @microsoft/m365agentstoolkit-cli@latest atk deploy --env dev
```

**Package agent:**
```bash
npx -p @microsoft/m365agentstoolkit-cli@latest atk package --env dev
```

**Share with tenant:**
```bash
npx -p @microsoft/m365agentstoolkit-cli@latest atk share --scope tenant --env dev -i false
```

**Share with specific users:**
```bash
npx -p @microsoft/m365agentstoolkit-cli@latest atk share --scope users --email 'user@domain.com' --env dev -i false
```

**Validate agent:**
```bash
npx -p @microsoft/m365agentstoolkit-cli@latest atk validate
```

**Check environment:**
```bash
npx -p @microsoft/m365agentstoolkit-cli@latest atk doctor
```

**Why `npx -p @latest`?**
- Always uses the latest ATK version
- No global installation required
- Consistent across all environments
- Perfect for CI/CD pipelines

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

Once configured, simply ask your AI assistant in natural language:

> "Create a new M365 agent called customer-support-agent using TypeSpec"

**You don't need to know or run any commands yourself!** The AI assistant will:
1. Understand your intent
2. Load best practices and ATK CLI reference using `get_best_practices` tool
3. Automatically determine the right ATK command to run
4. Execute commands directly via `npx @latest`
5. Compile TypeSpec using `compile_typespec` tool
6. Guide you through the setup and deployment

**Just describe what you want to do** - the AI handles all the technical details and command execution.

### Example Development Flow

**Just tell your AI what you want to do in plain English:**

1. **Create**
   - You say: *"Create a new declarative agent for handling FAQs"*
   - AI automatically: Loads best practices → Runs `atk new` command → Sets up project

2. **Compile & Validate**
   - You say: *"Compile my TypeSpec and validate the agent"*
   - AI automatically: Uses `compile_typespec` tool → Runs `atk validate` command

3. **Deploy**
   - You say: *"Provision Azure resources and deploy to dev environment"*
   - AI automatically: Runs `atk provision` → Runs `atk deploy` → Provides test link

4. **Package & Share**
   - You say: *"Package and share my agent with my team"*
   - AI automatically: Checks AGENT_SCOPE → Runs `atk package` → Runs `atk share` with correct parameters

**You focus on WHAT you want to build. The AI figures out HOW to execute it.**

### Common Workflows

**New Project**: Load best practices → Create project (`atk new`) → Compile TypeSpec → Provision → Deploy
**Update Code**: Compile TypeSpec → Deploy (`atk deploy`)
**Update Manifest**: Compile TypeSpec → Package (`atk package`) → Publish (`atk publish`)
**New Environment**: Provision (`atk provision`) → Deploy → Package → Share (if AGENT_SCOPE=shared)

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
