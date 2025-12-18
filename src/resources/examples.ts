/**
 * Example resources
 * Provides practical examples and templates
 */

import { ResourceDefinition, ResourceContent } from './documentation.js';

/**
 * Example resource definitions
 */
export const exampleResources: ResourceDefinition[] = [
  {
    uri: 'atk://examples/weather-agent',
    name: 'Weather Agent Example',
    description: 'Complete walkthrough of weather agent implementation',
    mimeType: 'text/markdown'
  },
  {
    uri: 'atk://examples/declarative-agent',
    name: 'Declarative Agent Example',
    description: 'Simple declarative agent with instructions',
    mimeType: 'text/markdown'
  },
  {
    uri: 'atk://examples/api-plugin',
    name: 'API Plugin Example',
    description: 'API plugin for extending Copilot',
    mimeType: 'text/markdown'
  },
  {
    uri: 'atk://troubleshooting/common-issues',
    name: 'Common Issues & Solutions',
    description: 'FAQ and troubleshooting guide',
    mimeType: 'text/markdown'
  },
  {
    uri: 'atk://troubleshooting/installation',
    name: 'Installation Troubleshooting',
    description: 'Resolving installation and setup issues',
    mimeType: 'text/markdown'
  }
];

/**
 * Get example resource content by URI
 */
export function getExampleResource(uri: string): ResourceContent | null {
  switch (uri) {
    case 'atk://examples/weather-agent':
      return {
        uri,
        mimeType: 'text/markdown',
        text: getWeatherAgentExample()
      };

    case 'atk://examples/declarative-agent':
      return {
        uri,
        mimeType: 'text/markdown',
        text: getDeclarativeAgentExample()
      };

    case 'atk://examples/api-plugin':
      return {
        uri,
        mimeType: 'text/markdown',
        text: getAPIPluginExample()
      };

    case 'atk://troubleshooting/common-issues':
      return {
        uri,
        mimeType: 'text/markdown',
        text: getCommonIssues()
      };

    case 'atk://troubleshooting/installation':
      return {
        uri,
        mimeType: 'text/markdown',
        text: getInstallationTroubleshooting()
      };

    default:
      return null;
  }
}

function getWeatherAgentExample(): string {
  return `# Weather Agent Example

## Overview

The weather agent template demonstrates a custom engine agent that integrates with external weather APIs to provide weather information to users.

## Project Structure

\`\`\`
weather-agent/
├── src/
│   ├── index.ts              # Main entry point
│   ├── agent.ts              # Agent logic
│   ├── weatherService.ts     # Weather API integration
│   └── prompts/              # Agent prompts
├── appPackage/
│   ├── manifest.json         # App manifest
│   ├── color.png             # App icon
│   └── outline.png           # App icon outline
├── m365agents.yml            # Lifecycle configuration
├── .env.dev                  # Dev environment variables
└── package.json              # Dependencies
\`\`\`

## Implementation

### 1. Weather Service Integration

\`\`\`typescript
// weatherService.ts
export class WeatherService {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.WEATHER_API_KEY || '';
  }

  async getCurrentWeather(location: string) {
    const response = await fetch(
      \`https://api.openweathermap.org/data/2.5/weather?q=\${location}&appid=\${this.apiKey}\`
    );
    return await response.json();
  }
}
\`\`\`

### 2. Agent Logic

\`\`\`typescript
// agent.ts
import { WeatherService } from './weatherService';

export class WeatherAgent {
  private weatherService: WeatherService;

  constructor() {
    this.weatherService = new WeatherService();
  }

  async handleMessage(message: string): Promise<string> {
    // Extract location from message
    const location = this.extractLocation(message);

    // Get weather data
    const weather = await this.weatherService.getCurrentWeather(location);

    // Format response
    return this.formatWeatherResponse(weather);
  }

  private extractLocation(message: string): string {
    // Simple location extraction
    // In production, use NLP for better extraction
    const match = message.match(/weather in (\\w+)/i);
    return match ? match[1] : 'London';
  }

  private formatWeatherResponse(weather: any): string {
    return \`The weather in \${weather.name} is \${weather.weather[0].description} with a temperature of \${weather.main.temp}°C.\`;
  }
}
\`\`\`

### 3. Configuration

\`\`\`.env
# .env.dev
WEATHER_API_KEY=your-api-key-here
AZURE_SUBSCRIPTION_ID=your-subscription
BOT_ID=your-bot-id
BOT_PASSWORD=your-bot-password
\`\`\`

## Usage

### Create Project (TypeSpec)

\`\`\`bash
atk new --app-name my-customer-agent --capability declarative-agent --interactive false -with-plugin type-spec
\`\`\`

### Create Project (JSON)

\`\`\`bash
atk new --app-name my-customer-agent --capability declarative-agent --interactive false
\`\`\`

### Configure API Key

1. Get API key from OpenWeatherMap
2. Add to .env.dev file
3. Never commit .env files

### Provision & Deploy

\`\`\`bash
# Provision Azure resources
atk provision --env dev

# Deploy code
atk deploy --env dev

# Package app
atk package --env dev

# Publish to M365
atk publish --env dev
\`\`\`

## Customization

### Add More Weather Features

- Forecast data
- Weather alerts
- Multiple locations
- Weather maps

### Enhance NLP

- Use Azure Language service
- Add intent recognition
- Support multiple languages
- Handle complex queries

### Improve Responses

- Add rich cards
- Include weather icons
- Format data better
- Add charts/graphs

## Best Practices

- Cache weather data to reduce API calls
- Handle API errors gracefully
- Validate user input
- Rate limit API requests
- Log errors for debugging
- Use environment variables for all configs

## Resources

- OpenWeatherMap API: https://openweathermap.org/api
- Azure Functions: https://docs.microsoft.com/azure/azure-functions/
- Teams Bot Framework: https://docs.microsoft.com/microsoftteams/platform/bots/
`;
}

function getDeclarativeAgentExample(): string {
  return `# Declarative Agent Example

## Overview

Declarative agents use simple instructions to define behavior without custom code. Best for straightforward conversational scenarios.

## Declarative Agent Definition

\`\`\`json
{
  "name": "FAQ Assistant",
  "description": "Answers frequently asked questions about our product",
  "instructions": "You are a helpful FAQ assistant for Contoso products. Answer questions based on the provided knowledge base. Be concise and friendly.",
  "conversation_starters": [
    "What are your business hours?",
    "How do I reset my password?",
    "What products do you offer?",
    "How can I contact support?"
  ],
  "capabilities": {
    "response_format": "text",
    "web_search": false
  },
  "knowledge": [
    {
      "name": "Product FAQ",
      "description": "Common questions about our products",
      "content": "Q: What are your business hours?\\nA: We're open Monday-Friday, 9am-5pm EST.\\n\\nQ: How do I reset my password?\\nA: Click 'Forgot Password' on the login page..."
    }
  ]
}
\`\`\`

## Manifest Configuration

\`\`\`json
{
  "copilotAgents": {
    "declarativeAgents": [
      {
        "id": "faq-assistant",
        "file": "declarativeAgent.json"
      }
    ]
  }
}
\`\`\`

## Use Cases

- FAQ bots
- Information assistants
- Simple Q&A agents
- Knowledge base queries
- Basic task guidance

## Best Practices

- Clear, specific instructions
- Comprehensive knowledge base
- Good conversation starters
- Regular content updates
- Test with real questions

## Limitations

- No custom code
- Limited integrations
- Static knowledge
- Basic NLP capabilities

For complex scenarios, use custom engine agents instead.
`;
}

function getAPIPluginExample(): string {
  return `# API Plugin Example

## Overview

API plugins extend Microsoft 365 Copilot by exposing REST APIs as agent capabilities.

## OpenAPI Specification

\`\`\`yaml
openapi: 3.0.0
info:
  title: CRM API
  version: 1.0.0
  description: CRM operations for Copilot

servers:
  - url: https://api.contoso.com/v1

paths:
  /customers/{id}:
    get:
      summary: Get customer details
      operationId: getCustomer
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Customer details
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Customer'

components:
  schemas:
    Customer:
      type: object
      properties:
        id:
          type: string
        name:
          type: string
        email:
          type: string
\`\`\`

## Plugin Manifest

\`\`\`json
{
  "schema_version": "v2",
  "name_for_human": "CRM Plugin",
  "name_for_model": "crm",
  "description_for_human": "Access customer data from CRM",
  "description_for_model": "Query and retrieve customer information from the CRM system",
  "auth": {
    "type": "service_http",
    "authorization_type": "bearer"
  },
  "api": {
    "type": "openapi",
    "url": "https://api.contoso.com/openapi.yaml"
  }
}
\`\`\`

## Implementation

### API Endpoint

\`\`\`typescript
// API implementation
app.get('/customers/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const customer = await database.customers.findById(id);
  res.json(customer);
});
\`\`\`

### Authentication

\`\`\`typescript
// Bearer token authentication
function authenticate(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (validateToken(token)) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
}
\`\`\`

## Use Cases

- CRM integration
- Database queries
- External service integration
- Data retrieval
- Business logic execution

## Best Practices

- Clear API documentation
- Proper authentication
- Rate limiting
- Error handling
- Versioning

## Security

- Use HTTPS only
- Implement authentication
- Validate all input
- Rate limit requests
- Log access
`;
}

function getCommonIssues(): string {
  return `# Common Issues & Solutions

## Installation Issues

### Issue: ATK CLI not found
**Solution:**
\`\`\`bash
npm install -g @microsoft/m365agentstoolkit-cli
\`\`\`

### Issue: Permission denied during install
**Solution:**
\`\`\`bash
sudo npm install -g @microsoft/m365agentstoolkit-cli
# Or use nvm to manage Node.js without sudo
\`\`\`

## Authentication Issues

### Issue: Not logged in to Azure
**Solution:**
\`\`\`bash
az login
az account show  # Verify login
\`\`\`

### Issue: Wrong subscription
**Solution:**
\`\`\`bash
az account list
az account set --subscription <subscription-id>
\`\`\`

## Provisioning Issues

### Issue: Resource already exists
**Solution:**
- Use different resource names
- Or delete existing resources in Azure Portal
- Check resource group in Azure

### Issue: Insufficient permissions
**Solution:**
- Need Contributor or Owner role on subscription
- Contact Azure admin for permissions
- Verify: \`az role assignment list --assignee <email>\`

## Deployment Issues

### Issue: Environment not provisioned
**Solution:**
\`\`\`bash
atk provision --env dev  # Provision first
atk deploy --env dev     # Then deploy
\`\`\`

### Issue: Build errors
**Solution:**
\`\`\`bash
npm install          # Update dependencies
npm run build        # Check for errors
npm run clean        # Clean build artifacts
\`\`\`

## Validation Issues

### Issue: Invalid manifest
**Solution:**
- Check all required fields present
- Verify version format (1.0.0)
- Validate icon sizes (192x192, 32x32)
- Ensure URLs use HTTPS

### Issue: Icon validation failed
**Solution:**
- Resize color.png to exactly 192x192
- Resize outline.png to exactly 32x32
- Use PNG format only
- Check file names match manifest

## Publishing Issues

### Issue: Permission denied
**Solution:**
- Need M365 admin permissions
- Request admin to grant permissions
- Use test tenant for development

### Issue: Package not found
**Solution:**
\`\`\`bash
atk package --env dev  # Build package first
atk publish --env dev  # Then publish
\`\`\`

## General Troubleshooting

### Run Doctor Check
\`\`\`bash
atk doctor --verbose
\`\`\`

### Check Logs
- Azure Portal → Function App → Log stream
- Local: ~/.fx/cli-log/

### Get Help
- GitHub Issues: https://github.com/OfficeDev/microsoft-365-agents-toolkit/issues
- Documentation: https://learn.microsoft.com/microsoftteams/platform/toolkit/
- Stack Overflow: Tag [microsoft-365-agents-toolkit]
`;
}

function getInstallationTroubleshooting(): string {
  return `# Installation Troubleshooting

## Prerequisites

### Node.js
**Requirement:** Node.js 18.0.0 or later

**Check Version:**
\`\`\`bash
node --version
\`\`\`

**Install/Update:**
- Download from: https://nodejs.org/
- Or use nvm: \`nvm install 18\`

### npm
**Requirement:** npm 8.0.0 or later

**Check Version:**
\`\`\`bash
npm --version
\`\`\`

**Update npm:**
\`\`\`bash
npm install -g npm@latest
\`\`\`

## Installing ATK CLI

### Standard Installation
\`\`\`bash
npm install -g @microsoft/m365agentstoolkit-cli
\`\`\`

### Verify Installation
\`\`\`bash
atk --version
atk doctor
\`\`\`

## Common Installation Issues

### Issue: EACCES Permission Error

**On macOS/Linux:**
\`\`\`bash
# Option 1: Use nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
npm install -g @microsoft/m365agentstoolkit-cli

# Option 2: Fix permissions
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules
npm install -g @microsoft/m365agentstoolkit-cli

# Option 3: Use sudo (not recommended)
sudo npm install -g @microsoft/m365agentstoolkit-cli
\`\`\`

**On Windows:**
- Run PowerShell/CMD as Administrator
- Then run: \`npm install -g @microsoft/m365agentstoolkit-cli\`

### Issue: Network Timeout

**Solution:**
\`\`\`bash
# Increase timeout
npm config set fetch-timeout 60000

# Use different registry
npm config set registry https://registry.npmjs.org/

# Retry installation
npm install -g @microsoft/m365agentstoolkit-cli
\`\`\`

### Issue: Command Not Found After Installation

**Solution:**
\`\`\`bash
# Check npm global bin path
npm config get prefix

# Add to PATH (Linux/macOS)
echo 'export PATH="$(npm config get prefix)/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

# Add to PATH (Windows)
# Add the npm global bin path to System Environment Variables
\`\`\`

### Issue: Version Mismatch

**Solution:**
\`\`\`bash
# Uninstall old version
npm uninstall -g @microsoft/m365agentstoolkit-cli

# Clear npm cache
npm cache clean --force

# Reinstall latest version
npm install -g @microsoft/m365agentstoolkit-cli

# Verify
atk --version
\`\`\`

## Azure CLI Installation

### Windows
Download from: https://aka.ms/installazurecliwindows

### macOS
\`\`\`bash
brew install azure-cli
\`\`\`

### Linux
\`\`\`bash
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
\`\`\`

### Verify Azure CLI
\`\`\`bash
az --version
az login
\`\`\`

## After Installation

### Run Doctor Check
\`\`\`bash
atk doctor
\`\`\`

This checks:
- Node.js version
- npm version
- Azure CLI
- Required tools

### Test with Sample Project
\`\`\`bash
mkdir test-atk
cd test-atk
atk new --app-name test --capability declarative-agent --interactive false
\`\`\`

## Getting Help

If issues persist:
1. Check system requirements
2. Review error messages
3. Search GitHub issues
4. Ask on Stack Overflow
5. Create GitHub issue with details

**Links:**
- GitHub: https://github.com/OfficeDev/microsoft-365-agents-toolkit
- Documentation: https://learn.microsoft.com/microsoftteams/platform/toolkit/
`;
}
