# Review TypeSpec Style

Check TypeSpec code against naming conventions, formatting, and documentation standards.

## Naming Conventions

### ✅ Correct
- Namespaces: `PascalCase` (PolicyAgent, PoliciesAPI)
- Models: `PascalCase` (PolicyInfo, UserInfo)
- Operations: `camelCase` (getPolicies, updateResource)
- Parameters: `camelCase` (id, includeArchived)
- Enums: `PascalCase` members (PolicyType.Compliance)

### ❌ Wrong
- `policy_agent`, `POLICY_AGENT` (use PascalCase)
- `GetPolicies` (use camelCase for operations)
- `policy-info` (use PascalCase for models)

## Formatting

- [ ] Consistent indentation (2 or 4 spaces)
- [ ] Decorators on separate lines
- [ ] Grouped imports at top
- [ ] Newline at end of file
- [ ] Logical section separation

## Documentation

- [ ] `@doc` on all public operations
- [ ] `@doc` on all model properties
- [ ] `@doc` on namespaces
- [ ] Parameter constraints documented
- [ ] Error scenarios explained

## Example Review

```typespec
// ❌ WRONG
namespace policy_api {
  @get op GetPolicy(@path ID: string): policy_info;
  model policy_info {id:string;name:string;}
}

// ✅ CORRECT
@doc("API for retrieving company policies")
namespace PolicyAPI {
  @doc("Retrieves a policy by its unique identifier")
  @get
  @route("/policies/{id}")
  op getPolicy(
    @doc("The unique identifier of the policy")
    @path id: string
  ): PolicyInfo;

  @doc("Represents a company policy")
  model PolicyInfo {
    @doc("Unique identifier")
    id: string;

    @doc("Policy name")
    name: string;
  }
}
```

## Output

List style issues with corrections.
