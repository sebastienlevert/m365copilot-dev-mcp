# Agent Development Guide for @microsoft/m365copilot-dev-mcp

This document provides guidance for AI agents and developers working on the @microsoft/m365copilot-dev-mcp MCP server. Follow these patterns and practices to maintain code quality, ensure thorough testing, and enable efficient development.

## Project Vision

This MCP server is designed to be a comprehensive toolkit for **Microsoft 365 Copilot development**, not limited to just the Agents Toolkit (ATK). While ATK tools are the initial focus, the architecture supports adding additional M365 Copilot development capabilities, such as:
- Copilot Studio integrations
- Plugin/extension management tools
- Testing and debugging utilities
- Documentation and learning resources
- Community tools and integrations

## Technology Stack

### Core Technologies

**MCP (Model Context Protocol) SDK**
- Package: `@modelcontextprotocol/sdk@^1.25.1`
- Transport: StdioServerTransport (stdin/stdout)
- Purpose: Provides server framework and request handling
- Key imports: `Server`, `StdioServerTransport`, request schemas

**Microsoft 365 Agents Toolkit CLI**
- Package: `@microsoft/m365agentstoolkit-cli@^1.1.3`
- Execution: Via npx with proper package specification
- Purpose: Backend CLI for agent operations
- Command pattern: `npx --yes -p @microsoft/m365agentstoolkit-cli atk <subcommand>`

**TypeScript**
- Version: 5.3+
- Target: ES2022
- Module: Node16 (ESM)
- Strict mode: Enabled
- Purpose: Type safety and modern JavaScript features

**Zod**
- Package: `zod@^3.23.8`
- Purpose: Runtime type validation and schema definition
- Usage: All tool input schemas use Zod for validation

**Node.js**
- Minimum version: 18.0.0
- Module system: ES Modules (type: "module")
- Purpose: Runtime environment

## Project Architecture

### Directory Structure

```
src/
├── index.ts              # Entry point (shebang, minimal logic)
├── server.ts             # MCP server setup and request handlers
├── tools/                # MCP tool implementations
│   ├── index.ts         # Tool registry and dispatcher
│   ├── doctor.ts        # System diagnostics tool
│   ├── new.ts           # Project creation tool
│   ├── provision.ts     # Resource provisioning tool
│   ├── deploy.ts        # Code deployment tool
│   ├── package.ts       # Package building tool
│   ├── publish.ts       # Publishing tool
│   └── validate.ts      # Validation tool
├── prompts/              # MCP prompt implementations
│   ├── index.ts         # Prompt registry
│   ├── workflows.ts     # Workflow prompts
│   └── best-practices.ts # Best practice prompts
├── resources/            # MCP resource implementations
│   ├── index.ts         # Resource registry
│   ├── documentation.ts # Documentation resources
│   └── examples.ts      # Example resources
├── utils/                # Shared utilities
│   ├── cli-executor.ts  # CLI command execution (CRITICAL)
│   ├── logger.ts        # Logging utility
│   └── error-handler.ts # Error parsing and formatting
└── types/                # Type definitions
    └── atk.ts           # ATK-specific types

tests/                    # Test files (mirror src/ structure)
├── tools/
├── prompts/
├── resources/
└── utils/

docs/                     # Documentation files
├── ATK_COMMANDS.md
├── WORKFLOWS.md
└── TROUBLESHOOTING.md
```

### Architectural Patterns

**1. Registry Pattern**
- Tools, prompts, and resources use centralized registries
- Registries map names to implementations
- Enables easy addition of new capabilities
- Example: `src/tools/index.ts` exports `listTools()` and `callTool()`

**2. Schema-First Design**
- All tool inputs use Zod schemas for validation
- Schemas serve as documentation and runtime validators
- Type inference from schemas ensures type safety
- Pattern: Define schema → infer type → implement executor

**3. Structured Error Handling**
- All errors parsed into structured format
- Include: error type, reason, suggestion, documentation link, details
- Provides actionable feedback to LLM and users
- Pattern: Parse CLI output → identify error type → return structured response

**4. Separation of Concerns**
- CLI execution isolated in `cli-executor.ts`
- Error handling centralized in `error-handler.ts`
- Tool logic separate from MCP protocol handling
- Clear boundaries between layers

## Critical Implementation Rules

### Rule 1: NEVER Write to stdout in Stdio Transport

**Why:** The stdio transport uses stdout for MCP protocol messages. Any stray output corrupts communication.

**How:**
- Use `console.error()` for all logging
- Logger utility in `src/utils/logger.ts` uses stderr only
- Never use `console.log()`, `process.stdout.write()`, or `print()`
- Test: Run server and verify no non-protocol output to stdout

```typescript
// ✅ CORRECT
import { info, error } from './utils/logger.js';
info('Processing request');

// ❌ WRONG
console.log('Processing request');
```

### Rule 2: Always Use Proper ATK CLI Command Format

**Why:** The ATK CLI requires specific npx invocation to work correctly.

**Format:**
```bash
npx --yes -p @microsoft/m365agentstoolkit-cli atk <subcommand> [args]
```

**Implemented in:** `src/utils/cli-executor.ts` → `buildCommand()`

**Never:**
- Use `atk` directly (may not be in PATH)
- Use `npx @microsoft/m365agentstoolkit-cli` without specifying binary
- Forget `--yes` flag (causes interactive prompts)
- Forget `-p` flag (incorrect package resolution)

### Rule 3: Non-Interactive Mode Required

**Why:** MCP servers cannot handle interactive CLI prompts.

**How:**
- Always pass `--interactive false` or `-i false` to ATK commands
- Require all parameters explicitly in tool schemas
- Validate parameters before CLI execution
- Return clear error if required parameters missing

```typescript
// ✅ CORRECT
const cmdArgs = ['new', '--interactive', 'false', '--app-name', name, '--capability', template];

// ❌ WRONG
const cmdArgs = ['new']; // Will hang waiting for interactive input
```

### Rule 4: Focus on Declarative Agents and TypeSpec

**Why:** Project direction prioritizes TypeSpec-based declarative agents.

**What This Means:**
- Only support `declarative-agent` template
- Only support `typescript` language
- Emphasize TypeSpec in all descriptions
- Focus documentation on declarative agent patterns
- Highlight type safety and IDE support benefits

**Forbidden:**
- Adding support for custom engine agents
- Adding weather-agent, api-plugin, or other templates
- Supporting JavaScript or C# languages
- Downplaying TypeSpec benefits

## Development Workflow

### Standard Development Cycle

**1. Make Changes**
```bash
# Edit source files in src/
vim src/tools/new-feature.ts
```

**2. Build Immediately**
```bash
npm run build
```

**Why:** Catch TypeScript errors early. Don't wait until you're "done" to build.

**3. Link for Testing**
```bash
npm link
```

**Why:** Makes the latest build available to MCP clients for immediate testing.

**4. Test from MCP Client**
- Restart MCP client (e.g., Claude Desktop)
- Test new functionality through client
- Verify tool appears, executes correctly, returns expected output
- Check error handling paths

**5. Iterate**
- Fix any issues found
- Rebuild: `npm run build`
- Test again (client may need restart)
- Repeat until feature works correctly

### Continuous Testing Pattern

**DO THIS:**
```bash
# Terminal 1: Watch mode during development
npm run dev  # Runs tsc --watch

# Terminal 2: Link and test
npm link
# Test from MCP client
# Make changes
# Build automatically compiles
# Test again from MCP client
```

**Build and Test Frequency:**
- Build after EVERY change before testing
- Link after EVERY build before MCP client testing
- Test EVERY code path (success and error cases)
- Test from actual MCP client, not just unit tests

### Pre-Commit Checklist

Before committing any changes:

- [ ] All TypeScript files compile without errors
- [ ] `npm run build` succeeds
- [ ] No console.log() statements (only console.error())
- [ ] New tool/prompt/resource added to registry
- [ ] Tool schema uses Zod validation
- [ ] Error handling returns structured errors
- [ ] Rich descriptions added for LLM guidance
- [ ] Tested from actual MCP client
- [ ] Documentation updated if needed
- [ ] Examples updated if behavior changed

## Testing Requirements

### Test Coverage Requirements

**EVERY new capability MUST have tests for:**

1. **Success Path**
   - Valid inputs produce expected outputs
   - CLI execution succeeds
   - Result format matches schema
   - Response includes helpful next steps

2. **Validation Errors**
   - Missing required parameters
   - Invalid parameter types
   - Invalid parameter values
   - Schema validation catches errors before execution

3. **CLI Errors**
   - Command not found
   - Authentication failures
   - Permission denied
   - Resource conflicts
   - Network errors
   - Timeout scenarios

4. **Edge Cases**
   - Empty strings
   - Special characters in paths
   - Very long inputs
   - Concurrent requests
   - Resource exhaustion

### Test Structure

**Location:** Mirror `src/` structure in `tests/`

```
tests/
├── tools/
│   ├── doctor.test.ts
│   ├── new.test.ts
│   └── ...
├── utils/
│   ├── cli-executor.test.ts
│   └── error-handler.test.ts
└── integration/
    └── full-workflow.test.ts
```

### Test Implementation Pattern

```typescript
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { executeNewTool, NewProjectSchema } from '../src/tools/new.js';

describe('atk_new tool', () => {
  describe('success cases', () => {
    it('should create declarative agent with valid inputs', async () => {
      const args = {
        name: 'test-agent',
        template: 'declarative-agent',
        language: 'typescript',
        directory: './test-output'
      };

      const result = await executeNewTool(args);

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Successfully created');
    });
  });

  describe('validation errors', () => {
    it('should reject invalid template', () => {
      const args = {
        name: 'test',
        template: 'invalid-template',
        language: 'typescript'
      };

      expect(() => NewProjectSchema.parse(args)).toThrow();
    });

    it('should reject missing name', () => {
      const args = {
        template: 'declarative-agent',
        language: 'typescript'
      };

      expect(() => NewProjectSchema.parse(args)).toThrow();
    });
  });

  describe('CLI errors', () => {
    it('should handle directory already exists', async () => {
      // Create directory first
      // Try to create project with same name
      // Verify error message is helpful
    });

    it('should handle permission denied', async () => {
      // Test with read-only directory
      // Verify structured error returned
    });
  });

  describe('cross-platform compatibility', () => {
    it('should work on Windows', async () => {
      // Test Windows-specific path handling
    });

    it('should work on Unix', async () => {
      // Test Unix-specific path handling
    });
  });
});
```

### Integration Testing

**Full Workflow Tests:**

```typescript
describe('complete agent lifecycle', () => {
  it('should create, validate, provision, deploy, package, and publish', async () => {
    // 1. Create project
    const createResult = await executeNewTool({
      name: 'integration-test-agent',
      template: 'declarative-agent',
      language: 'typescript'
    });
    expect(createResult.isError).toBe(false);

    // 2. Validate project
    const validateResult = await executeValidateTool({
      projectPath: './integration-test-agent'
    });
    expect(validateResult.isError).toBe(false);

    // 3. Test other stages...
    // Note: May require mocking Azure/M365 services
  });
});
```

### Manual Testing from MCP Client

**After building and linking:**

1. **Test Tool Discovery**
   - Client should list all 7 tools
   - Descriptions should be clear and helpful
   - Schemas should be correctly formatted

2. **Test Tool Execution**
   - Call each tool with valid inputs
   - Verify successful execution
   - Check output format and content

3. **Test Error Handling**
   - Call tools with invalid inputs
   - Verify validation errors are clear
   - Check that CLI errors are parsed correctly

4. **Test Prompts**
   - List all 6 prompts
   - Execute each prompt
   - Verify messages are helpful and well-formatted

5. **Test Resources**
   - List all 11 resources
   - Read each resource
   - Verify content is accurate and helpful

## Adding New Capabilities

### Adding a New Tool

**1. Create Tool File**
```bash
touch src/tools/new-feature.ts
```

**2. Define Schema**
```typescript
import { z } from 'zod';

export const NewFeatureSchema = z.object({
  requiredParam: z.string().describe('Description'),
  optionalParam: z.string().optional().describe('Description')
});

export type NewFeatureArgs = z.infer<typeof NewFeatureSchema>;
```

**3. Implement Executor**
```typescript
export async function executeNewFeature(args: NewFeatureArgs): Promise<ToolResult> {
  // Validate inputs
  // Execute CLI command
  // Handle errors
  // Return structured result
}
```

**4. Create Tool Definition**
```typescript
export const newFeatureToolDefinition = {
  name: 'atk_new_feature',
  description: `Rich description for LLM...

**Purpose:** ...
**When to Use:** ...
**Example Usage:** ...
**Prerequisites:** ...
**Common Issues:** ...
**Documentation:** atk://docs/...`,
  inputSchema: {
    type: 'object',
    properties: {
      requiredParam: {
        type: 'string',
        description: 'Description'
      }
    },
    required: ['requiredParam']
  }
};
```

**5. Register in Tools Index**
```typescript
// src/tools/index.ts
import { newFeatureToolDefinition, executeNewFeature, NewFeatureSchema } from './new-feature.js';

const toolRegistry: Map<string, ToolRegistryEntry> = new Map([
  // ... existing tools
  ['atk_new_feature', {
    definition: newFeatureToolDefinition,
    executor: executeNewFeature,
    schema: NewFeatureSchema
  }]
]);
```

**6. Build and Link**
```bash
npm run build
npm link
```

**7. Test from MCP Client**
- Verify tool appears in list
- Test with valid inputs
- Test with invalid inputs
- Verify error handling

**8. Write Tests**
```typescript
// tests/tools/new-feature.test.ts
describe('atk_new_feature tool', () => {
  it('should execute successfully with valid inputs', async () => {
    // Test implementation
  });

  it('should validate inputs correctly', () => {
    // Schema validation tests
  });

  it('should handle errors gracefully', async () => {
    // Error handling tests
  });
});
```

**9. Update Documentation**
- Add to `docs/ATK_COMMANDS.md`
- Add to `README.md` if user-facing
- Update `CHANGELOG.md`

### Adding a New Prompt

**1. Define Prompt in workflows.ts or best-practices.ts**
```typescript
export const newWorkflowPrompt: PromptDefinition = {
  name: 'new-workflow',
  description: 'Description of what this workflow does',
  arguments: [
    {
      name: 'param1',
      description: 'Description',
      required: true
    }
  ]
};
```

**2. Implement Prompt Generator**
```typescript
export function getNewWorkflowPrompt(args: Record<string, string>): PromptMessage[] {
  return [
    {
      role: 'user',
      content: {
        type: 'text',
        text: `User message based on ${args.param1}`
      }
    },
    {
      role: 'assistant',
      content: {
        type: 'text',
        text: `Detailed assistant response with workflow steps...`
      }
    }
  ];
}
```

**3. Register in Prompt Index**
```typescript
// src/prompts/index.ts - add to array
export const workflowPrompts = [
  // ... existing
  newWorkflowPrompt
];

// Add to switch statement
export function getWorkflowPrompt(name: string, args: Record<string, string>): PromptMessage[] | null {
  switch (name) {
    // ... existing cases
    case 'new-workflow':
      return getNewWorkflowPrompt(args);
    default:
      return null;
  }
}
```

**4. Build, Link, Test**
```bash
npm run build
npm link
# Test from MCP client
```

### Adding a New Resource

**1. Define Resource in documentation.ts or examples.ts**
```typescript
const newResource: ResourceDefinition = {
  uri: 'atk://docs/new-topic',
  name: 'New Topic Guide',
  description: 'Description of resource content',
  mimeType: 'text/markdown'
};
```

**2. Implement Content Generator**
```typescript
function getNewTopicContent(): string {
  return `# New Topic

Detailed markdown content...`;
}
```

**3. Register in Resource Getter**
```typescript
export function getDocumentationResource(uri: string): ResourceContent | null {
  switch (uri) {
    // ... existing cases
    case 'atk://docs/new-topic':
      return {
        uri,
        mimeType: 'text/markdown',
        text: getNewTopicContent()
      };
    default:
      return null;
  }
}
```

**4. Add to Resource List**
```typescript
export const documentationResources: ResourceDefinition[] = [
  // ... existing
  newResource
];
```

**5. Build, Link, Test**

## Performance Optimization

### CLI Execution Performance

**npx Caching:**
- First execution downloads ATK CLI (10-30 seconds)
- Subsequent executions use cached package (fast)
- Cache location: `~/.npm/_npx/`

**Timeout Configuration:**
- Set appropriate timeouts per command type
- Balance between allowing completion and preventing hangs
- Current values in `src/types/atk.ts` → `ATK_TIMEOUTS`

**Command Optimization:**
- Always use non-interactive mode (faster)
- Pass all parameters explicitly (no prompting)
- Use `--yes` flag to skip confirmations

### Memory Management

**Stream Large Outputs:**
- For commands with large output, stream to stderr during execution
- Don't buffer everything in memory
- Current implementation in `cli-executor.ts` collects output

**Resource Caching:**
- Documentation resources are statically defined (no external fetches)
- Could cache in memory for repeated access (future optimization)

### Concurrent Execution

**Current Limitation:**
- CLI executor runs commands serially
- Each command waits for completion

**Future Enhancement:**
- Could parallelize independent commands
- Requires careful stdout/stderr handling
- Would need request queue management

## Common Pitfalls and Solutions

### Pitfall 1: Forgetting to Build

**Problem:** Make changes, test from MCP client, changes not reflected

**Solution:**
- Always run `npm run build` after changes
- Use `npm run dev` for watch mode during development
- Link after every build: `npm link`

### Pitfall 2: Writing to stdout

**Problem:** Server stops responding or behaves erratically

**Solution:**
- Search codebase for `console.log`, `print`, `process.stdout.write`
- Replace with `console.error` or logger utility
- Verify with: `atk-mcp | grep -v '^{'` should show nothing

### Pitfall 3: Interactive CLI Commands

**Problem:** Command hangs indefinitely

**Solution:**
- Always pass `--interactive false`
- Validate all parameters before execution
- Test with actual CLI to verify non-interactive behavior

### Pitfall 4: Poor Error Messages

**Problem:** Users get cryptic errors without guidance

**Solution:**
- Parse CLI errors in `error-handler.ts`
- Return structured errors with suggestions
- Include documentation links
- Test error paths thoroughly

### Pitfall 5: Missing Tool in Registry

**Problem:** Tool defined but not accessible from MCP client

**Solution:**
- Verify tool added to `src/tools/index.ts` → `toolRegistry`
- Check tool name matches exactly
- Rebuild and link after changes
- Test with ListTools request

## Debugging Techniques

### Debugging CLI Execution

**Log Commands:**
```typescript
// In cli-executor.ts
info(`Executing ATK command: ${fullCommand}`, { cwd, timeout });
```

**Check stderr output:**
```bash
# Run server and capture stderr
atk-mcp 2> debug.log
# Review debug.log for detailed execution info
```

**Test CLI commands directly:**
```bash
# Test the exact command being executed
npx --yes -p @microsoft/m365agentstoolkit-cli atk doctor
```

### Debugging MCP Protocol

**Use MCP Inspector:**
```bash
# Install MCP inspector
npm install -g @modelcontextprotocol/inspector

# Run server through inspector
mcp-inspector atk-mcp
```

**Check Protocol Messages:**
- Inspector shows all requests/responses
- Verify request schemas match expectations
- Check response formats

### Debugging Tool Execution

**Add Temporary Debug Logging:**
```typescript
import { debug } from '../utils/logger.js';

export async function executeTool(args: ToolArgs): Promise<ToolResult> {
  debug('Tool called with args', args);

  const result = await executeATKCommand(...);
  debug('CLI result', { success: result.success, exitCode: result.exitCode });

  return formatResult(result);
}
```

**Test Tool Isolation:**
```typescript
// Create simple test script
import { executeTool } from './src/tools/tool.js';

const result = await executeTool({ param: 'value' });
console.error(JSON.stringify(result, null, 2));
```

## Quality Standards

### Code Quality

**TypeScript:**
- Use strict mode (enabled)
- No `any` types unless absolutely necessary
- Prefer explicit types over inference for public APIs
- Use type guards for runtime type checking

**Error Handling:**
- Every CLI execution must handle errors
- Every tool must return structured errors on failure
- Never throw unhandled exceptions
- Always provide actionable error messages

**Documentation:**
- Every tool must have rich description
- Every function must have JSDoc comment
- Complex logic must have inline comments
- Public APIs must be documented

**Consistency:**
- Follow existing patterns in codebase
- Use same naming conventions
- Maintain consistent file structure
- Keep similar code collocated

### Testing Standards

**Coverage Requirements:**
- Every tool: 4+ test cases minimum
- Every utility function: 3+ test cases minimum
- Integration tests for critical workflows
- Manual testing from MCP client required

**Test Quality:**
- Tests must be deterministic
- Use meaningful test names
- Include assertions for all important properties
- Test both happy and sad paths

## Build and Release Process

### Pre-Release Checklist

- [ ] All tests passing
- [ ] Build succeeds without warnings
- [ ] Manual testing from MCP client completed
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Version bumped in package.json
- [ ] No debug logging left in code
- [ ] No TODO comments without issues filed

### Build Process

```bash
# Clean build
npm run clean
npm install
npm run build

# Verify build
ls -la build/
node build/index.js --help  # Should not error

# Test installation
npm pack
npm install -g ./microsoft-atk-mcp-0.1.0.tgz
atk-mcp --version
```

### Release Process

```bash
# Build and test
npm run build
npm test  # When tests are added

# Tag release
git tag v0.1.0
git push origin v0.1.0

# Publish to npm (if public)
npm publish

# Or publish to private registry
npm publish --registry https://your-registry.com
```

## Best Practices Summary

### DO

✅ Build after every change
✅ Link after every build
✅ Test from actual MCP client
✅ Write tests for new features
✅ Use structured error handling
✅ Log to stderr only
✅ Use non-interactive CLI mode
✅ Validate inputs with Zod
✅ Provide rich tool descriptions
✅ Focus on declarative agents and TypeSpec
✅ Include documentation links in responses
✅ Handle cross-platform differences
✅ Set appropriate timeouts
✅ Register new tools/prompts/resources

### DON'T

❌ Write to stdout
❌ Use interactive CLI commands
❌ Skip validation
❌ Return raw error strings
❌ Forget to build before testing
❌ Add features without tests
❌ Use `any` type unnecessarily
❌ Hardcode paths without normalization
❌ Assume platform-specific behavior
❌ Leave debug code in commits
❌ Support non-declarative agent templates
❌ Add non-TypeScript language support
❌ Skip documentation updates

## Continuous Improvement

### When Adding Features

1. **Plan First:** Design before implementing
2. **Test-Driven:** Write tests alongside implementation
3. **Build Often:** Catch errors early
4. **Document:** Update docs as you go
5. **Review:** Check quality before committing

### When Fixing Bugs

1. **Reproduce:** Verify bug exists
2. **Write Test:** Add failing test
3. **Fix:** Implement solution
4. **Verify:** Test passes, bug fixed
5. **Regression Test:** Ensure no new bugs

### When Refactoring

1. **Tests First:** Ensure good coverage
2. **Small Steps:** Incremental changes
3. **Build Frequently:** Catch breaks immediately
4. **Test After Each Step:** Verify behavior unchanged
5. **Document:** Update any affected docs

## Tools for Development

### Required Tools

- **Node.js** 18+ with npm
- **TypeScript** compiler (installed via npm)
- **Git** for version control
- **MCP Client** (Claude Desktop or other) for testing

### Recommended Tools

- **VSCode** with TypeScript extension
- **MCP Inspector** for protocol debugging
- **npx** for running ATK CLI
- **Jest** for testing (to be added)

### Useful Commands

```bash
# Development
npm run dev          # Watch mode
npm run build        # Build once
npm run clean        # Remove build artifacts
npm link             # Link for local testing
npm unlink           # Unlink when done

# Testing
npm test             # Run tests (to be added)
npm run test:watch   # Watch mode (to be added)
npm run coverage     # Coverage report (to be added)

# Debugging
npx --yes -p @microsoft/m365agentstoolkit-cli atk --version  # Test CLI
mcp-inspector atk-mcp  # Debug MCP protocol

# Quality
npm run lint         # Lint code (to be added)
npm audit            # Check dependencies
```

## Getting Help

### Internal Resources
- `README.md` - User documentation
- `docs/` - Command reference and guides
- `src/` - Implementation (read the code!)
- This file - Development guide

### External Resources
- [MCP Documentation](https://modelcontextprotocol.io/)
- [ATK Documentation](https://learn.microsoft.com/en-us/microsoftteams/platform/toolkit/microsoft-365-agents-toolkit-cli)
- [TypeSpec Documentation](https://typespec.io/)
- [Zod Documentation](https://zod.dev/)

### When Stuck

1. Read error messages carefully
2. Check implementation of similar features
3. Test CLI command directly
4. Use MCP inspector to debug protocol
5. Add debug logging temporarily
6. Simplify to isolate issue
7. Search issues/documentation

---

**Remember:** Quality over speed. Build and test continuously. Every feature must work reliably. The MCP server is a critical tool for developers building Microsoft 365 agents - make it excellent.
