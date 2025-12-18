/**
 * Best practice prompts
 * Expert guidance for ATK best practices and troubleshooting
 */

import { PromptDefinition, PromptMessage } from './workflows.js';

/**
 * Configure Environments prompt
 */
export const configureEnvironmentsPrompt: PromptDefinition = {
  name: 'configure-environments',
  description: 'Best practices for configuring multiple environments (dev, staging, prod)',
  arguments: [
    {
      name: 'projectPath',
      description: 'Path to ATK project',
      required: true
    }
  ]
};

export function getConfigureEnvironmentsPrompt(args: Record<string, string>): PromptMessage[] {
  const projectPath = args.projectPath || '.';

  return [
    {
      role: 'user',
      content: {
        type: 'text',
        text: `Help me configure environments for my ATK project at "${projectPath}".`
      }
    },
    {
      role: 'assistant',
      content: {
        type: 'text',
        text: `I'll guide you through configuring multiple environments following Microsoft 365 Agents Toolkit best practices.

**Environment Strategy:**

**1. Environment Types:**
- **local** - Local development and testing
- **dev** - Development environment in Azure
- **staging** - Pre-production testing
- **prod** - Production environment

**2. Configuration Files:**

For each environment, you'll have:
- \`m365agents.{env}.yml\` - Environment-specific lifecycle configuration
- \`.env.{env}\` - Environment variables and secrets
- \`manifest.{env}.json\` - Environment-specific app manifest (optional)

**3. Best Practices:**

✅ **DO:**
- Use separate Azure resource groups per environment
- Store secrets in Azure Key Vault (not in yml files)
- Use environment variables for sensitive data
- Keep .env files in .gitignore
- Document environment differences
- Use consistent naming conventions (e.g., rg-myapp-dev, rg-myapp-prod)

❌ **DON'T:**
- Commit .env files to version control
- Hard-code secrets in configuration files
- Share production credentials
- Use same resources across environments

**4. Setting Up Environments:**

To add a new environment, use the ATK CLI:
\`\`\`bash
# From your project directory
atk env add staging --env dev
\`\`\`

This creates:
- m365agents.staging.yml (copied from dev)
- Environment configuration structure

**5. Environment Variables:**

Each .env file should contain:
\`\`\`
# Azure Configuration
AZURE_SUBSCRIPTION_ID=<subscription-id>
AZURE_RESOURCE_GROUP=rg-myapp-{env}
AZURE_LOCATION=eastus

# Application Configuration
BOT_ID=<bot-guid>
BOT_PASSWORD=<bot-secret>

# Microsoft 365
M365_CLIENT_ID=<client-id>
M365_CLIENT_SECRET=<client-secret>
M365_TENANT_ID=<tenant-id>

# Environment-Specific
API_ENDPOINT=https://api-{env}.myapp.com
LOG_LEVEL={debug|info|error}
\`\`\`

**6. Resource Naming Conventions:**

Use clear, consistent naming:
\`\`\`
Production:
- Resource Group: rg-myapp-prod
- Function App: func-myapp-prod
- Storage: stmyappprod
- Bot: bot-myapp-prod

Development:
- Resource Group: rg-myapp-dev
- Function App: func-myapp-dev
- Storage: stmyappdev
- Bot: bot-myapp-dev
\`\`\`

**7. Lifecycle Configuration:**

Customize m365agents.{env}.yml for each environment:
- Different Azure regions
- Different resource sizes (dev: smaller, prod: larger)
- Different scaling configurations
- Environment-specific integrations

**8. Security Considerations:**

- **Development:** More permissive, easier debugging
- **Staging:** Production-like, testing security policies
- **Production:** Strict security, monitoring enabled

**9. Deployment Workflow:**

\`\`\`
Dev -> Staging -> Production
\`\`\`

Test each environment before promoting:
1. Deploy to dev
2. Test thoroughly in dev
3. Deploy to staging
4. Run integration tests in staging
5. Deploy to production
6. Monitor production closely

**Next Steps for Your Project:**

Would you like me to:
1. Validate your current environment setup?
2. Help create a new environment?
3. Review your environment configuration files?
4. Set up Azure Key Vault for secrets?

**Documentation:** atk://docs/environments`
      }
    }
  ];
}

/**
 * Troubleshoot Deployment prompt
 */
export const troubleshootDeploymentPrompt: PromptDefinition = {
  name: 'troubleshoot-deployment',
  description: 'Diagnose and resolve common deployment issues',
  arguments: [
    {
      name: 'projectPath',
      description: 'Path to ATK project',
      required: true
    },
    {
      name: 'errorMessage',
      description: 'Error message encountered (optional)',
      required: false
    }
  ]
};

export function getTroubleshootDeploymentPrompt(args: Record<string, string>): PromptMessage[] {
  const projectPath = args.projectPath || '.';
  const errorMessage = args.errorMessage || 'deployment failed';

  return [
    {
      role: 'user',
      content: {
        type: 'text',
        text: `I'm having deployment issues with my project at "${projectPath}". ${errorMessage !== 'deployment failed' ? `Error: ${errorMessage}` : ''}`
      }
    },
    {
      role: 'assistant',
      content: {
        type: 'text',
        text: `I'll help you diagnose and resolve your deployment issue.

**Error Context:**
${errorMessage !== 'deployment failed' ? `Error: ${errorMessage}\n\n` : ''}**Project:** ${projectPath}

**Troubleshooting Workflow:**

**Step 1: System Prerequisites**
Let me first verify your system setup:

[I'll run atk_doctor to check prerequisites]

**Step 2: Common Deployment Issues**

**Issue: Authentication Failed**
Symptoms: "Not logged in", "credentials not found"
Solutions:
- Run: \`az login\` for Azure authentication
- Verify: \`az account show\` shows correct subscription
- Check: Microsoft 365 account is valid

**Issue: Permission Denied**
Symptoms: "Forbidden", "unauthorized", "insufficient permissions"
Solutions:
- Verify Azure role: Need Contributor or Owner
- Check M365 permissions: Need admin rights for org-wide apps
- Review resource group permissions

**Issue: Resources Already Exist**
Symptoms: "Conflict", "already exists", "name not available"
Solutions:
- Use different resource names
- Delete existing resources if appropriate
- Check for naming conflicts in Azure

**Issue: Subscription Not Found**
Symptoms: "Subscription not found", "invalid subscription"
Solutions:
- List subscriptions: \`az account list\`
- Set subscription: \`az account set --subscription <id>\`
- Verify subscription is active and not expired

**Issue: Provisioning Failed**
Symptoms: Provision completes with errors
Solutions:
- Check .env.{env} file was created
- Verify all resources in Azure portal
- Review Azure activity log for failures
- Retry provisioning: often fixes transient issues

**Issue: Build Errors**
Symptoms: "Build failed", "compilation errors"
Solutions:
- Check for TypeScript errors: \`npm run build\`
- Verify dependencies: \`npm install\`
- Clear build cache: \`rm -rf build && npm run build\`
- Check node_modules integrity

**Issue: Deployment Timeout**
Symptoms: "Operation timed out"
Solutions:
- Check internet connection
- Verify Azure region is accessible
- Retry deployment
- Use different Azure region if persistent

**Issue: Environment Not Provisioned**
Symptoms: "Environment file not found", ".env.{env} missing"
Solutions:
- Run provisioning first: Use atk_provision
- Verify .env file exists in project root
- Check environment name matches

**Step 3: Detailed Diagnosis**

Let me gather more information:

1. **Validate Project:**
   [I'll run atk_validate to check project structure]

2. **Check Environment:**
   [I'll look for .env files and configuration]

3. **Review Recent Changes:**
   - What changed since last successful deployment?
   - New dependencies added?
   - Configuration changes?

**Step 4: Resolution Steps**

Based on the diagnosis, I'll provide specific steps to resolve your issue.

**Common Resolution Patterns:**

**Pattern 1: Clean Redeploy**
\`\`\`bash
# Clean and rebuild
npm run clean
npm install
npm run build

# Redeploy
atk deploy --env {env}
\`\`\`

**Pattern 2: Reprovision Resources**
\`\`\`bash
# If resources are corrupted
# Delete resource group in Azure Portal
# Then reprovision
atk provision --env {env}
atk deploy --env {env}
\`\`\`

**Pattern 3: Reset Environment**
\`\`\`bash
# Reset environment configuration
atk env reset
# Recreate environment
atk env add {env}
# Provision and deploy
atk provision --env {env}
atk deploy --env {env}
\`\`\`

Shall I start with the system prerequisites check?

**Documentation:** atk://troubleshooting/deployment`
      }
    }
  ];
}

/**
 * Security Checklist prompt
 */
export const securityChecklistPrompt: PromptDefinition = {
  name: 'security-checklist',
  description: 'Review security best practices for your agent',
  arguments: [
    {
      name: 'projectPath',
      description: 'Path to ATK project',
      required: true
    }
  ]
};

export function getSecurityChecklistPrompt(args: Record<string, string>): PromptMessage[] {
  const projectPath = args.projectPath || '.';

  return [
    {
      role: 'user',
      content: {
        type: 'text',
        text: `Review security best practices for my project at "${projectPath}".`
      }
    },
    {
      role: 'assistant',
      content: {
        type: 'text',
        text: `I'll help you review security best practices for your Microsoft 365 agent.

**Project:** ${projectPath}

**Security Checklist for Microsoft 365 Agents:**

**1. Authentication & Authorization**

☑ **Bot Authentication:**
- [ ] Bot password stored securely (Azure Key Vault or .env, never in code)
- [ ] Bot ID is a valid GUID
- [ ] Messaging endpoint uses HTTPS only
- [ ] Certificate validation enabled

☑ **Azure AD Integration:**
- [ ] Client secrets stored in Key Vault
- [ ] OAuth scopes follow least-privilege principle
- [ ] Token expiration properly handled
- [ ] Refresh tokens stored securely

☑ **API Authentication:**
- [ ] External API keys in environment variables
- [ ] API keys rotated regularly
- [ ] Rate limiting implemented
- [ ] Authentication errors logged (without exposing secrets)

**2. Data Protection**

☑ **Secrets Management:**
- [ ] .env files in .gitignore
- [ ] No secrets in manifest.json
- [ ] No secrets in source code
- [ ] Secrets encrypted at rest
- [ ] Use Azure Key Vault for production

☑ **User Data:**
- [ ] PII handled according to compliance requirements
- [ ] Data minimization practiced
- [ ] User data encrypted in transit (HTTPS)
- [ ] Data retention policies defined
- [ ] GDPR compliance if applicable

☑ **Logging:**
- [ ] Secrets not logged
- [ ] PII not logged or masked
- [ ] Logs stored securely
- [ ] Log retention policy defined

**3. App Manifest Security**

☑ **Permissions:**
- [ ] Only request necessary permissions
- [ ] RSC permissions justified
- [ ] Permission scope minimized
- [ ] Admin consent documented

☑ **Domains:**
- [ ] validDomains list is minimal
- [ ] No wildcard domains (*.example.com)
- [ ] All domains use HTTPS
- [ ] Domains are owned/controlled

☑ **URLs:**
- [ ] All URLs use HTTPS
- [ ] Privacy policy URL valid and accessible
- [ ] Terms of use URL valid and accessible
- [ ] Bot endpoint URL secured

**4. Code Security**

☑ **Dependencies:**
- [ ] Dependencies up to date (npm audit)
- [ ] No known vulnerabilities
- [ ] Dependency scanning in CI/CD
- [ ] Lock files committed (package-lock.json)

☑ **Input Validation:**
- [ ] User input sanitized
- [ ] Injection attacks prevented (SQL, command, XSS)
- [ ] File uploads validated
- [ ] Size limits enforced

☑ **Error Handling:**
- [ ] Sensitive data not exposed in errors
- [ ] Generic error messages to users
- [ ] Detailed errors logged securely
- [ ] Stack traces not exposed

**5. Azure Security**

☑ **Resource Configuration:**
- [ ] Managed identities used where possible
- [ ] Network security groups configured
- [ ] Storage accounts have private endpoints
- [ ] Application Insights monitoring enabled

☑ **Access Control:**
- [ ] RBAC properly configured
- [ ] Least privilege for service principals
- [ ] Regular access reviews
- [ ] Separate environments (dev/prod)

☑ **Network Security:**
- [ ] TLS 1.2 or higher enforced
- [ ] IP restrictions if appropriate
- [ ] VNet integration for sensitive apps
- [ ] DDoS protection considered

**6. Compliance**

☑ **Privacy:**
- [ ] Privacy policy published and linked in manifest
- [ ] Data processing documented
- [ ] User consent obtained where required
- [ ] Data subject rights supported

☑ **Compliance Standards:**
- [ ] SOC 2 requirements addressed
- [ ] HIPAA compliance if handling health data
- [ ] PCI DSS if handling payment data
- [ ] Industry-specific regulations reviewed

**7. Monitoring & Incident Response**

☑ **Monitoring:**
- [ ] Application Insights configured
- [ ] Alert rules for security events
- [ ] Failed authentication monitored
- [ ] Anomaly detection enabled

☑ **Incident Response:**
- [ ] Incident response plan documented
- [ ] Security contact information in manifest
- [ ] Backup and recovery procedures
- [ ] Security patch process defined

**8. Deployment Security**

☑ **CI/CD Pipeline:**
- [ ] Secrets not in pipeline definitions
- [ ] Use secure variable groups
- [ ] Code scanning in pipeline
- [ ] Deployment approvals for production

☑ **Environment Separation:**
- [ ] Separate Azure subscriptions/resource groups
- [ ] No shared credentials across environments
- [ ] Production data not in dev/test
- [ ] Network isolation between environments

**Next Steps:**

Would you like me to:
1. Review your manifest.json for security issues?
2. Check for secrets in your codebase?
3. Review your Azure resource security configuration?
4. Help implement Azure Key Vault integration?

**Resources:**
- Security guidelines: atk://docs/security
- Azure security best practices: https://docs.microsoft.com/azure/security/
- Microsoft 365 security: https://docs.microsoft.com/microsoft-365/security/

**Documentation:** atk://docs/security-best-practices`
      }
    }
  ];
}

/**
 * Export all best practice prompts
 */
export const bestPracticePrompts = [
  configureEnvironmentsPrompt,
  troubleshootDeploymentPrompt,
  securityChecklistPrompt
];

/**
 * Get best practice prompt by name
 */
export function getBestPracticePrompt(name: string, args: Record<string, string>): PromptMessage[] | null {
  switch (name) {
    case 'configure-environments':
      return getConfigureEnvironmentsPrompt(args);
    case 'troubleshoot-deployment':
      return getTroubleshootDeploymentPrompt(args);
    case 'security-checklist':
      return getSecurityChecklistPrompt(args);
    default:
      return null;
  }
}
