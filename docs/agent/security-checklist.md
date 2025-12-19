# Agent Security Checklist

Security best practices for M365 declarative agent development.

## ✅ Pre-Deployment Security Checklist

Use this checklist before deploying any agent to production:

### Secrets and Credentials
- [ ] No API keys hardcoded in TypeSpec files
- [ ] No passwords in code or configuration
- [ ] All secrets in `.env` files (never in source control)
- [ ] `.env` files in `.gitignore`
- [ ] Production secrets stored in secure vault (Azure Key Vault, etc.)
- [ ] Different credentials per environment (dev, staging, prod)
- [ ] Credentials rotated regularly

### API Security
- [ ] All API endpoints use HTTPS (never HTTP)
- [ ] API authentication implemented and tested
- [ ] API authorization checks user permissions
- [ ] Rate limiting implemented on backend APIs
- [ ] Input validation on all API parameters
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (output encoding)
- [ ] CSRF protection for state-changing operations

### Capability Scoping
- [ ] Capabilities scoped to minimum necessary access
- [ ] OneDrive/SharePoint scoped to specific sites/folders
- [ ] Email scoped to specific folders or shared mailboxes
- [ ] Teams scoped to specific channels/teams
- [ ] WebSearch scoped to trusted domains (if applicable)
- [ ] Graph connectors scoped to specific connections
- [ ] Dataverse scoped to specific tables/environments

### Data Privacy
- [ ] Agent only accesses data user has permission to view
- [ ] Instructions don't ask agent to share sensitive information
- [ ] PII (personally identifiable information) handling reviewed
- [ ] GDPR/privacy regulations considered
- [ ] Data retention policies implemented
- [ ] User consent obtained where required

### Instructions Security
- [ ] No instructions to bypass security measures
- [ ] No instructions to share credentials
- [ ] Clear guidance on what information NOT to share
- [ ] Error handling doesn't leak sensitive information
- [ ] Example data in instructions is sanitized

### Compliance
- [ ] Legal disclaimer added if needed (@disclaimer)
- [ ] Compliance team reviewed agent behavior
- [ ] Industry-specific regulations addressed (HIPAA, SOX, etc.)
- [ ] Data classification requirements met
- [ ] Audit logging enabled on backend APIs

---

## 🔒 Common Security Issues

### Issue 1: Hardcoded Secrets

❌ **WRONG**:
```typespec
@server("https://api.example.com?key=secret123", "API")
```

✅ **CORRECT**:
```typespec
// In TypeSpec
@server("{API_ENDPOINT}", "API")

// In env/.env.local (NOT in source control)
API_ENDPOINT=https://api.example.com?key=secret123
```

### Issue 2: Over-Scoped Capabilities

❌ **TOO BROAD**:
```typespec
// Agent can access ALL SharePoint content
op sharepoint is AgentCapabilities.OneDriveAndSharePoint;
```

✅ **PROPERLY SCOPED**:
```typespec
// Agent can only access specific compliance folder
op sharepoint is AgentCapabilities.OneDriveAndSharePoint<ItemsByUrl = [
  { url: "https://contoso.sharepoint.com/sites/Legal/Compliance" }
]>;
```

### Issue 3: Unvalidated API Input

❌ **VULNERABLE**:
```typespec
// Backend API doesn't validate input
@get
@route("/users/{id}")
op getUser(@path id: string): UserInfo;

// Backend: SELECT * FROM users WHERE id = '${id}'  // SQL injection!
```

✅ **SECURE**:
```typespec
// Same TypeSpec, but backend uses parameterized queries
@get
@route("/users/{id}")
op getUser(@path id: string): UserInfo;

// Backend: SELECT * FROM users WHERE id = ?  (with id as parameter)
```

### Issue 4: Exposing Sensitive Information

❌ **RISKY**:
```typespec
const INSTRUCTIONS = """
If the user asks about salaries, retrieve all employee compensation data.
""";
```

✅ **SECURE**:
```typespec
const INSTRUCTIONS = """
NEVER share salary or compensation information.
If the user asks about salaries, respond: "I don't have access to compensation information. Please contact HR."
""";
```

### Issue 5: Error Messages Leaking Information

❌ **LEAKY**:
```typespec
model Error {
  code: string;
  message: string;
  stackTrace: string;  // Don't expose stack traces!
  sqlQuery: string;    // Don't expose queries!
}
```

✅ **SECURE**:
```typespec
model Error {
  code: string;
  message: string;  // User-friendly message only
  // Technical details logged server-side, not exposed to client
}
```

---

## 🛡️ Security Best Practices

### Principle of Least Privilege

1. **Capability Scoping**: Only enable capabilities the agent needs
2. **Data Access**: Scope to minimum necessary data sources
3. **API Permissions**: Grant only required permissions
4. **User Context**: Respect user's existing permissions

### Defense in Depth

1. **Client-Side** (TypeSpec): Basic validation, clear error messages
2. **API Layer**: Authentication, authorization, input validation
3. **Backend**: Business logic validation, data access controls
4. **Database**: Stored procedures, parameterized queries

### Secure Development Lifecycle

1. **Design Phase**:
   - Threat modeling
   - Security requirements
   - Privacy impact assessment

2. **Development Phase**:
   - Secure coding practices
   - Code reviews with security focus
   - Static code analysis

3. **Testing Phase**:
   - Security testing
   - Penetration testing
   - Vulnerability scanning

4. **Deployment Phase**:
   - Secure configuration
   - Secrets management
   - Monitoring and logging

5. **Maintenance Phase**:
   - Security updates
   - Incident response
   - Regular security reviews

---

## 🚨 Security Red Flags

Immediate review required if you see:

- [ ] Credentials in source code
- [ ] HTTP (not HTTPS) endpoints
- [ ] User input directly in SQL queries
- [ ] Instructions to share passwords or secrets
- [ ] No authentication on APIs
- [ ] Unscoped capabilities accessing all data
- [ ] Error messages with stack traces
- [ ] No input validation
- [ ] Disabled security features
- [ ] Commented-out security checks

---

## 🔐 Authentication Patterns

### API Key Authentication

```typespec
@header
apiKey: string;
```

**Security Notes**:
- Store key in environment variables
- Rotate keys regularly
- Use different keys per environment
- Implement rate limiting

### OAuth 2.0

```typespec
@header
authorization: string;  // Bearer token
```

**Security Notes**:
- Use authorization code flow
- Implement token refresh
- Store tokens securely
- Validate token on each request

### Azure AD Authentication

```typespec
@header
authorization: string;  // Azure AD token
```

**Security Notes**:
- Validate issuer and audience
- Check token expiration
- Verify scopes/permissions
- Use MSAL libraries

---

## 📋 Security Testing Checklist

Before production deployment, test:

- [ ] Agent respects user permissions (can't access unauthorized data)
- [ ] Scoping actually restricts access as intended
- [ ] API authentication works correctly
- [ ] Invalid input is rejected
- [ ] Error messages don't leak sensitive information
- [ ] Secrets are not in source control
- [ ] HTTPS enforced on all endpoints
- [ ] SQL injection tests pass
- [ ] XSS tests pass
- [ ] CSRF protection works
- [ ] Rate limiting prevents abuse
- [ ] Logging captures security events
- [ ] Agent instructions don't expose sensitive data

---

## 🎯 Security Review Questions

Ask yourself:

1. **Data Access**: What's the worst thing that could happen if an unauthorized user accessed this agent?
2. **Scoping**: Could an attacker bypass capability scoping?
3. **Credentials**: Are all secrets properly protected?
4. **Input Validation**: Could malicious input break the system?
5. **Output Encoding**: Could agent responses contain malicious content?
6. **Error Handling**: Do errors reveal too much information?
7. **Compliance**: Does this meet our regulatory requirements?
8. **Privacy**: Does this respect user privacy expectations?

---

## 📚 Security Resources

- Microsoft 365 Security Documentation
- OWASP Top 10
- Azure Security Best Practices
- Microsoft Security Development Lifecycle (SDL)
- GDPR Compliance Guidelines

---

**See Also**:
- `atk://capabilities-reference` - Capability scoping for security
- `atk://troubleshooting` - Security-related issues
- `atk://typespec-patterns` - Secure coding patterns
