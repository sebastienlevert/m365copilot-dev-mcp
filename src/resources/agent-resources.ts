/**
 * Agent Resources - File-based documentation with references to official Microsoft Docs
 * Resources load markdown files from docs/agent directory
 * Tools dynamically load and cache official Microsoft documentation
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DOCS_DIR = join(__dirname, '../../docs/agent');

function loadMarkdownResource(filename: string): string {
  try {
    return readFileSync(join(DOCS_DIR, filename), 'utf-8');
  } catch (error) {
    return `# Error Loading Resource\n\nFailed to load ${filename}: ${error}`;
  }
}

export const agentResources = [
  {
    uri: 'atk://quick-start',
    name: 'Quick Start: First Steps',
    description: 'CRITICAL: First steps when working with agents. Read this before starting any agent work.',
    mimeType: 'text/markdown',
    get content() {
      return `# Quick Start: Working with M365 Agents

## Before You Start ANY Agent Work

**CRITICAL FIRST STEP**: When asked to work on agents (create, modify, enhance, add features, etc.), you MUST:

### 1. Load Best Practices FIRST

Use the \`get_best_practices\` tool:

\`\`\`json
{"type": "both"}
\`\`\`

This loads comprehensive guidance on:
- Available M365 capabilities (WebSearch, OneDrive, GraphConnector, etc.)
- How to properly scope capabilities in definitions
- Action patterns and API plugin structure
- Authentication patterns
- Instructions best practices
- Common mistakes to avoid

**Why this matters**: Without the best practices, you will likely:
- Put scoping in instructions instead of definitions (wrong!)
- Miss available capabilities that could enhance the agent
- Create improperly structured actions
- Skip validation steps

### 2. Review the MCP Tools

Read the usage guidelines:
- \`atk://usage-guidelines\` resource
- Or use \`get_best_practices\` tool which includes MCP tool usage

### 3. Common Scenarios

**Creating a new agent**: \`get_best_practices\` → \`atk_run\` with \`command: "new"\`

**Enhancing an existing agent**: \`get_best_practices\` → Review code → Make changes → \`compile_typespec\` → \`atk_run\` with \`command: "package"\`

**Adding capabilities**: \`get_best_practices\` (to see all available capabilities) → Add to definitions with proper scoping

## The 3 Main MCP Tools

1. **\`get_best_practices\`** - Load best practices documentation
2. **\`compile_typespec\`** - Compile TypeSpec agents
3. **\`atk_run\`** - Run all ATK commands (provision, deploy, package, validate, etc.)

## Remember

Always start with \`get_best_practices\` - it contains critical information you need to do agent work correctly.`;
    }
  },
  {
    uri: 'atk://usage-guidelines',
    name: 'MCP Server Usage Guidelines',
    description: 'CRITICAL: Guidelines for using MCP server tools instead of direct CLI commands. Always read this first.',
    mimeType: 'text/markdown',
    get content() { return loadMarkdownResource('usage-guidelines.md'); }
  },
  {
    uri: 'atk://agent-decorators',
    name: 'Agent Decorators Reference',
    description: 'Complete reference for all TypeSpec agent decorators with parameters and examples. Use get_docs tool for official Microsoft documentation.',
    mimeType: 'text/markdown',
    get content() {
      return `# Agent Decorators Reference

> **Official Documentation**: For the latest official Microsoft decorators documentation, use:
> \`get_docs\` tool with \`{"projectType": "typespec"}\`
>
> This local file provides supplementary guidance and quick reference.

---

${loadMarkdownResource('decorators.md')}`;
    }
  },
  {
    uri: 'atk://agent-authentication',
    name: 'Agent Authentication Patterns',
    description: 'Authentication patterns and best practices for M365 agents. Use get_docs tool for official Microsoft documentation.',
    mimeType: 'text/markdown',
    get content() {
      return `# Agent Authentication Patterns

> **Official Documentation**: For the latest official Microsoft authentication documentation, use:
> \`get_docs\` tool with \`{"projectType": "typespec"}\`

## Overview

Authentication in M365 agents is handled through TypeSpec decorators that define how your agent authenticates with external APIs.

## Key Concepts

1. **Authentication Types**: OAuth 2.0, API Key, Anonymous
2. **Authentication Scope**: Per-action or global
3. **Token Management**: Automatic token refresh and storage
4. **Security Best Practices**: Never hardcode credentials, use environment variables

## Common Patterns

### OAuth 2.0 Authentication

\`\`\`typespec
@auth(OAuth2Auth<{
  authorizationUrl: "{AUTHORIZATION_URL}",
  tokenUrl: "{TOKEN_URL}",
  scopes: ["{SCOPE}"]
}>)
\`\`\`

### API Key Authentication

\`\`\`typespec
@auth(ApiKeyAuth<{
  name: "api-key",
  in: "header"
}>)
\`\`\`

## Resources

For complete and up-to-date authentication patterns, use the \`get_docs\` tool.`;
    }
  },
  {
    uri: 'atk://capabilities-reference',
    name: 'Agent Capabilities Reference',
    description: 'Comprehensive guide for each M365 agent capability with scoping patterns. Use get_docs tool for official Microsoft documentation.',
    mimeType: 'text/markdown',
    get content() {
      return `# Agent Capabilities Reference

> **Official Documentation**: For the latest official Microsoft capabilities documentation, use:
> \`get_docs\` tool with \`{"projectType": "typespec"}\`
>
> This local file provides supplementary guidance and quick reference.

---

${loadMarkdownResource('capabilities.md')}`;
    }
  },
  {
    uri: 'atk://capability-scoping-examples',
    name: 'Capability Scoping Examples',
    description: 'Real-world examples of scoping each capability properly',
    mimeType: 'text/markdown',
    get content() { return loadMarkdownResource('capability-scoping-examples.md'); }
  },
  {
    uri: 'atk://typespec-patterns',
    name: 'TypeSpec Patterns',
    description: 'Common TypeSpec patterns for agents including action definitions and model design',
    mimeType: 'text/markdown',
    get content() { return loadMarkdownResource('typespec-patterns.md'); }
  },
  {
    uri: 'atk://troubleshooting',
    name: 'Agent Troubleshooting Guide',
    description: 'Indexed troubleshooting scenarios and solutions for agent development',
    mimeType: 'text/markdown',
    get content() { return loadMarkdownResource('troubleshooting.md'); }
  },
  {
    uri: 'atk://security-checklist',
    name: 'Agent Security Checklist',
    description: 'Security best practices and checklist for agent development',
    mimeType: 'text/markdown',
    get content() { return loadMarkdownResource('security-checklist.md'); }
  },
  {
    uri: 'atk://typespec-scenarios',
    name: 'TypeSpec Scenarios for M365 Agents',
    description: 'Common scenarios and patterns for building M365 agents with TypeSpec. Use get_docs tool for official Microsoft documentation.',
    mimeType: 'text/markdown',
    get content() {
      return `# TypeSpec Scenarios for M365 Agents

> **Official Documentation**: For the latest official Microsoft scenarios documentation, use:
> \`get_docs\` tool with \`{"projectType": "typespec"}\`

This resource provides quick reference to common agent development scenarios. For comprehensive, up-to-date examples from Microsoft, use the \`get_docs\` tool.

## Common Scenarios

- Building agents with API actions
- Adding M365 capabilities (web search, OneDrive, Teams, etc.)
- Implementing authentication patterns
- Designing multi-step workflows
- Working with scenario models

Use \`get_docs\` with \`{"projectType": "typespec"}\` for detailed official examples.`;
    }
  },
  {
    uri: 'atk://typespec-overview',
    name: 'TypeSpec Overview for M365 Agents',
    description: 'Overview and getting started guide for TypeSpec in M365 agent development. Use get_docs tool for official Microsoft documentation.',
    mimeType: 'text/markdown',
    get content() {
      return `# TypeSpec Overview for M365 Agents

> **Official Documentation**: For the latest official Microsoft overview documentation, use:
> \`get_docs\` tool with \`{"projectType": "typespec"}\`

This resource provides a quick overview. For comprehensive, up-to-date getting started guide from Microsoft, use the \`get_docs\` tool.

## What is TypeSpec?

TypeSpec is a declarative language for defining M365 Copilot agents. It allows you to specify:
- Agent metadata and description
- Available actions (custom APIs)
- M365 capabilities (web search, OneDrive, Teams, etc.)
- Instructions for agent behavior
- Authentication requirements

## Getting Started

For the complete getting started guide, use:
\`get_docs\` with \`{"projectType": "typespec"}\`

## Key Concepts

- **Declarative Approach**: Describe what your agent does, not how it works
- **Capabilities**: Built-in M365 features your agent can use
- **Actions**: Custom API endpoints your agent can call
- **Instructions**: Natural language guidance for agent behavior
- **Scoping**: Restrict capabilities to specific resources (MUST be in definitions, not instructions)

Use the \`get_docs\` tool for comprehensive official documentation.`;
    }
  }
];
