# Review Capability Scoping

⚠️ CRITICAL: Verify that scoping is in capability definitions, NOT instructions!

## What to Check

### ❌ WRONG - Scoping in Instructions
```typespec
op webSearch is AgentCapabilities.WebSearch;

const INSTRUCTIONS = """
Only search microsoft.com  ← THIS DOESN'T WORK!
""";
```

### ✅ CORRECT - Scoping in Definition
```typespec
op webSearch is AgentCapabilities.WebSearch<Sites = [
  { url: "https://microsoft.com" }
]>;

const INSTRUCTIONS = """
When searching, cite your sources.  ← Behavior, not scoping
""";
```

## Review Checklist

For each capability, verify:

- [ ] Scoping parameters in capability definition (if scopable)
- [ ] Instructions focus on BEHAVIOR, not scoping
- [ ] No "only search X" or "don't access Y" in instructions
- [ ] Scoping syntax is correct for the capability type

## Common Mistakes

1. **Trying to scope via instructions**
2. **Using wrong scoping parameter name**
3. **Forgetting generic parameter syntax** `<Sites = [...]>`
4. **Scoping non-scopable capabilities** (People, GraphicArt, etc.)

## Output

Report any scoping issues found and provide corrected code.
