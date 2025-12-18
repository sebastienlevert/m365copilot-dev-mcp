/**
 * Tests for workflow prompts
 */

import { describe, it, expect } from 'vitest';
import {
  workflowPrompts,
  getWorkflowPrompt,
  getCreateDeclarativeAgentPrompt,
  getDeployAgentCompletePrompt,
  getSetupNewProjectPrompt
} from '../../src/prompts/workflows.js';

describe('Workflow Prompts', () => {
  describe('Prompt definitions', () => {
    it('should export all workflow prompts', () => {
      expect(workflowPrompts).toHaveLength(3);
      expect(workflowPrompts.map(p => p.name)).toEqual([
        'create-declarative-agent',
        'deploy-agent-complete',
        'setup-new-project'
      ]);
    });

    it('should have required arguments defined', () => {
      workflowPrompts.forEach(prompt => {
        expect(prompt.name).toBeDefined();
        expect(prompt.description).toBeDefined();
        expect(Array.isArray(prompt.arguments)).toBe(true);
      });
    });
  });

  describe('create-declarative-agent prompt', () => {
    it('should generate prompt with project name', () => {
      const messages = getCreateDeclarativeAgentPrompt({
        projectName: 'my-agent',
        targetDirectory: './agents'
      });

      expect(messages).toHaveLength(2);
      expect(messages[0].role).toBe('user');
      expect(messages[1].role).toBe('assistant');
      expect(messages[0].content.text).toContain('my-agent');
      expect(messages[1].content.text).toContain('TypeSpec');
    });

    it('should include VS Code workspace instructions', () => {
      const messages = getCreateDeclarativeAgentPrompt({
        projectName: 'test-agent'
      });

      expect(messages[1].content.text).toContain('VS CODE');
      expect(messages[1].content.text).toContain('open the new workspace');
    });

    it('should warn about generated files', () => {
      const messages = getCreateDeclarativeAgentPrompt({
        projectName: 'test-agent'
      });

      expect(messages[1].content.text).toContain('DO NOT EDIT');
      expect(messages[1].content.text).toContain('manifest.json');
      expect(messages[1].content.text).toContain('declarativeAgent.json');
    });

    it('should include TypeSpec benefits', () => {
      const messages = getCreateDeclarativeAgentPrompt({
        projectName: 'test-agent'
      });

      expect(messages[1].content.text).toContain('type-safe');
      expect(messages[1].content.text).toContain('IntelliSense');
    });
  });

  describe('deploy-agent-complete prompt', () => {
    it('should generate deployment workflow', () => {
      const messages = getDeployAgentCompletePrompt({
        projectPath: './my-agent',
        environment: 'dev'
      });

      expect(messages).toHaveLength(2);
      expect(messages[1].content.text).toContain('deployment workflow');
      expect(messages[1].content.text).toContain('dev');
    });

    it('should list all deployment steps', () => {
      const messages = getDeployAgentCompletePrompt({
        projectPath: './my-agent',
        environment: 'prod'
      });

      const text = messages[1].content.text;
      expect(text).toContain('Validation');
      expect(text).toContain('Provisioning');
      expect(text).toContain('Deployment');
      expect(text).toContain('Packaging');
      expect(text).toContain('Publishing');
    });
  });

  describe('setup-new-project prompt', () => {
    it('should generate project setup workflow', () => {
      const messages = getSetupNewProjectPrompt({
        agentType: 'declarative-agent',
        projectName: 'new-agent'
      });

      expect(messages).toHaveLength(2);
      expect(messages[1].content.text).toContain('new-agent');
      expect(messages[1].content.text).toContain('declarative-agent');
    });

    it('should include warning about generated files', () => {
      const messages = getSetupNewProjectPrompt({
        agentType: 'declarative-agent'
      });

      expect(messages[1].content.text).toContain('DO NOT EDIT');
      expect(messages[1].content.text).toContain('.generated');
    });
  });

  describe('getWorkflowPrompt', () => {
    it('should return correct prompt by name', () => {
      const result = getWorkflowPrompt('create-declarative-agent', {
        projectName: 'test'
      });

      expect(result).toBeDefined();
      expect(result).toHaveLength(2);
    });

    it('should return null for unknown prompt', () => {
      const result = getWorkflowPrompt('non-existent-prompt', {});

      expect(result).toBeNull();
    });
  });
});
