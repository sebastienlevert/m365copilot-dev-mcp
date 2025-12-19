# Microsoft 365 Agent Capabilities Reference

> **Official Documentation**: https://learn.microsoft.com/microsoft-365-copilot/extensibility/typespec-capabilities
>
> **Note**: The `atk_add_capability` tool dynamically loads the latest official Microsoft documentation from GitHub and caches it for the session. This file provides supplementary guidance and examples.

## ⚠️ CRITICAL: Scoping Rules

**SCOPING MUST BE DONE IN THE CAPABILITY DEFINITION, NOT IN INSTRUCTIONS**

- ✅ CORRECT: `op webSearch is AgentCapabilities.WebSearch<Sites = [...]>`
- ❌ WRONG: Adding "only search microsoft.com" to instructions

Scoping is done using **generic parameters** on the capability definition. The instructions should focus on BEHAVIOR, not scoping.

---

## WebSearch Capability

### Purpose
Allows the agent to search the public web for current information.

### Syntax

**Unscoped (all web content):**
```typespec
op webSearch is AgentCapabilities.WebSearch;
```

**Scoped (specific domains):**
```typespec
op webSearch is AgentCapabilities.WebSearch<Sites = [
  { url: "https://learn.microsoft.com" },
  { url: "https://docs.microsoft.com" }
]>;
```

### Scoping Parameters
- `Sites` (array, optional): List of URL objects to restrict search
  - Maximum of 4 URLs
  - When omitted: searches all web content
  - When specified: only searches the listed domains/sites

### Best Practices
- Use when your agent needs real-time or recent information
- Scope to specific domains when you want to limit to trusted sources
- Instruct the agent on when to prefer web search vs. internal actions
- Guide the agent to cite sources from web results
- Consider privacy implications when combining web data with internal data

---

## OneDriveAndSharePoint Capability

### Purpose
Enables the agent to search and access files in user's OneDrive and SharePoint.

### Syntax

**Unscoped (all OneDrive and SharePoint):**
```typespec
op oneDrive is AgentCapabilities.OneDriveAndSharePoint;
```

**Scoped by URL:**
```typespec
op oneDrive is AgentCapabilities.OneDriveAndSharePoint<ItemsByUrl = [
  { url: "https://contoso.sharepoint.com/sites/ProductSupport" },
  { url: "https://contoso.sharepoint.com/sites/Engineering/Documents/Specs" }
]>;
```

**Scoped by SharePoint IDs:**
```typespec
op oneDrive is AgentCapabilities.OneDriveAndSharePoint<ItemsBySharePointIds = [
  {
    site_id: "contoso.sharepoint.com,guid,guid",
    web_id: "guid",
    list_id: "guid",
    unique_id: "guid"
  }
]>;
```

### Scoping Parameters
- `ItemsByUrl` (array, optional): SharePoint URLs to restrict access
- `ItemsBySharePointIds` (array, optional): SharePoint internal IDs

---

## TeamsMessages Capability

### Purpose
Allows the agent to use Teams channels, teams, and meeting chats as knowledge sources.

### Syntax

**Unscoped (all Teams):**
```typespec
op teams is AgentCapabilities.TeamsMessages;
```

**Scoped (specific teams/channels):**
```typespec
op teams is AgentCapabilities.TeamsMessages<TeamsMessagesByUrl = [
  { url: "https://teams.microsoft.com/l/team/19%3A..." },
  { url: "https://teams.microsoft.com/l/channel/19%3A..." }
]>;
```

---

## Email Capability

### Purpose
Allows the agent to use email from user's mailbox or shared mailbox as knowledge.

### Syntax

**Unscoped (entire mailbox):**
```typespec
op email is AgentCapabilities.Email;
```

**Scoped by folders:**
```typespec
op email is AgentCapabilities.Email<Folders = [
  { folder_id: "Inbox" },
  { folder_id: "SentItems" }
]>;
```

**Scoped to shared mailbox:**
```typespec
op email is AgentCapabilities.Email<
  SharedMailbox = "support@contoso.com",
  Folders = [{ folder_id: "Inbox" }]
>;
```

---

## People Capability

### Purpose
Allows the agent to answer questions about individuals in the organization.

### Syntax
```typespec
op people is AgentCapabilities.People;
```

**Note**: This capability does NOT support scoping parameters.

---

## GraphicArt Capability

### Purpose
Enables the agent to generate images based on user prompts.

### Syntax
```typespec
op graphicArt is AgentCapabilities.GraphicArt;
```

**Note**: This capability does NOT support scoping parameters.

---

## CopilotConnectors Capability

### Purpose
Allows the agent to search content ingested via Microsoft Graph connectors.

### Syntax

**Unscoped (all connectors):**
```typespec
op connectors is AgentCapabilities.CopilotConnectors;
```

**Scoped (specific connectors):**
```typespec
op connectors is AgentCapabilities.CopilotConnectors<Connections = [
  { connectionId: "policieslocal" },
  { connectionId: "customersupport" }
]>;
```

---

## CodeInterpreter Capability

### Purpose
Enables the agent to write and execute Python code for data analysis and visualization.

### Syntax
```typespec
op codeInterpreter is AgentCapabilities.CodeInterpreter;
```

**Note**: This capability does NOT support scoping parameters.

---

## Meetings Capability

### Purpose
Allows the agent to search meeting content.

### Syntax
```typespec
op meetings is AgentCapabilities.Meetings;
```

**Note**: This capability does NOT support scoping parameters.

---

## ScenarioModels Capability

### Purpose
Allows the agent to use task-specific models for specialized scenarios.

### Syntax
```typespec
op scenarioModels is AgentCapabilities.ScenarioModels<Models = [
  { id: "model-id-1" },
  { id: "model-id-2" }
]>;
```

**Note**: The `Models` parameter is REQUIRED.

---

## Dataverse Capability

### Purpose
Allows the agent to search for information in Microsoft Dataverse.

### Syntax

**Unscoped (all environments):**
```typespec
op dataverse is AgentCapabilities.Dataverse;
```

**Scoped by environment and tables:**
```typespec
op dataverse is AgentCapabilities.Dataverse<KnowledgeSources = [
  {
    hostName: "contoso.crm.dynamics.com",
    tables: [
      { tableName: "account" },
      { tableName: "contact" }
    ]
  }
]>;
```

---

## Quick Reference Table

| Capability | Scopable | Scoping Parameter | Default Behavior |
|------------|----------|-------------------|------------------|
| WebSearch | Yes | `Sites` | All web content |
| OneDriveAndSharePoint | Yes | `ItemsByUrl` or `ItemsBySharePointIds` | All accessible content |
| TeamsMessages | Yes | `TeamsMessagesByUrl` | All accessible Teams |
| Email | Yes | `Folders`, `SharedMailbox` | Entire user mailbox |
| People | No | N/A | All org directory |
| GraphicArt | No | N/A | All prompts allowed |
| CopilotConnectors | Yes | `Connections` | All accessible connectors |
| CodeInterpreter | No | N/A | All Python code allowed |
| Meetings | No | N/A | All accessible meetings |
| ScenarioModels | **Required** | `Models` | N/A (must specify) |
| Dataverse | Yes | `KnowledgeSources` | All accessible environments |

---

**See Also**:
- `atk://capability-scoping-examples` - Real-world scoping examples
- `atk://agent-decorators` - Agent decorator reference
- `atk://typespec-patterns` - Common TypeSpec patterns
