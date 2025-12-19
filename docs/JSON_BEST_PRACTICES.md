---
description: 'Expert guidance for building declarative agents with JSON manifests for Microsoft 365 Copilot using Microsoft 365 Agents Toolkit'
applyTo: '**/declarativeAgent.json,**/manifest.json,**/*-apiplugin.json'
---

# JSON Declarative Agent Development for Microsoft 365 Copilot

## ⚠️ CRITICAL: Always Use MCP Server Tools

**IMPORTANT**: When working with this MCP server, you MUST use the provided MCP tools for ALL operations. NEVER use direct CLI commands.

### ❌ NEVER Use These Commands Directly
- `atk provision` → Use `atk_provision` tool instead
- `atk deploy` → Use `atk_deploy` tool instead
- `atk package` → Use `atk_package` tool instead
- `atk publish` → Use `atk_publish` tool instead
- `atk validate` → Use `atk_validate` tool instead
- `npx @microsoft/m365agentstoolkit-cli ...` → Use appropriate MCP tool

### ✅ ALWAYS Use MCP Server Tools
All operations MUST go through the MCP server tools for proper error handling, validation, and integration.

### 🔍 ALWAYS Validate After Code Generation
After every successful code generation or modification:
1. **First**: Use `atk_validate` tool to validate your JSON manifests
2. **Then**: Use `atk_package` tool to validate the complete agent package
3. **Never skip** these validation steps - they catch errors early

---

## JSON Schema Versions

- **Declarative Agent Manifest**: v1.6 (https://developer.microsoft.com/json-schemas/copilot/declarative-agent/v1.6/schema.json)
- **API Plugin Manifest**: v2.4 (https://developer.microsoft.com/json-schemas/copilot/plugin/v2.4/schema.json)

## General Instructions

- Always validate JSON files against the official schemas before deployment.
- Use proper JSON formatting with consistent indentation (2 or 4 spaces).
- Ensure all required properties are present and have valid values.
- Follow character limits strictly (e.g., name: 100 chars, description: 1000 chars, instructions: 8000 chars).
- Use localization tokens in the format `[[token_name]]` for localizable strings.
- Test manifest validation frequently during development.

## Naming Conventions

- Use descriptive names that clearly convey the agent's or plugin's purpose.
- For plugin namespaces, use PascalCase or snake_case matching the regex `^[A-Za-z0-9_]+$`.
- For function names, use descriptive names that match the regex `^[A-Za-z0-9_]+$`.
- Keep property names exactly as specified in the schemas (case-sensitive).

## Formatting

- Apply consistent indentation (2 or 4 spaces) throughout JSON files.
- Use line breaks between major sections for readability.
- Place one property per line.
- Add comments using `$comment` property where supported by the schema.
- Ensure proper JSON syntax (commas, quotes, brackets).
- Add a newline at the end of each file.

## Project Setup and Structure

### Declarative Agent Project Structure
```
appPackage/
  manifest.json                    # Teams app manifest
  declarativeAgent.json            # Declarative agent definition (v1.6)
  *-apiplugin.json                 # API plugin manifests (v2.4, optional)
  color.png                        # 192x192 app icon
  outline.png                      # 32x32 app icon outline
  knowledge/                       # Knowledge files (optional)
    *.md, *.txt, *.pdf
env/
  .env.local                       # Local environment variables
  .env.dev                         # Dev environment variables
  .env.prod                        # Production environment variables
```

### Key Configuration Files
- **m365agents.yml**: Orchestrates build and deployment lifecycle
- **manifest.json**: Teams app manifest that references the declarative agent
- **declarativeAgent.json**: Defines agent behavior, capabilities, and actions
- **\*-apiplugin.json**: Defines API plugins with OpenAPI operations

## Declarative Agent Manifest (v1.6)

### Required Properties

```json
{
  "$schema": "https://developer.microsoft.com/json-schemas/copilot/declarative-agent/v1.6/schema.json",
  "version": "v1.6",
  "name": "Policy Assistant",
  "description": "An agent that helps users find and understand company policies"
}
```

### Key Properties

#### version (required)
- **Type**: string
- **Value**: Must be `"v1.6"`
- **Localizable**: No

#### name (required)
- **Type**: string
- **Constraints**: 1-100 characters, at least one non-whitespace character
- **Localizable**: Yes
- **Pattern**: `^(\[\[)[a-zA-Z_][a-zA-Z0-9_]*(\]\])$|^(?!(.*?\[\[.*?|.*?\]\].*?)).*$`
- **Example**: `"Policy Assistant"` or `"[[agent_name]]"`

#### description (required)
- **Type**: string
- **Constraints**: 1-1000 characters, at least one non-whitespace character
- **Localizable**: Yes
- **Pattern**: Same as name
- **Example**: `"An agent that helps users find and understand company policies"`

#### id (optional)
- **Type**: string
- **Description**: Unique identifier for the agent
- **Localizable**: No
- **Pattern**: `^(?!\[\[)(.*?)(?<!\]\])$`
- **Best Practice**: Omit unless you need a specific identifier across deployments

#### instructions (optional)
- **Type**: string
- **Constraints**: 1-8000 characters, at least one non-whitespace character
- **Localizable**: No
- **Pattern**: `^(?!\[\[)((.|\\n|\\r)*?)(?<!\]\])$`
- **Description**: Detailed instructions on how the agent should behave

**Best Practices for Instructions**:
- Use clear, directive language with keywords like **ALWAYS**, **NEVER**, **MUST**
- Provide concrete examples of expected behavior
- Keep instructions focused and relevant to the agent's purpose
- Structure instructions with sections for clarity

**Example**:
```json
{
  "instructions": "You are a Policy Assistant that helps employees find and understand company policies.\n\n**ALWAYS**:\n- Search the knowledge base before responding\n- Cite specific policy documents when providing information\n- Use professional and clear language\n\n**NEVER**:\n- Provide legal advice\n- Make assumptions about policies not in the knowledge base\n- Share confidential information"
}
```

#### disclaimer (optional)
- **Type**: object
- **Description**: Disclaimer message displayed at conversation start
- **Properties**:
  - `text` (required, string): Disclaimer message (1-500 characters)

**Example**:
```json
{
  "disclaimer": {
    "text": "This agent provides general policy information. For specific legal questions, please consult the legal department."
  }
}
```

#### sensitivity_label (optional)
- **Type**: object
- **Description**: Sensitivity label matching tenant's Purview labels
- **Properties**:
  - `id` (string): GUID of the sensitivity label from Purview API

**Example**:
```json
{
  "sensitivity_label": {
    "id": "12345678-1234-1234-1234-123456789012"
  }
}
```

### Capabilities

The `capabilities` array defines what data sources and features the agent can use.

**Supported Capabilities**:
- `WebSearch` - Search the web (scopable)
- `OneDriveAndSharePoint` - Search OneDrive and SharePoint (scopable)
- `TeamsMessages` - Search Teams messages (scopable)
- `Email` - Search email messages (scopable)
- `Dataverse` - Search Dataverse data (scopable)
- `GraphConnectors` - Search Graph connector data (scopable)
- `People` - Search people data
- `GraphicArt` - Generate images
- `CodeInterpreter` - Execute code
- `Meetings` - Search meetings (scopable)
- `EmbeddedKnowledge` - Use packaged knowledge files (scopable)
- `ScenarioModels` - Use tenant-specific models

#### WebSearch Capability

**Basic (unscoped)**:
```json
{
  "capabilities": [
    {
      "name": "WebSearch"
    }
  ]
}
```

**Scoped to specific sites** (1-4 sites):
```json
{
  "capabilities": [
    {
      "name": "WebSearch",
      "sites": [
        {
          "url": "https://www.microsoft.com"
        },
        {
          "url": "https://learn.microsoft.com"
        }
      ]
    }
  ]
}
```

#### OneDriveAndSharePoint Capability

**Basic (unscoped)**:
```json
{
  "capabilities": [
    {
      "name": "OneDriveAndSharePoint"
    }
  ]
}
```

**Scoped by URL**:
```json
{
  "capabilities": [
    {
      "name": "OneDriveAndSharePoint",
      "items_by_url": [
        {
          "url": "https://contoso.sharepoint.com/sites/Engineering"
        }
      ]
    }
  ]
}
```

**Scoped by SharePoint IDs**:
```json
{
  "capabilities": [
    {
      "name": "OneDriveAndSharePoint",
      "items_by_sharepoint_ids": [
        {
          "site_id": "12345678-1234-1234-1234-123456789012",
          "search_associated_sites": true
        }
      ]
    }
  ]
}
```

#### TeamsMessages Capability

**Basic (unscoped)**:
```json
{
  "capabilities": [
    {
      "name": "TeamsMessages"
    }
  ]
}
```

**Scoped to specific teams/channels** (max 5 URLs):
```json
{
  "capabilities": [
    {
      "name": "TeamsMessages",
      "urls": [
        {
          "url": "https://teams.microsoft.com/l/team/..."
        }
      ]
    }
  ]
}
```

#### Email Capability

**Basic (user's mailbox)**:
```json
{
  "capabilities": [
    {
      "name": "Email"
    }
  ]
}
```

**Scoped to specific folders**:
```json
{
  "capabilities": [
    {
      "name": "Email",
      "folders": [
        {
          "folder_id": "inbox"
        },
        {
          "folder_id": "sentitems"
        }
      ]
    }
  ]
}
```

**Scoped to shared mailbox**:
```json
{
  "capabilities": [
    {
      "name": "Email",
      "shared_mailbox": "support@contoso.com"
    }
  ]
}
```

**Scoped to group mailboxes** (max 25):
```json
{
  "capabilities": [
    {
      "name": "Email",
      "group_mailboxes": [
        "team1@contoso.com",
        "team2@contoso.com"
      ]
    }
  ]
}
```

#### People Capability

**Basic**:
```json
{
  "capabilities": [
    {
      "name": "People"
    }
  ]
}
```

**With related content** (includes documents, emails, Teams messages):
```json
{
  "capabilities": [
    {
      "name": "People",
      "include_related_content": true
    }
  ]
}
```

#### GraphicArt Capability

```json
{
  "capabilities": [
    {
      "name": "GraphicArt"
    }
  ]
}
```

#### CodeInterpreter Capability

```json
{
  "capabilities": [
    {
      "name": "CodeInterpreter"
    }
  ]
}
```

#### Meetings Capability

**Basic (unscoped)**:
```json
{
  "capabilities": [
    {
      "name": "Meetings"
    }
  ]
}
```

**Scoped to specific meetings**:
```json
{
  "capabilities": [
    {
      "name": "Meetings",
      "items_by_id": [
        {
          "id": "AAMkAGI1...",
          "is_series": false
        }
      ]
    }
  ]
}
```

#### EmbeddedKnowledge Capability

**With local knowledge files**:
```json
{
  "capabilities": [
    {
      "name": "EmbeddedKnowledge",
      "files": [
        {
          "file": "knowledge/company-policies.pdf"
        },
        {
          "file": "knowledge/employee-handbook.md"
        }
      ]
    }
  ]
}
```

**Supported file types**: PDF, TXT, MD, DOCX, PPTX, XLSX

#### GraphConnectors Capability

```json
{
  "capabilities": [
    {
      "name": "GraphConnectors",
      "connections": [
        {
          "connection_id": "salesforce-connection",
          "additional_search_terms": "Title:Sales",
          "items_by_external_url": [
            {
              "url": "https://salesforce.com/opportunity/12345"
            }
          ]
        }
      ]
    }
  ]
}
```

#### Dataverse Capability

```json
{
  "capabilities": [
    {
      "name": "Dataverse",
      "knowledge_sources": [
        {
          "host_name": "org12345678",
          "skill": "custom-skill-id",
          "tables": [
            {
              "table_name": "accounts"
            },
            {
              "table_name": "contacts"
            }
          ]
        }
      ]
    }
  ]
}
```

#### ScenarioModels Capability

```json
{
  "capabilities": [
    {
      "name": "ScenarioModels",
      "models": [
        {
          "id": "custom-model-id-123"
        }
      ]
    }
  ]
}
```

### Conversation Starters

**Constraints**: Max 12 starters

```json
{
  "conversation_starters": [
    {
      "title": "Find vacation policy",
      "text": "What is our company's vacation policy?"
    },
    {
      "title": "Remote work guidelines",
      "text": "Can you explain the remote work policy?"
    },
    {
      "text": "Show me expense reporting procedures"
    }
  ]
}
```

**Properties**:
- `text` (required, localizable): The conversation starter text
- `title` (optional, localizable): Title for the starter

### Actions (API Plugins)

**Constraints**: Max 10 actions

```json
{
  "actions": [
    {
      "id": "repairsPlugin",
      "file": "repairs-apiplugin.json"
    },
    {
      "id": "weatherPlugin",
      "file": "weather-apiplugin.json"
    }
  ]
}
```

**Properties**:
- `id` (required, not localizable): Unique identifier (can be GUID)
- `file` (required, not localizable): Relative path to API plugin manifest

### Worker Agents

```json
{
  "worker_agents": [
    {
      "id": "12345678-1234-1234-1234-123456789012"
    }
  ]
}
```

**Properties**:
- `id` (required, not localizable): Unique identifier of the worker agent

### Behavior Overrides

```json
{
  "behavior_overrides": {
    "special_instructions": {
      "discourage_model_knowledge": true
    },
    "suggestions": {
      "disabled": false
    }
  }
}
```

**special_instructions**:
- `discourage_model_knowledge` (boolean): If true, discourages using model knowledge (default: false)

**suggestions**:
- `disabled` (boolean): If true, disables suggestions feature (default: false)

### User Overrides

**Allow users to remove capabilities**:
```json
{
  "user_overrides": [
    {
      "path": "$.capabilities[?(@.name=='WebSearch')]",
      "allowed_actions": ["remove"]
    }
  ]
}
```

**Properties**:
- `path` (required): JSONPath expression identifying the capability
- `allowed_actions` (required): Array of allowed actions (currently only `"remove"` is supported)

### Complete Declarative Agent Example

```json
{
  "$schema": "https://developer.microsoft.com/json-schemas/copilot/declarative-agent/v1.6/schema.json",
  "version": "v1.6",
  "name": "Policy Assistant",
  "description": "An intelligent agent that helps employees find and understand company policies",
  "instructions": "You are a Policy Assistant that helps employees find and understand company policies.\n\n**ALWAYS**:\n- Search the knowledge base before responding\n- Cite specific policy documents when providing information\n- Use professional and clear language\n\n**NEVER**:\n- Provide legal advice\n- Make assumptions about policies not in the knowledge base",
  "capabilities": [
    {
      "name": "OneDriveAndSharePoint",
      "items_by_url": [
        {
          "url": "https://contoso.sharepoint.com/sites/Policies"
        }
      ]
    },
    {
      "name": "EmbeddedKnowledge",
      "files": [
        {
          "file": "knowledge/employee-handbook.pdf"
        }
      ]
    },
    {
      "name": "WebSearch",
      "sites": [
        {
          "url": "https://www.contoso.com"
        }
      ]
    }
  ],
  "conversation_starters": [
    {
      "title": "Vacation Policy",
      "text": "What is our company's vacation policy?"
    },
    {
      "title": "Remote Work",
      "text": "Can you explain the remote work policy?"
    },
    {
      "title": "Expense Reporting",
      "text": "How do I submit an expense report?"
    }
  ],
  "actions": [
    {
      "id": "policySearchPlugin",
      "file": "policy-search-apiplugin.json"
    }
  ]
}
```

## API Plugin Manifest (v2.4)

### Required Properties

```json
{
  "$schema": "https://developer.microsoft.com/json-schemas/copilot/plugin/v2.4/schema.json",
  "schema_version": "v2.4",
  "name_for_human": "Policy Search",
  "namespace": "PolicySearch",
  "description_for_human": "Search company policies"
}
```

### Key Properties

#### schema_version (required)
- **Type**: string
- **Value**: Must be `"v2.4"`

#### name_for_human (required)
- **Type**: string
- **Constraints**: At least 1 non-whitespace character, recommend ≤20 characters
- **Localizable**: Yes
- **Description**: Short, human-readable plugin name

#### namespace (required)
- **Type**: string
- **Pattern**: `^[A-Za-z0-9_]+$`
- **Description**: Identifier to prevent function name conflicts

#### description_for_human (required)
- **Type**: string
- **Constraints**: Recommend ≤100 characters
- **Localizable**: Yes
- **Description**: Human-readable description of the plugin

#### description_for_model (optional)
- **Type**: string
- **Constraints**: Recommend ≤2048 characters
- **Localizable**: Yes
- **Description**: Description tailored for the model (token context considerations)

#### logo_url (optional)
- **Type**: string (URI)
- **Localizable**: Yes
- **Description**: URL to fetch plugin logo

#### contact_email (optional)
- **Type**: string
- **Description**: Contact email for safety/moderation/support

#### legal_info_url (optional)
- **Type**: string (URI)
- **Localizable**: Yes
- **Description**: URL to terms of service

#### privacy_policy_url (optional)
- **Type**: string (URI)
- **Localizable**: Yes
- **Description**: URL to privacy policy

### Functions

The `functions` array defines operations available to the plugin.

**Function Properties**:
- `id` (optional, string): Unique identifier
- `name` (required, string): Function name matching `^[A-Za-z0-9_]+$`
- `description` (optional, string): Description for the model
- `parameters` (optional, object): Function parameters (JSON Schema subset)
- `returns` (optional, object): Return type description
- `states` (optional, object): State-specific configurations
- `capabilities` (optional, object): Confirmation, response semantics, security info

**Example**:
```json
{
  "functions": [
    {
      "name": "searchPolicies",
      "description": "Search for company policies by keyword",
      "parameters": {
        "type": "object",
        "properties": {
          "query": {
            "type": "string",
            "description": "Search query keywords"
          },
          "category": {
            "type": "string",
            "enum": ["hr", "it", "finance", "legal"],
            "description": "Policy category"
          }
        },
        "required": ["query"]
      },
      "returns": {
        "type": "string",
        "description": "Search results with policy information"
      }
    }
  ]
}
```

### Function Parameters

**Supported types**: `string`, `array`, `boolean`, `integer`, `number`

**Parameter object**:
- `type` (required): Parameter type
- `description` (optional): Parameter description
- `enum` (optional): Valid values (for string type)
- `default` (optional): Default value
- `items` (optional): Array element definition (for array type)

**Example with all features**:
```json
{
  "parameters": {
    "type": "object",
    "properties": {
      "query": {
        "type": "string",
        "description": "Search query"
      },
      "tags": {
        "type": "array",
        "description": "Filter tags",
        "items": {
          "type": "string"
        }
      },
      "limit": {
        "type": "integer",
        "description": "Max results",
        "default": 10
      },
      "includeArchived": {
        "type": "boolean",
        "description": "Include archived policies",
        "default": false
      },
      "category": {
        "type": "string",
        "enum": ["hr", "it", "finance"],
        "description": "Policy category"
      }
    },
    "required": ["query"]
  }
}
```

### Function States

Define behavior in different orchestrator states:

```json
{
  "states": {
    "reasoning": {
      "description": "Search policies during reasoning",
      "instructions": [
        "Use specific keywords from user query",
        "Try multiple search strategies if first attempt fails"
      ],
      "examples": [
        "User asks about vacation -> search for 'vacation policy'",
        "User asks about PTO -> search for 'paid time off' and 'vacation'"
      ]
    },
    "responding": {
      "description": "Format policy information for user",
      "instructions": "Present policy information clearly with citations"
    }
  }
}
```

### Function Capabilities

#### Confirmation

Request user confirmation before invoking:

```json
{
  "capabilities": {
    "confirmation": {
      "type": "AdaptiveCard",
      "title": "Submit Expense Report",
      "body": "Are you sure you want to submit this expense report for ${{amount}}?",
      "isNonConsequential": false
    }
  }
}
```

**Confirmation types**: `None`, `AdaptiveCard`

#### Response Semantics

Enable rich visual rendering with Adaptive Cards:

```json
{
  "capabilities": {
    "response_semantics": {
      "data_path": "$.results[*]",
      "properties": {
        "title": "$.name",
        "subtitle": "$.category",
        "url": "$.link",
        "thumbnail_url": "$.icon"
      },
      "static_template": {
        "type": "AdaptiveCard",
        "version": "1.5",
        "body": [
          {
            "type": "TextBlock",
            "text": "${name}",
            "weight": "bolder"
          }
        ]
      }
    }
  }
}
```

**Or reference external template file**:
```json
{
  "capabilities": {
    "response_semantics": {
      "data_path": "$.results[*]",
      "properties": {
        "title": "$.name"
      },
      "static_template": {
        "file": "templates/policy-card.json"
      }
    }
  }
}
```

#### Security Info

Indicate data handling behavior:

```json
{
  "capabilities": {
    "security_info": {
      "data_handling": [
        "GetPrivateData",
        "ResourceStateUpdate"
      ]
    }
  }
}
```

**Data handling values**:
- `GetPublicData`: Reads public data
- `GetPrivateData`: Reads private/sensitive data
- `DataTransform`: Transforms data
- `ResourceStateUpdate`: Updates resource state

### Runtimes

Define how functions are invoked.

**Runtime types**: `OpenApi`, `LocalPlugin`, `RemoteMCPServer`

#### OpenApi Runtime

```json
{
  "runtimes": [
    {
      "type": "OpenApi",
      "auth": {
        "type": "None"
      },
      "spec": {
        "url": "https://api.contoso.com/openapi.json"
      },
      "run_for_functions": ["searchPolicies", "getPolicy"]
    }
  ]
}
```

**With inline OpenAPI**:
```json
{
  "runtimes": [
    {
      "type": "OpenApi",
      "auth": {
        "type": "None"
      },
      "spec": {
        "api_description": "openapi: 3.0.0\ninfo:\n  title: Policy API\n..."
      },
      "run_for_functions": ["*"]
    }
  ]
}
```

**Progress styles**:
- `None`: No progress shown
- `ShowUsage`: Show function usage
- `ShowUsageWithInput`: Show usage with inputs
- `ShowUsageWithInputAndOutput`: Show usage with inputs and outputs

#### LocalPlugin Runtime

For Office Add-ins:

```json
{
  "runtimes": [
    {
      "type": "LocalPlugin",
      "auth": {
        "type": "None"
      },
      "spec": {
        "local_endpoint": "Microsoft.Office.Addin"
      },
      "run_for_functions": ["createDocument"]
    }
  ]
}
```

#### RemoteMCPServer Runtime

For Model Context Protocol servers:

```json
{
  "runtimes": [
    {
      "type": "RemoteMCPServer",
      "auth": {
        "type": "OAuthPluginVault",
        "reference_id": "mcp-oauth-ref"
      },
      "spec": {
        "url": "https://mcp-server.contoso.com"
      },
      "run_for_functions": ["*"]
    }
  ]
}
```

**With static MCP tool description (file reference)**:
```json
{
  "runtimes": [
    {
      "type": "RemoteMCPServer",
      "auth": {
        "type": "None"
      },
      "spec": {
        "url": "https://mcp-server.contoso.com",
        "mcp_tool_description": {
          "file": "mcp-tools.json"
        }
      },
      "run_for_functions": ["*"]
    }
  ]
}
```

**With static MCP tool description (inline)**:
```json
{
  "runtimes": [
    {
      "type": "RemoteMCPServer",
      "auth": {
        "type": "None"
      },
      "spec": {
        "url": "https://mcp-server.contoso.com",
        "mcp_tool_description": {
          "tools": [
            {
              "name": "search",
              "description": "Search for items",
              "inputSchema": {
                "type": "object",
                "properties": {
                  "query": {
                    "type": "string"
                  }
                }
              }
            }
          ]
        }
      },
      "run_for_functions": ["*"]
    }
  ]
}
```

### Authentication

**Auth types**: `None`, `OAuthPluginVault`, `ApiKeyPluginVault`

**No authentication**:
```json
{
  "auth": {
    "type": "None"
  }
}
```

**OAuth authentication**:
```json
{
  "auth": {
    "type": "OAuthPluginVault",
    "reference_id": "oauth-config-123"
  }
}
```

**API Key authentication**:
```json
{
  "auth": {
    "type": "ApiKeyPluginVault",
    "reference_id": "apikey-config-456"
  }
}
```

**Note**: `reference_id` is required for `OAuthPluginVault` and `ApiKeyPluginVault`. The reference is configured separately in the admin center.

### Conversation Starters (Plugin-level)

```json
{
  "capabilities": {
    "conversation_starters": [
      {
        "title": "Search policies",
        "text": "Find the expense reporting policy"
      }
    ]
  }
}
```

### Complete API Plugin Example

```json
{
  "$schema": "https://developer.microsoft.com/json-schemas/copilot/plugin/v2.4/schema.json",
  "schema_version": "v2.4",
  "name_for_human": "Policy Search",
  "namespace": "PolicySearch",
  "description_for_human": "Search and retrieve company policies",
  "description_for_model": "This plugin allows searching through company policy documents. Use it when users ask about company policies, procedures, or guidelines.",
  "contact_email": "support@contoso.com",
  "legal_info_url": "https://contoso.com/legal",
  "privacy_policy_url": "https://contoso.com/privacy",
  "functions": [
    {
      "name": "searchPolicies",
      "description": "Search for company policies by keyword and category",
      "parameters": {
        "type": "object",
        "properties": {
          "query": {
            "type": "string",
            "description": "Search query keywords"
          },
          "category": {
            "type": "string",
            "enum": ["hr", "it", "finance", "legal"],
            "description": "Policy category to filter by"
          },
          "limit": {
            "type": "integer",
            "description": "Maximum number of results",
            "default": 10
          }
        },
        "required": ["query"]
      },
      "returns": {
        "type": "string",
        "description": "Search results with policy information"
      },
      "capabilities": {
        "response_semantics": {
          "data_path": "$.results[*]",
          "properties": {
            "title": "$.title",
            "subtitle": "$.category",
            "url": "$.url"
          },
          "static_template": {
            "type": "AdaptiveCard",
            "version": "1.5",
            "body": [
              {
                "type": "TextBlock",
                "text": "${title}",
                "weight": "bolder",
                "size": "medium"
              },
              {
                "type": "TextBlock",
                "text": "${category}",
                "isSubtle": true
              }
            ],
            "actions": [
              {
                "type": "Action.OpenUrl",
                "title": "View Policy",
                "url": "${url}"
              }
            ]
          }
        },
        "security_info": {
          "data_handling": ["GetPrivateData"]
        }
      }
    },
    {
      "name": "getPolicy",
      "description": "Get detailed information about a specific policy by ID",
      "parameters": {
        "type": "object",
        "properties": {
          "policyId": {
            "type": "string",
            "description": "Unique policy identifier"
          }
        },
        "required": ["policyId"]
      },
      "returns": {
        "type": "string",
        "description": "Detailed policy information"
      }
    }
  ],
  "runtimes": [
    {
      "type": "OpenApi",
      "auth": {
        "type": "OAuthPluginVault",
        "reference_id": "policy-api-oauth"
      },
      "spec": {
        "url": "https://api.contoso.com/policies/openapi.json",
        "progress_style": "ShowUsage"
      },
      "run_for_functions": ["*"]
    }
  ],
  "capabilities": {
    "conversation_starters": [
      {
        "title": "Find vacation policy",
        "text": "Search for our vacation policy"
      },
      {
        "title": "Expense reporting",
        "text": "How do I submit expenses?"
      }
    ]
  }
}
```

## Validation and Testing

### Validation Tools
- **CRITICAL**: Use `atk_validate` MCP tool to validate manifests (NEVER use `atk validate` directly)
- **CRITICAL**: After successful validation, use `atk_package` MCP tool to validate the complete agent package
- Validate against JSON schemas before deployment
- Check character limits and required fields
- Verify file paths and references are correct
- **Remember**: Always use MCP server tools - NEVER use direct CLI commands

### Common Validation Errors

1. **"Required field missing"**
   - Ensure all required properties are present
   - Check for typos in property names (case-sensitive)

2. **"Invalid schema version"**
   - Verify `version` is exactly `"v1.6"` for declarative agents
   - Verify `schema_version` is exactly `"v2.4"` for API plugins

3. **"Pattern validation failed"**
   - Check namespace matches `^[A-Za-z0-9_]+$`
   - Check function names match `^[A-Za-z0-9_]+$`
   - Verify localizable strings don't have incorrect token format

4. **"Character limit exceeded"**
   - Name: max 100 characters
   - Description: max 1000 characters
   - Instructions: max 8000 characters

5. **"Invalid capability configuration"**
   - Ensure capability name is spelled correctly (case-sensitive)
   - Verify scoping parameters match the schema
   - Check array size limits (e.g., max 12 conversation starters)

6. **"Invalid file reference"**
   - Ensure file paths are relative to the manifest
   - Verify referenced files exist
   - Check file formats are supported

### Testing Checklist

- [ ] JSON syntax is valid (no trailing commas, proper quotes)
- [ ] All required fields are present
- [ ] Character limits are respected
- [ ] Capability scoping is correct (if applicable)
- [ ] Action file references are valid
- [ ] Conversation starters are meaningful and relevant
- [ ] Instructions are clear and directive
- [ ] API plugin functions are properly defined
- [ ] Runtime configurations are correct
- [ ] Authentication is properly configured
- [ ] Response semantics and Adaptive Cards render correctly

## Environment Configuration

### Environment Variables
Store sensitive values in `.env` files:

```
# .env.local
POLICY_API_ENDPOINT=https://dev-api.contoso.com
OAUTH_REFERENCE_ID=dev-oauth-123

# .env.prod
POLICY_API_ENDPOINT=https://api.contoso.com
OAUTH_REFERENCE_ID=prod-oauth-456
```

### m365agents.yml Configuration

Configure lifecycle stages:

```yaml
version: v1.0

provision:
  - uses: azureStaticWebApps/getDeploymentToken

deploy:
  - uses: cli/runNpmCommand
    with:
      args: run build
  - uses: azureStaticWebApps/deploy

validate:
  - uses: teamsApp/validateManifest
  - uses: teamsApp/validateAppPackage

publish:
  - uses: teamsApp/publishAppPackage
```

## Deployment Workflow

### Local Development
1. Create or edit JSON manifests
2. Validate manifests using `atk_validate` MCP tool
3. Package and validate using `atk_package` MCP tool
4. Test locally with preview tools
5. Iterate on instructions and capabilities

**CRITICAL**: Always use MCP tools, NEVER use direct `atk` commands.

### Deployment to Azure
1. **Provision**: Use `atk_provision` MCP tool with `{"env": "dev"}`
   - Creates Azure resources
   - Generates environment configuration

2. **Deploy**: Use `atk_deploy` MCP tool with `{"env": "dev"}`
   - Builds and uploads code
   - Updates application configuration

3. **Package**: Use `atk_package` MCP tool with `{"env": "dev"}`
   - Creates app package with manifest and resources
   - Validates package integrity

4. **Publish**: Use `atk_publish` MCP tool with `{"env": "dev"}`
   - Uploads to Microsoft 365
   - Makes agent available to users

### Production Deployment
1. Test thoroughly in dev environment
2. Update environment-specific values (.env.prod)
3. Provision production resources using `atk_provision` MCP tool with `{"env": "prod"}`
4. Deploy to production using `atk_deploy` MCP tool with `{"env": "prod"}`
5. Package production app using `atk_package` MCP tool with `{"env": "prod"}`
6. Publish to production using `atk_publish` MCP tool with `{"env": "prod"}`

**Remember**: All deployment operations MUST use MCP server tools.

## Best Practices

### Instructions
- **Be specific**: Use concrete examples and clear directives
- **Use structure**: Break instructions into sections with headers
- **Set boundaries**: Clearly state what the agent should NOT do
- **Cite sources**: Instruct agent to cite specific documents
- **Stay focused**: Keep instructions relevant to agent's purpose

### Capabilities
- **Start minimal**: Add only capabilities you need
- **Scope appropriately**: Use scoping to limit data access
- **Consider privacy**: Be mindful of sensitive data access
- **Test thoroughly**: Verify each capability works as expected

### API Plugins
- **Clear descriptions**: Write descriptions that help the model understand when to use functions
- **Validate parameters**: Use proper types, enums, and descriptions
- **Handle errors**: Ensure API responses include error information
- **Use response semantics**: Provide rich visual experiences with Adaptive Cards
- **Require confirmation**: Use confirmation for consequential actions

### Conversation Starters
- **Be specific**: Provide concrete example questions
- **Cover key scenarios**: Include starters for main use cases
- **Keep it simple**: Use natural language users would actually say
- **Test variations**: Ensure agent handles different phrasings

### Maintenance
- **Version control**: Keep manifests in source control
- **Document changes**: Track why configuration changes were made
- **Test updates**: Validate after every change
- **Monitor usage**: Track how users interact with the agent

## Common Patterns

### Knowledge-Based Agent with Actions
```json
{
  "version": "v1.6",
  "name": "Support Agent",
  "description": "Helps users with support requests",
  "instructions": "Search knowledge base first, then use ticket system if needed.",
  "capabilities": [
    {
      "name": "OneDriveAndSharePoint",
      "items_by_url": [{"url": "https://contoso.sharepoint.com/sites/Support"}]
    },
    {
      "name": "EmbeddedKnowledge",
      "files": [{"file": "knowledge/faq.pdf"}]
    }
  ],
  "actions": [
    {
      "id": "ticketPlugin",
      "file": "ticket-system-apiplugin.json"
    }
  ]
}
```

### Multi-Source Research Agent
```json
{
  "version": "v1.6",
  "name": "Research Assistant",
  "description": "Helps with company research and information gathering",
  "capabilities": [
    {
      "name": "WebSearch",
      "sites": [{"url": "https://www.contoso.com"}]
    },
    {
      "name": "OneDriveAndSharePoint"
    },
    {
      "name": "TeamsMessages",
      "urls": [{"url": "https://teams.microsoft.com/l/team/..."}]
    },
    {
      "name": "GraphConnectors",
      "connections": [{"connection_id": "salesforce"}]
    }
  ]
}
```

### Task-Oriented Agent with Worker Agents
```json
{
  "version": "v1.6",
  "name": "Project Manager Agent",
  "description": "Helps manage projects by coordinating with specialized agents",
  "capabilities": [
    {
      "name": "TeamsMessages"
    }
  ],
  "actions": [
    {
      "id": "projectPlugin",
      "file": "project-api-apiplugin.json"
    }
  ],
  "worker_agents": [
    {
      "id": "budget-agent-id"
    },
    {
      "id": "schedule-agent-id"
    }
  ]
}
```

## Troubleshooting

### Manifest Not Loading
- Verify JSON syntax is valid
- Check $schema URL is correct
- Ensure all required fields are present
- Validate against the schema

### Capability Not Working
- Verify capability name is spelled correctly
- Check scoping parameters are valid
- Ensure user has access to the scoped resources
- Test with unscoped capability first

### Action Not Being Called
- Verify action file reference is correct
- Check function descriptions are clear
- Ensure runtime is properly configured
- Validate authentication is working

### Instructions Not Followed
- Make instructions more specific and directive
- Add concrete examples of expected behavior
- Use emphasis keywords (ALWAYS, NEVER, MUST)
- Test with simpler instructions first

### Authentication Errors
- Verify reference_id matches admin configuration
- Check auth type is correct (OAuth vs ApiKey)
- Ensure user has granted necessary permissions
- Test API authentication separately

## Additional Resources

- **JSON Schemas**:
  - Declarative Agent v1.6: https://developer.microsoft.com/json-schemas/copilot/declarative-agent/v1.6/schema.json
  - API Plugin v2.4: https://developer.microsoft.com/json-schemas/copilot/plugin/v2.4/schema.json

- **Documentation**:
  - Microsoft 365 Agents Toolkit: https://learn.microsoft.com/microsoft-365-copilot/extensibility/agents-toolkit
  - Declarative Agents: https://learn.microsoft.com/microsoft-365-copilot/extensibility/declarative-agent
  - API Plugins: https://learn.microsoft.com/microsoft-365-copilot/extensibility/api-plugins

- **Tools**:
  - ATK CLI: https://www.npmjs.com/package/@microsoft/agents-toolkit
  - JSON Schema Validator: https://www.jsonschemavalidator.net/

- **Community**:
  - GitHub Issues: https://github.com/microsoft/m365-agents-toolkit
  - Stack Overflow: Tag `microsoft-365-copilot`
