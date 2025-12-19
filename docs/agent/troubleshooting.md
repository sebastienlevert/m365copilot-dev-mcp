# Agent Troubleshooting Guide

Common issues and solutions for M365 declarative agent development.

## Compilation Issues

### TypeSpec Compilation Fails

**Symptoms:**
- `npm run compile` fails with errors
- Build process stops

**Common Causes & Solutions:**

1. **Syntax Errors**
   - Check for missing semicolons, braces, or quotes
   - Verify decorator syntax: `@decorator(param)`
   - Ensure proper namespace structure

2. **Missing Imports**
   ```typespec
   // Add at top of file
   import "@typespec/http";
   import "@microsoft/typespec-m365-copilot";
   using TypeSpec.Http;
   ```

3. **Type Mismatches**
   - Ensure parameter types match operation signatures
   - Check model property types
   - Verify enum values are strings

4. **Invalid Decorator Parameters**
   - Check decorator parameter names and types
   - Verify required vs. optional parameters
   - Ensure string values are quoted

**Resolution Steps:**
1. Read the error message carefully (includes line numbers)
2. Check the specified line and surrounding context
3. Verify syntax against documentation
4. Run `npm run compile` again to confirm fix

---

## Agent Not Appearing in Copilot

**Symptoms:**
- Provision succeeds but agent doesn't show up
- Can't find agent in M365 Copilot

**Common Causes & Solutions:**

1. **Provisioning Not Complete**
   - Wait 5-10 minutes after provisioning
   - Check provision output for errors
   - Verify titleId was generated

2. **Browser Cache**
   - Clear browser cache
   - Log out and log back in to M365
   - Try incognito/private browsing mode

3. **Incorrect Environment**
   - Verify you're logged into the correct tenant
   - Check that the agent was provisioned to this environment
   - Confirm environment in `.env.{env}` file

4. **Manifest Issues**
   - Run `atk validate --env local`
   - Check for validation errors
   - Verify manifest.json was generated

**Resolution Steps:**
1. Check provision output for titleId
2. Clear browser cache and re-login
3. Wait 10 minutes and try again
4. Re-run provision if needed

---

## Agent Calls Wrong Action

**Symptoms:**
- Agent uses the wrong API operation
- Agent doesn't call expected actions
- Agent ignores available operations

**Common Causes & Solutions:**

1. **Weak Instructions**
   ```typespec
   // ❌ WEAK
   const INSTRUCTIONS = "Help users find policies";
   
   // ✅ STRONG
   const INSTRUCTIONS = """
   When user asks for policies:
   1. ALWAYS call getPolicies action
   2. NEVER make up policy information
   3. If policy ID provided, call getPolicy with that ID
   """;
   ```

2. **Poor descriptionForModel**
   ```typespec
   // ❌ WEAK
   @actions({
     name: "API",
     description: "Gets data",
     descriptionForModel: "API operations"
   })
   
   // ✅ STRONG
   @actions({
     name: "Policies API",
     description: "Retrieves company policies",
     descriptionForModel: "Use this API when user asks about policies, compliance, or regulations. Call getPolicies to list all policies or getPolicy with an ID for specific policy details."
   })
   ```

3. **Missing Examples in Instructions**
   - Add concrete examples showing:
     - User input
     - Which action to call
     - Expected response format

4. **Ambiguous Operation Names**
   - Use descriptive names: `getPolicies` not `getData`
   - Add doc comments explaining when to use each operation

**Resolution Steps:**
1. Strengthen instructions with explicit rules
2. Improve descriptionForModel text
3. Add examples in instructions
4. Test with various phrasings

---

## CodeInterpreter Doesn't Visualize

**Symptoms:**
- Data returned but no chart shown
- Visualization fails
- Python code errors

**Common Causes & Solutions:**

1. **Capability Not Enabled**
   ```typespec
   // Add this to your agent namespace
   op codeInterpreter is AgentCapabilities.CodeInterpreter;
   ```

2. **Weak Visualization Instructions**
   ```typespec
   // ❌ WEAK
   const INSTRUCTIONS = "Show charts when needed";
   
   // ✅ STRONG
   const INSTRUCTIONS = """
   When displaying trend data:
   1. Use CodeInterpreter to create a line chart
   2. X-axis: dates in MMM DD format
   3. Y-axis: values starting at 0
   4. Add title: "Trend - Last 30 Days"
   5. Use blue color (#0078D4)
   """;
   ```

3. **Incompatible Data Format**
   - Ensure API returns structured data (arrays, objects)
   - Avoid returning raw text or HTML
   - Use consistent date formats (ISO 8601)

4. **No Explicit Request**
   - Sometimes you need to explicitly ask for visualization in instructions
   - Guide when to visualize vs. when to show tables

**Resolution Steps:**
1. Verify CodeInterpreter capability is enabled
2. Add explicit visualization instructions
3. Test with sample data
4. Check data format from APIs

---

## Scoping Not Working

**Symptoms:**
- Agent accesses content outside intended scope
- Scoping parameters seem ignored

**CRITICAL ISSUE:**
❌ **WRONG**: Scoping in instructions
```typespec
op webSearch is AgentCapabilities.WebSearch;
const INSTRUCTIONS = "Only search microsoft.com";  // This doesn't work!
```

✅ **CORRECT**: Scoping in capability definition
```typespec
op webSearch is AgentCapabilities.WebSearch<Sites = [
  { url: "https://microsoft.com" }
]>;
```

**See**: `atk://capability-scoping-examples` for detailed examples

---

## Provision Hangs or Times Out

**Symptoms:**
- `atk provision` runs for a long time
- Command appears stuck
- No progress updates

**Common Causes & Solutions:**

1. **Network Issues**
   - Check internet connection
   - Verify VPN isn't blocking Microsoft services
   - Try different network

2. **Authentication Expired**
   - Run `atk login` again
   - Clear cached credentials
   - Verify correct tenant

3. **Service Issues**
   - Check Microsoft 365 service health
   - Try again later
   - Check Azure service status

4. **Large Project**
   - Some projects take longer (5-10 minutes normal)
   - Check for progress indicators in output
   - Don't interrupt - may leave incomplete state

**Resolution Steps:**
1. Wait at least 10 minutes before canceling
2. Check network and service status
3. Re-authenticate with `atk login`
4. Retry provision

---

## Action Returns Errors

**Symptoms:**
- API calls fail
- 404, 403, 500 errors
- Authentication errors

**Common Causes & Solutions:**

1. **Wrong Endpoint**
   - Verify `{API_ENDPOINT}` in env file
   - Check API is running and accessible
   - Test endpoint with curl/Postman

2. **Authentication Issues**
   - Verify API_KEY or auth tokens
   - Check API authentication requirements
   - Ensure credentials are in env file

3. **Parameter Issues**
   - Check parameter types match API expectations
   - Verify required parameters are provided
   - Check for typos in parameter names

4. **CORS Issues** (for browser-based APIs)
   - Verify CORS headers on API
   - Check allowed origins
   - May need API configuration changes

**Resolution Steps:**
1. Test API endpoint independently
2. Verify credentials and authentication
3. Check API logs for error details
4. Review operation parameter definitions

---

## Environment Variables Not Working

**Symptoms:**
- `{VAR_NAME}` appears in manifest
- Environment values not substituted
- Build succeeds but values wrong

**Common Causes & Solutions:**

1. **Forgot to Regenerate env.tsp**
   ```bash
   # MUST run after changing .env files
   npm run generate:env
   ```

2. **Wrong Environment File**
   - Check you modified correct file: `.env.local`, `.env.dev`, etc.
   - Verify file exists in `env/` directory
   - Check file naming convention

3. **Syntax Errors in .env File**
   ```bash
   # ✅ CORRECT
   API_ENDPOINT=https://api.example.com
   
   # ❌ WRONG (no quotes in .env files)
   API_ENDPOINT="https://api.example.com"
   ```

4. **Not Using Environment Constants**
   ```typespec
   // ❌ WRONG
   @server("https://hardcoded.com", "API")
   
   // ✅ CORRECT
   @server("{API_ENDPOINT}", "API")
   ```

**Resolution Steps:**
1. Update `.env.{environment}` file
2. Run `npm run generate:env`
3. Verify `env.tsp` was updated
4. Rebuild and reprovision

---

## Instructions Too Long

**Symptoms:**
- Compilation fails with "instructions too long"
- Limit exceeded error

**Solution:**
- Maximum: 8,000 characters
- Keep instructions focused and concise
- Remove redundant examples
- Split into clear sections: GUIDELINES, EXAMPLES, SUGGESTIONS
- Focus on essential behavior, not every edge case

---

## Conversation Starters Not Showing

**Symptoms:**
- Conversation starters don't appear in UI
- User can't see suggested prompts

**Common Causes & Solutions:**

1. **Too Many Starters**
   - Maximum: 12 conversation starters
   - Remove extras

2. **Syntax Errors**
   ```typespec
   // ✅ CORRECT
   @conversationStarter(#{ title: "Find Policy", text: "Show all policies" })
   
   // ❌ WRONG (missing # before {)
   @conversationStarter({ title: "Find Policy", text: "Show all policies" })
   ```

3. **Missing Required Fields**
   - `text` is required
   - `title` is optional
   - Both must be non-empty strings

**Resolution Steps:**
1. Check decorator syntax
2. Verify character limits
3. Count total starters (<= 12)
4. Recompile and reprovision

---

## Quick Diagnostic Checklist

When something goes wrong, check in this order:

1. [ ] TypeSpec compiles without errors (`npm run compile`)
2. [ ] Validation passes (`atk validate --env local`)
3. [ ] Provisioning completed successfully
4. [ ] Waited 5-10 minutes after provision
5. [ ] Logged into correct M365 tenant
6. [ ] Browser cache cleared
7. [ ] Instructions follow best practices
8. [ ] Capabilities properly scoped in definitions
9. [ ] Environment variables regenerated
10. [ ] API endpoints accessible and authenticated

---

**See Also**:
- `atk://capabilities-reference` - Capability issues
- `atk://capability-scoping-examples` - Scoping problems
- `atk://typespec-patterns` - Code patterns
- `atk://security-checklist` - Security issues
