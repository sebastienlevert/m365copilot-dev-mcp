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
  }
];
