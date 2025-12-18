# Troubleshooting Guide

Solutions for common issues when using @microsoft/m365copilot-dev-mcp.

## Installation Issues

### MCP Server Not Found

**Symptom:** MCP client can't find m365copilot-dev-mcp command

**Solution:**
```bash
# Verify installation
npm list -g @microsoft/m365copilot-dev-mcp

# Reinstall if needed
npm install -g @microsoft/m365copilot-dev-mcp

# Check npm global bin path
npm config get prefix
```

### ATK CLI Not Available

**Symptom:** "ATK CLI not found" errors when using tools

**Solution:**
```bash
# Install ATK CLI
npm install -g @microsoft/m365agentstoolkit-cli

# Verify installation
atk --version

# Run doctor check
atk doctor
```

## Tool Execution Issues

### Authentication Errors

**Symptom:** "Not logged in" or "Authentication failed"

**Solution:**
```bash
# Login to Azure
az login

# Verify login
az account show

# Set subscription
az account set --subscription <subscription-id>
```

### Permission Denied

**Symptom:** "Insufficient permissions" or "Unauthorized"

**Solution:**
- Verify Azure role (need Contributor or Owner)
- Check M365 admin permissions
- Review resource group access
- Contact admin for permissions

### Resource Already Exists

**Symptom:** "Conflict" or "Resource already exists"

**Solution:**
- Use different resource names
- Delete existing resources in Azure Portal
- Check for naming conflicts
- Verify resource group

### Timeout Errors

**Symptom:** "Operation timed out" or "Command timeout"

**Solution:**
- Check internet connection
- Verify Azure region accessibility
- Retry operation
- Use different Azure region if persistent

## Project Issues

### Project Not Found

**Symptom:** "Project directory does not exist"

**Solution:**
```bash
# Verify path is correct
ls -la /path/to/project

# Use absolute paths
{
  "projectPath": "/absolute/path/to/project"
}

# Check current directory
pwd
```

### Manifest Validation Failed

**Symptom:** "Invalid manifest" or validation errors

**Solution:**
- Check all required fields present
- Verify version format (1.0.0)
- Validate icon sizes (192x192, 32x32)
- Ensure URLs use HTTPS
- Use atk_validate for detailed errors

### Environment Not Provisioned

**Symptom:** ".env file not found" or "Environment not provisioned"

**Solution:**
```bash
# Provision environment first
Use: atk_provision
{
  "projectPath": "./my-agent",
  "environment": "dev"
}

# Then deploy
Use: atk_deploy
{
  "projectPath": "./my-agent",
  "environment": "dev"
}
```

## Build & Deploy Issues

### Build Errors

**Symptom:** "Build failed" or compilation errors

**Solution:**
```bash
# In project directory
npm install
npm run build

# Clear cache and rebuild
rm -rf node_modules build
npm install
npm run build
```

### Deployment Failed

**Symptom:** Deploy command fails

**Solution:**
1. Check environment is provisioned
2. Verify .env file exists
3. Check Azure CLI authentication
4. Review build output for errors
5. Check Azure Portal for resource status

### Package Creation Failed

**Symptom:** "Package failed" or validation errors

**Solution:**
- Verify manifest.json is valid
- Check icon files exist and correct size
- Validate all required resources present
- Run atk_validate first

## MCP Client Issues

### Tools Not Appearing

**Symptom:** MCP client doesn't show ATK tools

**Solution:**
```json
// Verify MCP client configuration
{
  "mcpServers": {
    "atk": {
      "command": "atk-mcp"
    }
  }
}

// Check server is running
// Review server logs for errors
```

### Prompts Not Working

**Symptom:** Prompts don't execute or return errors

**Solution:**
- Verify prompt name is correct
- Check required arguments provided
- Review prompt documentation
- Use ListPrompts to see available prompts

### Resources Not Loading

**Symptom:** Can't access atk:// resources

**Solution:**
- Verify URI is correct
- Check resource exists (use ListResources)
- Review server logs
- Restart MCP client

## Platform-Specific Issues

### Windows

**Issue:** Command not found on Windows

**Solution:**
- Run PowerShell as Administrator
- Add npm global bin to PATH
- Use full path: `C:\Users\<user>\AppData\Roaming\npm\atk-mcp.cmd`

### macOS/Linux

**Issue:** Permission errors

**Solution:**
```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules

# Or use nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
```

## Diagnostic Commands

### Check System Prerequisites
```
Use: atk_doctor
{
  "verbose": true
}
```

### Validate Project
```
Use: atk_validate
{
  "projectPath": "./my-agent"
}
```

### Get Tool Help
```
// Check tool definitions in MCP client
// Review tool descriptions and schemas
// Verify argument requirements
```

## Getting Help

### Use Troubleshooting Prompt
```
Use prompt: troubleshoot-deployment
{
  "projectPath": "./my-agent",
  "errorMessage": "error details"
}
```

### Check Resources
- `atk://troubleshooting/common-issues`
- `atk://troubleshooting/installation`
- `atk://docs/commands`

### External Resources
- [Official Documentation](https://learn.microsoft.com/en-us/microsoftteams/platform/toolkit/)
- [GitHub Issues](https://github.com/OfficeDev/microsoft-365-agents-toolkit/issues)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/microsoft-365-agents-toolkit)

## Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| "Command not found" | ATK CLI not installed | npm install -g @microsoft/m365agentstoolkit-cli |
| "Not logged in" | Azure not authenticated | az login |
| "Subscription not found" | Wrong subscription | az account set --subscription <id> |
| "Permission denied" | Insufficient permissions | Request admin permissions |
| "Resource exists" | Name conflict | Use different name or delete resource |
| "Validation failed" | Invalid manifest | Fix manifest errors, run atk_validate |
| "Build failed" | Compilation errors | Check code, npm install, rebuild |
| "Timeout" | Network/performance issue | Retry, check connection |

## Debug Tips

1. **Enable Verbose Logging**
   - Use verbose flag in tools
   - Check MCP server logs
   - Review Azure Portal logs

2. **Verify Each Step**
   - Run atk_doctor first
   - Validate before deploy
   - Check .env files exist
   - Verify Azure resources created

3. **Isolate Issues**
   - Test with simple project
   - Try different environment
   - Check one component at a time
   - Use minimal configuration

4. **Clean Slate**
   - Delete and recreate resources
   - Fresh npm install
   - Clear build artifacts
   - Reprovision environment

## Still Stuck?

1. Check error message carefully
2. Review relevant documentation
3. Search GitHub issues
4. Ask on Stack Overflow with tag `microsoft-365-agents-toolkit`
5. Create detailed GitHub issue with:
   - Error message
   - Steps to reproduce
   - System information (OS, Node version, etc.)
   - Relevant configuration
