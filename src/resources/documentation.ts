/**
 * Documentation resources
 * Provides ATK CLI documentation as MCP resources
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface ResourceDefinition {
  uri: string;
  name: string;
  description: string;
  mimeType: string;
}

export interface ResourceContent {
  uri: string;
  mimeType: string;
  text: string;
}

/**
 * Documentation resource definitions
 */
export const documentationResources: ResourceDefinition[] = [
  {
    uri: 'atk://docs/commands',
    name: 'ATK Commands Reference',
    description: 'Complete reference for all ATK CLI commands',
    mimeType: 'text/markdown'
  },
  {
    uri: 'atk://docs/lifecycle',
    name: 'Project Lifecycle',
    description: 'Understanding provision, deploy, and publish stages',
    mimeType: 'text/markdown'
  },
  {
    uri: 'atk://docs/config/m365agents',
    name: 'm365agents.yml Configuration',
    description: 'Configuration file reference and examples',
    mimeType: 'text/markdown'
  },
  {
    uri: 'atk://docs/config/manifest',
    name: 'App Manifest Reference',
    description: 'manifest.json structure and validation',
    mimeType: 'text/markdown'
  },
  {
    uri: 'atk://docs/environments',
    name: 'Environment Management',
    description: 'Managing multiple environments (dev, staging, prod)',
    mimeType: 'text/markdown'
  },
  {
    uri: 'atk://docs/project-structure',
    name: 'Project File Structure',
    description: 'CRITICAL: Which files to edit and which are auto-generated (manifest.json, .generated/)',
    mimeType: 'text/markdown'
  },
  {
    uri: 'atk://docs/security-best-practices',
    name: 'Security Best Practices',
    description: 'Security guidelines for Microsoft 365 agents',
    mimeType: 'text/markdown'
  }
];

/**
 * Get documentation resource content by URI
 */
export function getDocumentationResource(uri: string): ResourceContent | null {
  switch (uri) {
    case 'atk://docs/commands':
      return {
        uri,
        mimeType: 'text/markdown',
        text: getCommandsReference()
      };

    case 'atk://docs/lifecycle':
      return {
        uri,
        mimeType: 'text/markdown',
        text: getLifecycleGuide()
      };

    case 'atk://docs/config/m365agents':
      return {
        uri,
        mimeType: 'text/markdown',
        text: getM365AgentsConfig()
      };

    case 'atk://docs/config/manifest':
      return {
        uri,
        mimeType: 'text/markdown',
        text: getManifestReference()
      };

    case 'atk://docs/environments':
      return {
        uri,
        mimeType: 'text/markdown',
        text: getEnvironmentsGuide()
      };

    case 'atk://docs/project-structure':
      return {
        uri,
        mimeType: 'text/markdown',
        text: getProjectStructureGuide()
      };

    case 'atk://docs/security-best-practices':
      return {
        uri,
        mimeType: 'text/markdown',
        text: getSecurityBestPractices()
      };

    default:
      return null;
  }
}

function getCommandsReference(): string {
  return `# ATK CLI Commands Reference

## Core Commands

### atk new
Create a new Microsoft 365 declarative agent project.

**Syntax (TypeSpec format - recommended):**
\`\`\`bash
atk new --app-name <name> --capability declarative-agent --folder <dir> --interactive false -with-plugin type-spec
\`\`\`

**Syntax (JSON format - simple):**
\`\`\`bash
atk new --app-name <name> --capability declarative-agent --folder <dir> --interactive false
\`\`\`

**Template:**
- \`declarative-agent\` - Declarative agent with instructions and configuration

**Formats:**
- TypeSpec (with \`-with-plugin type-spec\`) - Type-safe definitions with IntelliSense
- JSON (default, no plugin) - Simple JSON-based configuration

### atk provision
Provision cloud resources for your agent.

**Syntax:**
\`\`\`bash
atk provision --env <environment>
\`\`\`

Creates Azure resources defined in m365agents.yml.

### atk deploy
Deploy application code to Azure.

**Syntax:**
\`\`\`bash
atk deploy --env <environment>
\`\`\`

Builds and uploads your code to provisioned resources.

### atk package
Build app package for Microsoft 365.

**Syntax:**
\`\`\`bash
atk package --env <environment> --output-folder <path>
\`\`\`

Creates .zip package with manifest and resources.

### atk publish
Publish app to Microsoft 365.

**Syntax:**
\`\`\`bash
atk publish --env <environment>
\`\`\`

Uploads and registers app in Microsoft 365 tenant.

### atk validate
Validate app manifest.

**Syntax:**
\`\`\`bash
atk validate --manifest-file <path>
\`\`\`

Checks manifest against Microsoft 365 requirements.

### atk doctor
Check system prerequisites.

**Syntax:**
\`\`\`bash
atk doctor
\`\`\`

Verifies Node.js, Azure CLI, and other requirements.

## Environment Management

### atk env add
Create new environment from existing.

**Syntax:**
\`\`\`bash
atk env add <new-env> --env <source-env>
\`\`\`

### atk env list
List all environments.

### atk env reset
Reset environment configuration.

## Additional Resources

- Official Documentation: https://learn.microsoft.com/en-us/microsoftteams/platform/toolkit/microsoft-365-agents-toolkit-cli
- GitHub: https://github.com/OfficeDev/microsoft-365-agents-toolkit
- npm Package: https://www.npmjs.com/package/@microsoft/m365agentstoolkit-cli
`;
}

function getLifecycleGuide(): string {
  return `# Project Lifecycle Guide

## Overview

ATK projects follow a defined lifecycle with three main stages:

1. **Provision** - Create cloud resources
2. **Deploy** - Upload application code
3. **Publish** - Make available to users

## Lifecycle Stages

### 1. Provision

**Purpose:** Create and configure Azure cloud resources.

**What Happens:**
- Creates Azure resource group
- Provisions compute (Functions/App Service)
- Sets up storage accounts
- Registers Azure AD application
- Configures permissions

**When to Run:**
- First time deploying
- Creating new environment
- After infrastructure changes

**Command:**
\`\`\`bash
atk provision --env dev
\`\`\`

**Output:**
- .env.dev file with resource IDs
- Azure resources created
- Service principal configured

### 2. Deploy

**Purpose:** Build and upload application code.

**What Happens:**
- Compiles TypeScript to JavaScript
- Bundles dependencies
- Uploads to Azure
- Updates app settings
- Restarts services

**When to Run:**
- After code changes
- After dependency updates
- Regular development cycle

**Command:**
\`\`\`bash
atk deploy --env dev
\`\`\`

**Prerequisites:**
- Resources already provisioned
- .env file exists

### 3. Publish

**Purpose:** Register app in Microsoft 365.

**What Happens:**
- Validates app package
- Uploads to M365 tenant
- Registers in app catalog
- Configures availability

**When to Run:**
- First time releasing
- After version updates
- When changing manifest

**Command:**
\`\`\`bash
atk publish --env prod
\`\`\`

**Prerequisites:**
- Package built
- Admin permissions

## Complete Workflow

### Development Workflow

1. **Create Project**
   \`\`\`bash
   atk new --app-name my-agent --capability declarative-agent
   \`\`\`

2. **Develop Features**
   - Write code
   - Test locally
   - Run validation

3. **Provision Resources**
   \`\`\`bash
   atk provision --env dev
   \`\`\`

4. **Deploy Code**
   \`\`\`bash
   atk deploy --env dev
   \`\`\`

5. **Package App**
   \`\`\`bash
   atk package --env dev
   \`\`\`

6. **Publish to M365**
   \`\`\`bash
   atk publish --env dev
   \`\`\`

### Update Workflow

When updating existing agent:

1. **Make Code Changes**
2. **Deploy Updates**
   \`\`\`bash
   atk deploy --env dev
   \`\`\`

3. **Rebuild Package** (if manifest changed)
   \`\`\`bash
   atk package --env dev
   \`\`\`

4. **Republish** (if manifest changed)
   \`\`\`bash
   atk publish --env dev
   \`\`\`

### Production Release

1. **Test in Dev**
   - Deploy to dev environment
   - Test all features
   - Validate package

2. **Deploy to Staging**
   \`\`\`bash
   atk provision --env staging
   atk deploy --env staging
   atk package --env staging
   \`\`\`

3. **Test in Staging**
   - Run integration tests
   - User acceptance testing

4. **Deploy to Production**
   \`\`\`bash
   atk provision --env prod
   atk deploy --env prod
   atk package --env prod
   atk publish --env prod
   \`\`\`

## Best Practices

- Always provision before first deploy
- Test in dev before staging/prod
- Use version control for all changes
- Document environment differences
- Monitor deployments in Azure portal
- Keep .env files secure

## Troubleshooting

### Provision Issues
- Check Azure login: \`az login\`
- Verify subscription: \`az account show\`
- Check permissions (need Contributor/Owner)

### Deploy Issues
- Ensure provisioned first
- Check .env file exists
- Verify code compiles: \`npm run build\`

### Publish Issues
- Validate package first
- Check M365 admin permissions
- Verify manifest version updated
`;
}

function getM365AgentsConfig(): string {
  return `# m365agents.yml Configuration

## Overview

The m365agents.yml file defines your project's lifecycle stages (provision, deploy, publish) and configuration.

## File Structure

\`\`\`yaml
version: 1.1.0

projectId: <unique-project-id>

environmentFolderPath: ./env

provision:
  - uses: azureFunction
    with:
      resourceGroup: \${AZURE_RESOURCE_GROUP}
      functionAppName: \${FUNCTION_APP_NAME}
      runtime: node
      runtimeVersion: 18

deploy:
  - uses: azureFunctionDeploy
    with:
      functionAppName: \${FUNCTION_APP_NAME}
      artifactFolder: ./
      ignoreFile: ./.funcignore

publish:
  - uses: teamsAppPublish
    with:
      manifestPath: ./appPackage/manifest.json
\`\`\`

## Environment-Specific Files

Create separate files for each environment:
- \`m365agents.yml\` - Default configuration
- \`m365agents.dev.yml\` - Development overrides
- \`m365agents.staging.yml\` - Staging overrides
- \`m365agents.prod.yml\` - Production overrides

## Variable Substitution

Use \${VARIABLE_NAME} syntax to reference environment variables from .env files.

Example:
\`\`\`yaml
resourceGroup: \${AZURE_RESOURCE_GROUP}  # From .env.dev
location: \${AZURE_LOCATION}             # From .env.dev
\`\`\`

## Common Actions

### Azure Functions
\`\`\`yaml
provision:
  - uses: azureFunction
    with:
      resourceGroup: rg-myapp-dev
      functionAppName: func-myapp-dev
      runtime: node
      runtimeVersion: 18
      memorySize: 512
\`\`\`

### Azure App Service
\`\`\`yaml
provision:
  - uses: azureAppService
    with:
      resourceGroup: rg-myapp-dev
      appServiceName: app-myapp-dev
      runtime: node
      runtimeVersion: 18
\`\`\`

### Bot Registration
\`\`\`yaml
provision:
  - uses: botRegistration
    with:
      botId: \${BOT_ID}
      botPassword: \${BOT_PASSWORD}
      endpoint: https://\${FUNCTION_APP_NAME}.azurewebsites.net/api/messages
\`\`\`

## Best Practices

- Use environment variables for secrets
- Separate configuration per environment
- Version control m365agents.yml
- Document custom actions
- Use consistent naming conventions
`;
}

function getManifestReference(): string {
  return `# App Manifest Reference

## Overview

The manifest.json file defines your Microsoft 365 agent's configuration, capabilities, and metadata.

## Required Fields

\`\`\`json
{
  "$schema": "https://developer.microsoft.com/json-schemas/teams/v1.16/MicrosoftTeams.schema.json",
  "manifestVersion": "1.16",
  "version": "1.0.0",
  "id": "<unique-guid>",
  "packageName": "com.example.myagent",
  "developer": {
    "name": "Developer Name",
    "websiteUrl": "https://example.com",
    "privacyUrl": "https://example.com/privacy",
    "termsOfUseUrl": "https://example.com/terms"
  },
  "name": {
    "short": "My Agent",
    "full": "My Microsoft 365 Agent"
  },
  "description": {
    "short": "Brief description",
    "full": "Detailed description"
  },
  "icons": {
    "color": "color.png",
    "outline": "outline.png"
  },
  "accentColor": "#FFFFFF"
}
\`\`\`

## Icon Requirements

- **color.png**: 192x192 pixels, PNG format
- **outline.png**: 32x32 pixels, PNG format, transparent background

## Bot Configuration

\`\`\`json
{
  "bots": [
    {
      "botId": "<bot-guid>",
      "scopes": ["personal", "team", "groupchat"],
      "supportsFiles": false,
      "isNotificationOnly": false,
      "commandLists": [
        {
          "scopes": ["personal"],
          "commands": [
            {
              "title": "Help",
              "description": "Get help with the agent"
            }
          ]
        }
      ]
    }
  ]
}
\`\`\`

## Declarative Agent

\`\`\`json
{
  "copilotAgents": {
    "declarativeAgents": [
      {
        "id": "agent-id",
        "file": "declarativeAgent.json"
      }
    ]
  }
}
\`\`\`

## Permissions

\`\`\`json
{
  "permissions": [
    "identity",
    "messageTeamMembers"
  ],
  "validDomains": [
    "example.com",
    "api.example.com"
  ]
}
\`\`\`

## Validation

Run validation before packaging:
\`\`\`bash
atk validate --manifest-file ./appPackage/manifest.json
\`\`\`

## Common Issues

1. **Invalid Version**: Use semver (1.0.0)
2. **Icon Size**: Exactly 192x192 and 32x32
3. **Invalid GUID**: Generate new GUID for bot ID
4. **Missing URLs**: Privacy and terms URLs required
5. **Invalid Domains**: No wildcards, HTTPS only
`;
}

function getEnvironmentsGuide(): string {
  return `# Environment Management Guide

## Overview

Manage multiple environments (dev, staging, prod) for your Microsoft 365 agent.

## Environment Files

Each environment has:
- \`m365agents.{env}.yml\` - Lifecycle configuration
- \`.env.{env}\` - Environment variables
- \`manifest.{env}.json\` - App manifest (optional)

## Creating Environments

### Add New Environment

\`\`\`bash
atk env add staging --env dev
\`\`\`

This copies configuration from dev to staging.

### List Environments

\`\`\`bash
atk env list
\`\`\`

### Reset Environment

\`\`\`bash
atk env reset
\`\`\`

## Environment Variables

### .env.dev
\`\`\`
AZURE_SUBSCRIPTION_ID=<subscription-id>
AZURE_RESOURCE_GROUP=rg-myapp-dev
BOT_ID=<bot-guid>
BOT_PASSWORD=<bot-secret>
\`\`\`

### .env.prod
\`\`\`
AZURE_SUBSCRIPTION_ID=<subscription-id>
AZURE_RESOURCE_GROUP=rg-myapp-prod
BOT_ID=<bot-guid>
BOT_PASSWORD=<bot-secret>
\`\`\`

## Provisioning Per Environment

\`\`\`bash
# Development
atk provision --env dev

# Staging
atk provision --env staging

# Production
atk provision --env prod
\`\`\`

## Best Practices

1. **Separate Azure Subscriptions** - Use different subscriptions for prod
2. **Consistent Naming** - Follow naming convention (rg-app-env)
3. **Secure Secrets** - Use Azure Key Vault for production
4. **Document Differences** - Note environment-specific settings
5. **Test Path** - Dev -> Staging -> Production

## Security

- Add .env files to .gitignore
- Never commit secrets
- Use managed identities in production
- Rotate secrets regularly
- Limit production access
`;
}

function getSecurityBestPractices(): string {
  return `# Security Best Practices

## Authentication & Authorization

### Bot Authentication
- Store bot password in Azure Key Vault
- Use managed identities where possible
- Rotate credentials regularly
- Enable certificate validation

### Azure AD Integration
- Follow least-privilege principle for OAuth scopes
- Implement proper token validation
- Handle token expiration gracefully
- Use refresh tokens securely

## Secrets Management

### Development
- Use .env files (never commit)
- Keep .env in .gitignore
- Document required variables

### Production
- Use Azure Key Vault
- Enable managed identities
- Audit key vault access
- Rotate secrets regularly

## Data Protection

### User Data
- Minimize data collection
- Encrypt data in transit (HTTPS only)
- Encrypt sensitive data at rest
- Comply with GDPR/privacy regulations
- Implement data retention policies

### Logging
- Never log secrets or credentials
- Mask PII in logs
- Use structured logging
- Secure log storage
- Define retention policies

## App Manifest Security

### Permissions
- Request only necessary permissions
- Document why each permission is needed
- Use RSC permissions appropriately
- Plan for admin consent

### Domains
- Minimize valid domains list
- No wildcard domains
- HTTPS only
- Own/control all domains

## Code Security

### Dependencies
- Run \`npm audit\` regularly
- Keep dependencies updated
- Use lock files
- Scan for vulnerabilities in CI/CD

### Input Validation
- Sanitize all user input
- Prevent injection attacks
- Validate file uploads
- Enforce size limits

### Error Handling
- Don't expose sensitive data in errors
- Use generic error messages for users
- Log detailed errors securely
- No stack traces to users

## Azure Security

### Network
- Use private endpoints
- Configure NSGs
- Enable TLS 1.2+
- Consider VNet integration

### Access Control
- Configure RBAC properly
- Use managed identities
- Regular access reviews
- Separate environments

### Monitoring
- Enable Application Insights
- Set up security alerts
- Monitor failed authentications
- Enable anomaly detection

## Compliance

- Publish privacy policy
- Implement terms of use
- Support data subject rights
- Document data processing
- Meet industry regulations

## Incident Response

- Document response plan
- Provide security contact
- Implement backup/recovery
- Define patch process
`;
}

function getProjectStructureGuide(): string {
  // Read from the PROJECT_FILE_STRUCTURE.md file
  const docsPath = join(__dirname, '../../docs/PROJECT_FILE_STRUCTURE.md');
  try {
    return readFileSync(docsPath, 'utf-8');
  } catch (error) {
    return `# Project File Structure

## ⚠️ CRITICAL RULE FOR CODING AGENTS

**NEVER edit files in these locations:**
- \`appPackage/manifest.json\` - **AUTO-GENERATED**
- \`appPackage/declarativeAgent.json\` - **AUTO-GENERATED**
- \`.generated/\` folder - **ALL FILES AUTO-GENERATED**

These files are regenerated from source definitions on every build. Manual edits will be **overwritten and lost**.

## Files You CAN Edit (Source Files)

- \`src/*.tsp\` - TypeSpec source files (agent instructions, capabilities, definitions)
- \`appPackage/color.png\`, \`appPackage/outline.png\` - App icons
- \`.env\` files - Environment variables
- \`m365agents.yml\` - Build configuration
- \`package.json\` - npm dependencies

## Files You MUST NOT Edit (Generated Files)

- \`appPackage/manifest.json\` - Auto-generated from source
- \`appPackage/declarativeAgent.json\` - Auto-generated from source
- \`.generated/**\` - All files auto-generated during build

## Why This Matters

The build process regenerates \`manifest.json\`, \`declarativeAgent.json\`, and \`.generated/\` files from TypeSpec source definitions. Any manual edits will be lost on the next build.

**Always edit TypeSpec source files (src/*.tsp), never generated files.**
`;
  }
}
