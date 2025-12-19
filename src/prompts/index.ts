/**
 * Prompt registry and exports
 * Provides centralized prompt management for MCP server
 */

import {
  workflowPrompts,
  getWorkflowPrompt,
  PromptDefinition,
  PromptMessage
} from './workflows.js';

import {
  bestPracticePrompts,
  getBestPracticePrompt
} from './best-practices.js';

import { agentPrompts } from './agent-prompts.js';

import { error as logError } from '../utils/logger.js';

/**
 * Get all prompt definitions
 */
export function listPrompts(): PromptDefinition[] {
  return [
    ...workflowPrompts,
    ...bestPracticePrompts,
    ...agentPrompts
  ];
}

/**
 * Get prompt messages by name
 * @param name Prompt name
 * @param args Prompt arguments
 */
export function getPrompt(name: string, args: Record<string, string>): PromptMessage[] | null {
  // Try workflow prompts first
  const workflowMessages = getWorkflowPrompt(name, args);
  if (workflowMessages) {
    return workflowMessages;
  }

  // Try best practice prompts
  const bestPracticeMessages = getBestPracticePrompt(name, args);
  if (bestPracticeMessages) {
    return bestPracticeMessages;
  }

  // Try agent prompts
  const agentPrompt = agentPrompts.find(p => p.name === name);
  if (agentPrompt) {
    let content = agentPrompt.content;
    // Replace placeholders with actual arguments
    Object.entries(args).forEach(([key, value]) => {
      content += `\n\n## ${key}\n\`\`\`\n${value}\n\`\`\``;
    });
    return [{
      role: 'user',
      content: { type: 'text', text: content }
    }];
  }

  // Prompt not found
  logError(`Prompt not found: ${name}`);
  return null;
}

/**
 * Get prompt definition by name
 */
export function getPromptDefinition(name: string): PromptDefinition | undefined {
  const allPrompts = listPrompts();
  return allPrompts.find(p => p.name === name);
}

/**
 * Check if prompt exists
 */
export function hasPrompt(name: string): boolean {
  return getPromptDefinition(name) !== undefined;
}

// Re-export types
export type { PromptDefinition, PromptMessage };
