/**
 * Agent Prompts - File-based prompt templates
 * Prompts load markdown files from docs/agent/prompts directory
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DOCS_DIR = join(__dirname, '../../docs/agent/prompts');

function loadPromptContent(filename: string): string {
  try {
    return readFileSync(join(DOCS_DIR, filename), 'utf-8');
  } catch (error) {
    return `# Error Loading Prompt\n\nFailed to load ${filename}: ${error}`;
  }
}

export const agentPrompts = [
  {
    name: 'review-agent-instructions',
    description: 'Review and provide feedback on agent instructions for quality and effectiveness',
    get arguments() {
      return [{
        name: 'instructions',
        description: 'The agent instructions to review',
        required: true
      }];
    },
    get content() {
      return loadPromptContent('review-instructions.md');
    }
  },
  {
    name: 'review-capability-scoping',
    description: 'Verify that capability scoping is in definitions (NOT instructions) and properly formatted',
    get arguments() {
      return [{
        name: 'agentCode',
        description: 'The agent TypeSpec code to review',
        required: true
      }];
    },
    get content() {
      return loadPromptContent('review-scoping.md');
    }
  },
  {
    name: 'design-multi-step-workflow',
    description: 'Design multi-step workflows with proper instruction chaining',
    get arguments() {
      return [{
        name: 'workflowGoal',
        description: 'What the workflow should accomplish',
        required: true
      }, {
        name: 'availableActions',
        description: 'List of available actions',
        required: false
      }];
    },
    get content() {
      return loadPromptContent('design-workflow.md');
    }
  },
  {
    name: 'review-typespec-style',
    description: 'Review TypeSpec code for naming conventions, formatting, and documentation standards',
    get arguments() {
      return [{
        name: 'typespecCode',
        description: 'The TypeSpec code to review',
        required: true
      }];
    },
    get content() {
      return loadPromptContent('review-style.md');
    }
  },
  {
    name: 'enhance-agent',
    description: 'Add features, capabilities, and APIs to an existing agent. ALWAYS use this when asked to make an agent more fully-featured or to add capabilities.',
    get arguments() {
      return [{
        name: 'projectPath',
        description: 'Path to the agent project',
        required: true
      }, {
        name: 'enhancements',
        description: 'What enhancements or features to add',
        required: false
      }];
    },
    get content() {
      return `# Enhance M365 Agent

You are tasked with enhancing an existing Microsoft 365 Copilot agent by adding features, capabilities, APIs, and knowledge.

## CRITICAL: Load Best Practices First

Before making ANY changes, you MUST:

1. **Load Best Practices**: Use the \`get_best_practices\` tool with \`{"type": "both"}\` to load comprehensive best practices for TypeSpec and JSON agents
   - This provides critical guidance on capabilities, actions, scoping, instructions, and common patterns
   - NEVER skip this step - the best practices contain essential information for proper agent development

2. **Review Current Project**: Read the existing agent files to understand the current implementation
   - For TypeSpec projects: Read all .tsp files
   - For JSON projects: Read declarativeAgent.json and manifest files

3. **Identify Enhancement Opportunities**:
   - Review available M365 capabilities (WebSearch, OneDrive, GraphConnector, SharePoint, etc.)
   - Consider API plugins for external data sources
   - Evaluate instruction improvements
   - Check for missing scoping or authentication

4. **Apply Best Practices**: Use the loaded best practices to ensure:
   - Capabilities are properly scoped in definitions (NOT instructions)
   - Actions follow proper patterns with models and decorators
   - Instructions are clear and comprehensive
   - Authentication is properly configured
   - Security best practices are followed

5. **Validate Changes**: After making changes:
   - For TypeSpec: Use \`compile_typespec\` tool
   - Use \`atk_run\` with \`command: "package"\` to validate
   - Use \`atk_run\` with \`command: "validate"\` for additional checks

## Arguments

- **projectPath**: {{projectPath}}
- **enhancements**: {{enhancements}}

## Workflow

1. Call \`get_best_practices\` tool with \`{"type": "both"}\`
2. Review existing agent code
3. Identify enhancement opportunities based on best practices
4. Make improvements following best practices
5. Validate all changes

Remember: The best practices contain critical information about capabilities, scoping, actions, and patterns. Loading them first ensures you make informed, correct enhancements.`;
    }
  }
];
