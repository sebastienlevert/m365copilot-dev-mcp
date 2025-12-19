# TypeSpec Agent Decorators Reference

> **Official Documentation**: https://learn.microsoft.com/microsoft-365-copilot/extensibility/typespec-decorators
>
> **Note**: Tools like `atk_scaffold_action` dynamically load the latest official Microsoft decorator documentation from GitHub and cache it for the session. This file provides supplementary guidance and quick reference.

Complete guide to all decorators used in Microsoft 365 declarative agents.

## @agent Decorator

**Purpose**: Indicates that a namespace represents an agent and provides its basic metadata.

**Parameters**:
- `name` (string, localizable, required): The name of the declarative agent
  - Must contain at least one non-whitespace character
  - Must be 100 characters or less
- `description` (string, localizable, required): The description of the declarative agent
  - Must contain at least one non-whitespace character
  - Must be 1,000 characters or less
- `id` (string, optional): The unique identifier of the agent

**Usage**:
```typespec
@agent("Policy Assistant", "An agent that helps users find and understand company policies")
namespace PolicyAgent {
  // Agent implementation
}
```

**Best Practices**:
- Use clear, descriptive names that convey the agent's purpose
- Write concise but informative descriptions
- Only specify `id` when you need to maintain a specific agent identifier across deployments

## @instructions Decorator

**Purpose**: Defines the instructions that guide the agent's behavior.

**Parameters**:
- `instructions` (string, not localizable, required): The detailed instructions
  - Must contain at least one non-whitespace character
  - Must be 8,000 characters or less

**Usage**:
```typespec
@instructions(Prompts.INSTRUCTIONS)
namespace PolicyAgent {
  // Agent implementation
}
```

**Best Practices**:
- Store instructions in a dedicated `Prompts` namespace in `instructions.tsp`
- Use strong directive keywords: **ALWAYS**, **NEVER**, **MUST**
- Provide concrete examples showing input, function calls, and expected output
- Keep instructions focused and relevant to the agent's purpose
- Structure: GUIDELINES → EXAMPLES → SUGGESTIONS

## @conversationStarter Decorator

**Purpose**: Defines conversation starters that guide users on how to interact with the agent.

**Parameters**:
- `conversationStarter` (ConversationStarter object, required):
  - `title` (string, localizable, optional): A unique title for the conversation starter
  - `text` (string, localizable, required): A suggestion that the user can use

**Usage**:
```typespec
@conversationStarter(#{ title: "Find Policies", text: "Show me all compliance policies" })
@conversationStarter(#{ text: "What's the vacation policy?" })
namespace PolicyAgent {
  // Agent implementation
}
```

**Best Practices**:
- Limit to 12 conversation starters maximum
- Use conversation starters to showcase the agent's key capabilities
- Make suggestions specific and actionable
- Cover diverse use cases to help users understand the agent's range

## @disclaimer Decorator

**Purpose**: Displays a disclaimer message to users at the start of a conversation.

**Parameters**:
- `disclaimer` (Disclaimer object, required):
  - `text` (string, required): The disclaimer message (500 characters max)

**Usage**:
```typespec
@disclaimer(#{ text: "This agent provides general information only. Consult HR for official policy interpretations." })
namespace PolicyAgent {
  // Agent implementation
}
```

**Best Practices**:
- Use disclaimers when the agent handles sensitive information or provides advice
- Keep disclaimers concise and under 500 characters
- Ensure disclaimers comply with your organization's legal requirements
- Review with legal/compliance teams before deployment

## @behaviorOverrides Decorator

**Purpose**: Defines settings that modify the behavior of the agent orchestration.

**Parameters**:
- `behaviorOverrides` (BehaviorOverrides object, required):
  - `discourageModelKnowledge` (boolean, optional): Discourages using model knowledge
  - `disableSuggestions` (boolean, optional): Disables the suggestions feature

**Usage**:
```typespec
@behaviorOverrides(#{ discourageModelKnowledge: true, disableSuggestions: false })
namespace PolicyAgent {
  // Agent implementation
}
```

**Best Practices**:
- Use `discourageModelKnowledge: true` when you want the agent to rely on provided sources
- Use `disableSuggestions: false` (default) to keep suggestions enabled
- Test behavior overrides thoroughly
- Document the reasons for using behavior overrides

## @customExtension Decorator

**Purpose**: Allows adding custom extension properties to the agent for future extensibility.

**Parameters**:
- `key` (string, required): The key name for the custom extension property
- `value` (unknown, required): The value for the custom extension property

**Usage**:
```typespec
@customExtension("customProperty", "customValue")
@customExtension("featureFlag", true)
namespace PolicyAgent {
  // Agent implementation
}
```

**Best Practices**:
- Use custom extensions sparingly
- Document the purpose and expected values clearly
- Coordinate with Microsoft documentation for supported extensions
- Be prepared for custom extensions to be ignored if not recognized

## @actions Decorator

**Purpose**: Provides human-readable metadata for actions in the agent.

**Parameters**:
- Action metadata object with:
  - `name` (string, required): Human-readable name
  - `description` (string, required): Human-readable description
  - `descriptionForModel` (string, required): Description for the LLM

**Usage**:
```typespec
@service()
@server("{POLICIES_API_ENDPOINT}", "Policies API")
@actions({
  name: "Policies API",
  description: "API for retrieving policy information",
  descriptionForModel: "Use this API to retrieve company policies by ID or search for policies"
})
namespace PoliciesAPI {
  // Operations
}
```

**Best Practices**:
- `descriptionForModel` helps the LLM understand when to invoke the action
- Be specific about what the action does and when to use it
- Include parameter information in the description

## HTTP Method Decorators

### @get, @post, @put, @delete

**Purpose**: Specify the HTTP method for an operation.

**Usage**:
```typespec
@get
op getPolicies(): PolicyInfo[];

@post
op createPolicy(@body policy: PolicyInfo): PolicyInfo;

@put
op updatePolicy(@path id: string, @body policy: PolicyInfo): PolicyInfo;

@delete
op deletePolicy(@path id: string): void;
```

## @route Decorator

**Purpose**: Specifies the URL path for an operation.

**Usage**:
```typespec
@route("/policies")
@get
op getPolicies(): PolicyInfo[];

@route("/policies/{id}")
@get
op getPolicy(@path id: string): PolicyInfo;
```

## Parameter Source Decorators

### @path, @query, @body, @header

**Purpose**: Specify where parameters come from in HTTP requests.

**Usage**:
```typespec
@get
@route("/policies/{id}")
op getPolicy(
  @path id: string,
  @query includeArchived?: boolean,
  @header authorization: string
): PolicyInfo;

@post
@route("/policies")
op createPolicy(@body policy: PolicyInfo): PolicyInfo;
```

## @doc Decorator

**Purpose**: Adds documentation to any TypeSpec element.

**Usage**:
```typespec
@doc("Retrieves a policy by its unique identifier")
@get
@route("/policies/{id}")
op getPolicy(
  @doc("The unique identifier of the policy")
  @path id: string
): PolicyInfo;

@doc("Represents a company policy")
model PolicyInfo {
  @doc("The unique identifier for the policy")
  id: string;

  @doc("The policy title")
  title: string;
}
```

**Best Practices**:
- Document all public operations, models, and namespaces
- Explain parameter constraints and expected formats
- Include error scenarios in operation documentation
- Keep documentation concise but informative

---

## Quick Reference Table

| Decorator | Applies To | Required | Purpose |
|-----------|-----------|----------|---------|
| @agent | namespace | Yes | Define agent metadata |
| @instructions | namespace | Yes | Define agent behavior |
| @conversationStarter | namespace | No | Add conversation prompts |
| @disclaimer | namespace | No | Add legal disclaimer |
| @behaviorOverrides | namespace | No | Modify agent orchestration |
| @customExtension | namespace | No | Add custom properties |
| @actions | namespace | Yes | Define action metadata |
| @service | namespace | Yes | Mark as service namespace |
| @server | namespace | Yes | Define server endpoint |
| @route | operation | Yes | Define URL path |
| @get/@post/@put/@delete | operation | Yes | Define HTTP method |
| @path | parameter | No | Path parameter |
| @query | parameter | No | Query parameter |
| @body | parameter | No | Request body |
| @header | parameter | No | HTTP header |
| @doc | any | No | Add documentation |

---

**See Also**:
- `atk://capabilities-reference` - Capability decorators and scoping
- `atk://typespec-patterns` - Common TypeSpec patterns
- `atk://troubleshooting` - Common decorator issues
