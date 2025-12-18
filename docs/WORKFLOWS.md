# Common Workflows

Common workflows for building and deploying Microsoft 365 agents with ATK.

## New Project Workflow

### 1. Check Prerequisites
```
Use: atk_doctor
```

### 2. Create Project
```
Use: atk_new
{
  "name": "my-agent",
  "template": "declarative-agent",
  "language": "typescript"
}
```

### 3. Validate Project
```
Use: atk_validate
{
  "projectPath": "./my-agent"
}
```

### 4. Develop Features
- Write agent logic
- Configure manifest
- Test locally

## First Deployment Workflow

### 1. Provision Resources
```
Use: atk_provision
{
  "projectPath": "./my-agent",
  "environment": "dev"
}
```

### 2. Deploy Code
```
Use: atk_deploy
{
  "projectPath": "./my-agent",
  "environment": "dev"
}
```

### 3. Package App
```
Use: atk_package
{
  "projectPath": "./my-agent",
  "environment": "dev"
}
```

### 4. Publish to M365
```
Use: atk_publish
{
  "projectPath": "./my-agent",
  "environment": "dev"
}
```

## Update Workflow

### 1. Make Code Changes
- Update agent logic
- Modify configuration
- Test changes

### 2. Validate Changes
```
Use: atk_validate
{
  "projectPath": "./my-agent"
}
```

### 3. Deploy Updates
```
Use: atk_deploy
{
  "projectPath": "./my-agent",
  "environment": "dev"
}
```

### 4. Rebuild Package (if manifest changed)
```
Use: atk_package
{
  "projectPath": "./my-agent",
  "environment": "dev"
}
```

### 5. Republish (if manifest changed)
```
Use: atk_publish
{
  "projectPath": "./my-agent",
  "environment": "dev"
}
```

## Multi-Environment Workflow

### Development Environment
```
1. atk_provision --env dev
2. atk_deploy --env dev
3. Test thoroughly
```

### Staging Environment
```
1. atk_provision --env staging
2. atk_deploy --env staging
3. Run integration tests
4. User acceptance testing
```

### Production Environment
```
1. atk_provision --env prod
2. atk_deploy --env prod
3. atk_package --env prod
4. atk_publish --env prod
5. Monitor deployment
```

## Troubleshooting Workflow

### 1. Run Diagnostics
```
Use: atk_doctor
{
  "verbose": true
}
```

### 2. Validate Project
```
Use: atk_validate
{
  "projectPath": "./my-agent"
}
```

### 3. Use Troubleshooting Prompt
```
Use prompt: troubleshoot-deployment
{
  "projectPath": "./my-agent",
  "errorMessage": "error details"
}
```

## Best Practices

### Before Deployment
- Run atk_doctor to check setup
- Validate manifest with atk_validate
- Test locally
- Review configuration

### During Development
- Use version control (git)
- Keep .env files secure
- Document changes
- Test frequently

### Production Releases
- Test in dev first
- Validate in staging
- Update version numbers
- Monitor after deployment

## Quick Reference

**Complete First Deployment:**
```
doctor → new → provision → deploy → package → publish
```

**Code Update:**
```
validate → deploy
```

**Manifest Update:**
```
validate → package → publish
```

**New Environment:**
```
provision → deploy → package → publish
```

## Prompts for Guidance

Use workflow prompts for step-by-step guidance:
- `create-weather-agent` - Create weather agent
- `deploy-agent-complete` - Complete deployment
- `setup-new-project` - New project setup
- `configure-environments` - Environment configuration
- `troubleshoot-deployment` - Troubleshooting help

## Resources

- Workflow documentation: `atk://docs/lifecycle`
- Examples: `atk://examples/*`
- Troubleshooting: `atk://troubleshooting/common-issues`
