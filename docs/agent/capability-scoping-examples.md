# Capability Scoping Examples

## ⚠️ CRITICAL REMINDER

**ALL SCOPING HAPPENS IN THE CAPABILITY DEFINITION, NOT IN INSTRUCTIONS**

This is the #1 mistake developers make. These examples show the CORRECT way.

---

## Example 1: Web Search Scoped to Microsoft Docs

❌ **WRONG** - Scoping in instructions:
```typespec
op webSearch is AgentCapabilities.WebSearch;

// In instructions.tsp
const INSTRUCTIONS = """
ALWAYS only search learn.microsoft.com and docs.microsoft.com
""";
```

✅ **CORRECT** - Scoping in capability definition:
```typespec
op webSearch is AgentCapabilities.WebSearch<Sites = [
  { url: "https://learn.microsoft.com" },
  { url: "https://docs.microsoft.com" }
]>;

// In instructions.tsp
const INSTRUCTIONS = """
When searching for Microsoft documentation, use web search.
Cite sources with URLs.
""";
```

---

## Example 2: SharePoint Scoped to Engineering Site

❌ **WRONG**:
```typespec
op sharepoint is AgentCapabilities.OneDriveAndSharePoint;

// Instructions saying "only search Engineering site"
```

✅ **CORRECT**:
```typespec
op sharepoint is AgentCapabilities.OneDriveAndSharePoint<ItemsByUrl = [
  { url: "https://contoso.sharepoint.com/sites/Engineering" }
]>;
```

---

## Example 3: Email Scoped to Support Shared Mailbox

❌ **WRONG**:
```typespec
op email is AgentCapabilities.Email;

// Instructions: "only search support@contoso.com inbox"
```

✅ **CORRECT**:
```typespec
op email is AgentCapabilities.Email<
  SharedMailbox = "support@contoso.com",
  Folders = [{ folder_id: "Inbox" }]
>;
```

---

## Example 4: Teams Scoped to Project Channels

❌ **WRONG**:
```typespec
op teams is AgentCapabilities.TeamsMessages;

// Instructions: "only search ProjectAlpha team"
```

✅ **CORRECT**:
```typespec
op teams is AgentCapabilities.TeamsMessages<TeamsMessagesByUrl = [
  { url: "https://teams.microsoft.com/l/team/19%3AprojectalphateamID..." }
]>;
```

---

## Example 5: Multiple Capabilities with Different Scopes

```typespec
namespace ComplianceAgent {
  // Web search scoped to government sites
  op webSearch is AgentCapabilities.WebSearch<Sites = [
    { url: "https://www.sec.gov" },
    { url: "https://www.finra.org" }
  ]>;

  // SharePoint scoped to compliance folder
  op sharepoint is AgentCapabilities.OneDriveAndSharePoint<ItemsByUrl = [
    { url: "https://contoso.sharepoint.com/sites/Legal/Compliance" }
  ]>;

  // Email scoped to compliance mailbox
  op email is AgentCapabilities.Email<
    SharedMailbox = "compliance@contoso.com",
    Folders = [
      { folder_id: "Inbox" },
      { folder_id: "Archive" }
    ]
  >;

  // Dataverse scoped to specific tables
  op dataverse is AgentCapabilities.Dataverse<KnowledgeSources = [
    {
      hostName: "contoso.crm.dynamics.com",
      tables: [
        { tableName: "incident" },
        { tableName: "case" }
      ]
    }
  ]>;

  // CodeInterpreter is not scoped
  op codeInterpreter is AgentCapabilities.CodeInterpreter;
}
```

---

## Example 6: Gradually Expanding Scope

**Start Narrow:**
```typespec
// V1: Only Engineering docs
op sharepoint is AgentCapabilities.OneDriveAndSharePoint<ItemsByUrl = [
  { url: "https://contoso.sharepoint.com/sites/Engineering/Docs" }
]>;
```

**Expand Scope:**
```typespec
// V2: All Engineering content
op sharepoint is AgentCapabilities.OneDriveAndSharePoint<ItemsByUrl = [
  { url: "https://contoso.sharepoint.com/sites/Engineering" }
]>;
```

**Further Expansion:**
```typespec
// V3: Engineering and Product
op sharepoint is AgentCapabilities.OneDriveAndSharePoint<ItemsByUrl = [
  { url: "https://contoso.sharepoint.com/sites/Engineering" },
  { url: "https://contoso.sharepoint.com/sites/Product" }
]>;
```

---

## Example 7: What Instructions SHOULD Focus On

Instructions should focus on **behavior**, not scoping:

```typespec
op sharepoint is AgentCapabilities.OneDriveAndSharePoint<ItemsByUrl = [
  { url: "https://contoso.sharepoint.com/sites/Engineering" }
]>;

op codeInterpreter is AgentCapabilities.CodeInterpreter;
```

**Good Instructions:**
```
When the user asks for technical specifications:
1. Search SharePoint for relevant documents
2. If you find Excel files with data, offer to visualize them
3. Always cite the document name and last modified date
4. Prioritize documents modified in the last 30 days

When creating visualizations:
- Use line charts for trends over time
- Use bar charts for comparisons
- Always include axis labels and a descriptive title
- Use corporate colors: blue (#0078D4) for primary data
```

**Bad Instructions (trying to do scoping):**
```
Only search the Engineering SharePoint site  ❌
Only look in the Engineering site's Documents folder  ❌
Don't search other SharePoint sites  ❌
```

---

## Example 8: Combining Scoped and Unscoped Capabilities

```typespec
namespace HybridAgent {
  // Scoped: Only search internal wiki
  op connectors is AgentCapabilities.CopilotConnectors<Connections = [
    { connectionId: "internal-wiki" }
  ]>;

  // Scoped: Only search docs site
  op webSearch is AgentCapabilities.WebSearch<Sites = [
    { url: "https://docs.company.com" }
  ]>;

  // Unscoped: Can access all user's OneDrive
  op oneDrive is AgentCapabilities.OneDriveAndSharePoint;

  // Unscoped: Can search all org people
  op people is AgentCapabilities.People;
}
```

**Instructions for orchestration:**
```
When answering user questions, search in this order:
1. First, search the internal wiki connector
2. If not found, search the documentation website
3. If still not found, search the user's OneDrive
4. Always indicate which source provided the information
```

---

## Common Scoping Mistakes Checklist

- [ ] ❌ Mentioning specific URLs in instructions
- [ ] ❌ Telling the agent "only search X" in instructions
- [ ] ❌ Listing allowed/disallowed sources in instructions
- [ ] ✅ Using generic parameters on capability definitions
- [ ] ✅ Focusing instructions on behavior and orchestration
- [ ] ✅ Testing that scoping actually works as expected

---

**Remember**: If you're writing "only search..." or "don't search..." in your instructions, you're doing it wrong!

**See Also**:
- `atk://capabilities-reference` - Full capability reference
- `atk://agent-decorators` - Decorator reference
