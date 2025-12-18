# ATK CLI Commands Reference

Quick reference for Microsoft 365 Agents Toolkit CLI commands exposed by this MCP server.

## Core Tools

### atk_doctor
Check system prerequisites and configuration.

```json
{
  "verbose": false
}
```

### atk_new
Create a new Microsoft 365 agent project.

```json
{
  "name": "my-agent",
  "template": "weather-agent",
  "language": "typescript",
  "directory": "./projects"
}
```

**Templates:**
- `declarative-agent` - Simple conversational agent
- `weather-agent` - Custom engine with API integration
- `custom-engine-agent` - Advanced custom logic
- `api-plugin` - API plugin for Copilot

### atk_provision
Provision cloud resources for deployment.

```json
{
  "projectPath": "./my-agent",
  "environment": "dev",
  "subscriptionId": "optional-subscription-id"
}
```

### atk_deploy
Deploy application code to Azure.

```json
{
  "projectPath": "./my-agent",
  "environment": "dev"
}
```

### atk_package
Build app package for Microsoft 365.

```json
{
  "projectPath": "./my-agent",
  "environment": "prod"
}
```

### atk_publish
Publish app to Microsoft 365.

```json
{
  "projectPath": "./my-agent",
  "environment": "prod"
}
```

### atk_validate
Validate app manifest and configuration.

```json
{
  "projectPath": "./my-agent"
}
```

## Workflow Prompts

### create-weather-agent
Guided workflow for creating a weather agent.

```json
{
  "projectName": "my-weather-bot",
  "targetDirectory": "./projects"
}
```

### deploy-agent-complete
Complete deployment workflow from validation to publishing.

```json
{
  "projectPath": "./my-agent",
  "environment": "dev"
}
```

### setup-new-project
Interactive project setup guide.

```json
{
  "agentType": "declarative-agent",
  "projectName": "my-agent"
}
```

## Best Practice Prompts

### configure-environments
Environment configuration best practices.

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
  "errorMessage": "optional error message"
}
```

### security-checklist
Security review for your agent.

```json
{
  "projectPath": "./my-agent"
}
```

## Resources

Access documentation via MCP resources:

- `atk://docs/commands` - Complete command reference
- `atk://docs/lifecycle` - Project lifecycle guide
- `atk://docs/config/m365agents` - Configuration reference
- `atk://docs/config/manifest` - Manifest reference
- `atk://examples/weather-agent` - Weather agent example
- `atk://examples/declarative-agent` - Declarative agent example
- `atk://troubleshooting/common-issues` - Common issues & solutions

## External Resources

- [Official Documentation](https://learn.microsoft.com/en-us/microsoftteams/platform/toolkit/microsoft-365-agents-toolkit-cli)
- [GitHub Repository](https://github.com/OfficeDev/microsoft-365-agents-toolkit)
- [npm Package](https://www.npmjs.com/package/@microsoft/m365agentstoolkit-cli)
