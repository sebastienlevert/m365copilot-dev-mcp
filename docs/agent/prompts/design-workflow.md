# Design Multi-Step Workflow

Guide designing multi-step workflows for agents.

## Workflow Pattern

```typespec
const INSTRUCTIONS = """
When user wants to [goal]:
1. First, call [action1] to get [data]
2. If [condition], call [action2] with [params]
3. Present results showing [format]
4. Ask user if they want [next step]
""";
```

## Best Practices

### Clear Steps
- Number each step
- Explain what happens at each step
- Show data flow between steps

### Conditionals
- Explain branching logic
- Handle success and failure paths
- Provide fallbacks

### User Experience
- Keep users informed of progress
- Ask for confirmation before irreversible actions
- Explain why each step is needed

## Example: Update Workflow

```
When user wants to update a resource:
1. Call getResource to verify it exists
2. Show current values to user
3. Ask for confirmation
4. Call updateResource with new values
5. Call getResource again to show result
6. Confirm success to user
```

## Output

Provide workflow design with:
- Numbered steps
- Conditional logic
- Error handling
- User communication points
