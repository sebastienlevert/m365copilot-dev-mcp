# TypeSpec Patterns for M365 Agents

Common patterns and best practices for TypeSpec declarative agent development.

## Agent Definition Pattern

```typespec
import "@typespec/http";
import "@microsoft/typespec-m365-copilot";

using TypeSpec.Http;

@agent("Agent Name", "Clear description of what the agent does")
@instructions(Prompts.INSTRUCTIONS)
@conversationStarter(#{ title: "Starter 1", text: "Example query" })
@conversationStarter(#{ text: "Another example query" })
namespace MyAgent {
  // Expose actions
  op getResource is ResourceAPI.getResource;
  
  // Enable capabilities
  op webSearch is AgentCapabilities.WebSearch;
  op codeInterpreter is AgentCapabilities.CodeInterpreter;
}
```

## Action Definition Pattern

```typespec
@service()
@server("{API_ENDPOINT}", "API Name")
@actions({
  name: "Resource API",
  description: "Human-readable description",
  descriptionForModel: "When to use this API: describe scenarios and input/output"
})
namespace ResourceAPI {
  @doc("Retrieves a resource by ID")
  @get
  @route("/resources/{id}")
  op getResource(
    @doc("The unique identifier of the resource")
    @path id: string,
    
    @doc("Whether to include archived resources")
    @query includeArchived?: boolean
  ): ResourceInfo | Error;
}
```

## Model Definition Pattern

```typespec
@doc("Represents a resource in the system")
model ResourceInfo {
  @doc("Unique identifier")
  id: string;
  
  @doc("Resource name")
  name: string;
  
  @doc("Resource status")
  status: ResourceStatus;
  
  @doc("Creation timestamp")
  createdAt: datetime;
  
  @doc("Optional description")
  description?: string;
}

@doc("Resource status values")
enum ResourceStatus {
  @doc("Resource is active")
  Active: "Active",
  
  @doc("Resource is archived")
  Archived: "Archived"
}
```

## Instructions Pattern

```typespec
namespace Prompts {
  const INSTRUCTIONS = """
# Agent Behavior Guidelines

## CORE CAPABILITIES
You are an agent that helps users manage resources.

## WHEN TO USE ACTIONS
- ALWAYS call getResource when the user asks about a specific resource
- NEVER make up resource information - always use the API

## RESPONSE FORMAT
When displaying resource information:
1. Start with the resource name
2. Show the current status
3. Include the creation date
4. Add any relevant description

## EXAMPLES

Example 1: User asks "Show me resource ABC123"
- Call: getResource with id="ABC123"
- Response format:
  Resource: [name]
  Status: [status]
  Created: [date]
  Description: [description]

Example 2: User asks for archived resources
- Call: getResource with id="ABC123" and includeArchived=true
- Explain that the resource is archived

## ERROR HANDLING
- If resource not found (404), say: "I couldn't find a resource with that ID."
- If API error, say: "I'm having trouble accessing the resource information. Please try again."
""";
}
```

## Environment Configuration Pattern

```bash
# env/.env.local
APP_NAME_SHORT=MyAgent
API_ENDPOINT=https://localhost:3000
API_KEY=dev-key-here
```

```typespec
// This file is AUTO-GENERATED from .env files
// DO NOT EDIT MANUALLY
namespace Environment {
  const APP_NAME_SHORT = "MyAgent";
  const API_ENDPOINT = "https://localhost:3000";
  const API_KEY = "dev-key-here";
}
```

## Multi-Step Workflow Pattern

```typespec
const INSTRUCTIONS = """
When the user wants to update a resource:
1. First call getResource to verify it exists
2. Show the user the current values
3. Ask for confirmation before updating
4. Call updateResource with the new values
5. Call getResource again to show the updated resource
6. Confirm the update was successful
""";
```

## Error Response Pattern

```typespec
@doc("Standard error response")
model Error {
  @doc("Error code")
  code: string;
  
  @doc("Human-readable error message")
  message: string;
  
  @doc("Additional error details")
  details?: Record<string>;
}
```

## Pagination Pattern

```typespec
@doc("Paginated list of resources")
model ResourceList {
  @doc("Resources in this page")
  items: ResourceInfo[];
  
  @doc("Total number of resources")
  totalCount: int32;
  
  @doc("Token for next page")
  nextPageToken?: string;
}

@get
@route("/resources")
op listResources(
  @query pageSize?: int32 = 10,
  @query pageToken?: string
): ResourceList | Error;
```

## Conditional Operations Pattern

```typespec
// Different operations for different scenarios
namespace ResourceAPI {
  @doc("Get resource by ID")
  @get
  @route("/resources/{id}")
  op getResource(@path id: string): ResourceInfo | Error;
  
  @doc("Search resources by name")
  @get
  @route("/resources/search")
  op searchResources(@query name: string): ResourceInfo[] | Error;
  
  @doc("List all resources")
  @get
  @route("/resources")
  op listResources(): ResourceInfo[] | Error;
}

// Instructions guide when to use each
const INSTRUCTIONS = """
Use the appropriate operation:
- If user provides an ID: call getResource
- If user provides a name: call searchResources
- If user asks to "show all": call listResources
""";
```

## Optional Parameters with Defaults

```typespec
@get
@route("/resources")
op getResources(
  @query status?: ResourceStatus = ResourceStatus.Active,
  @query limit?: int32 = 50,
  @query sortBy?: "name" | "date" = "name"
): ResourceInfo[] | Error;
```

## Nested Models Pattern

```typespec
model ResourceInfo {
  id: string;
  name: string;
  owner: UserInfo;
  metadata: ResourceMetadata;
}

model UserInfo {
  id: string;
  name: string;
  email: string;
}

model ResourceMetadata {
  createdAt: datetime;
  updatedAt: datetime;
  tags: string[];
}
```

## Union Types for Flexible Responses

```typespec
model SuccessResponse {
  success: true;
  data: ResourceInfo;
}

model ErrorResponse {
  success: false;
  error: string;
}

@get
op getResource(@path id: string): SuccessResponse | ErrorResponse;
```

## Documentation Comments Pattern

```typespec
@doc("""
Retrieves a resource by its unique identifier.

This operation:
- Returns the full resource details
- Includes owner information
- Respects user permissions

Error scenarios:
- 404: Resource not found
- 403: User lacks permission
- 500: Server error

Example:
  getResource("ABC123") -> ResourceInfo
""")
@get
@route("/resources/{id}")
op getResource(@path id: string): ResourceInfo | Error;
```

---

**See Also**:
- `atk://agent-decorators` - Decorator reference
- `atk://capabilities-reference` - Capability patterns
- `atk://troubleshooting` - Common issues
