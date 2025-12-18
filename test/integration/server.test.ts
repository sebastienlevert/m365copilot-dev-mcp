/**
 * Integration tests for MCP server
 */

import { describe, it, expect } from 'vitest';
import { listTools, callTool } from '../../src/tools/index.js';
import { listPrompts, getPrompt } from '../../src/prompts/index.js';
import { listResources, getResource } from '../../src/resources/index.js';

describe('MCP Server Integration', () => {
  describe('Tools registration', () => {
    it('should list all 8 tools', () => {
      const tools = listTools();

      expect(tools).toHaveLength(8);

      const toolNames = tools.map(t => t.name);
      expect(toolNames).toContain('atk_new');
      expect(toolNames).toContain('atk_provision');
      expect(toolNames).toContain('atk_deploy');
      expect(toolNames).toContain('atk_package');
      expect(toolNames).toContain('atk_publish');
      expect(toolNames).toContain('atk_validate');
      expect(toolNames).toContain('atk_doctor');
      expect(toolNames).toContain('atk_version');
    });

    it('should have proper tool definitions', () => {
      const tools = listTools();

      tools.forEach(tool => {
        expect(tool.name).toBeDefined();
        expect(tool.description).toBeDefined();
        expect(tool.description.length).toBeGreaterThan(50); // Rich descriptions
        expect(tool.inputSchema).toBeDefined();
        expect(tool.inputSchema.type).toBe('object');
      });
    });

    it('should have VS Code instructions in atk_new', () => {
      const tools = listTools();
      const newTool = tools.find(t => t.name === 'atk_new');

      expect(newTool?.description).toContain('VS CODE');
      expect(newTool?.description).toContain('GITHUB COPILOT');
    });

    it('should warn about generated files in atk_new', () => {
      const tools = listTools();
      const newTool = tools.find(t => t.name === 'atk_new');

      expect(newTool?.description).toContain('NEVER EDIT GENERATED FILES');
      expect(newTool?.description).toContain('manifest.json');
      expect(newTool?.description).toContain('declarativeAgent.json');
    });
  });

  describe('Prompts registration', () => {
    it('should list all workflow prompts', () => {
      const prompts = listPrompts();

      expect(prompts.length).toBeGreaterThanOrEqual(3);

      const promptNames = prompts.map(p => p.name);
      expect(promptNames).toContain('create-declarative-agent');
      expect(promptNames).toContain('deploy-agent-complete');
      expect(promptNames).toContain('setup-new-project');
    });

    it('should have proper prompt definitions', () => {
      const prompts = listPrompts();

      prompts.forEach(prompt => {
        expect(prompt.name).toBeDefined();
        expect(prompt.description).toBeDefined();
        expect(Array.isArray(prompt.arguments)).toBe(true);
      });
    });

    it('should retrieve prompt content', () => {
      const prompt = getPrompt('create-declarative-agent', {
        projectName: 'test-agent'
      });

      expect(prompt).toBeDefined();
      expect(Array.isArray(prompt)).toBe(true);
      expect(prompt?.length).toBeGreaterThan(0);
    });
  });

  describe('Resources registration', () => {
    it('should list all documentation resources', () => {
      const resources = listResources();

      expect(resources.length).toBeGreaterThanOrEqual(7);

      // Check for critical resources
      const resourceUris = resources.map(r => r.uri);
      expect(resourceUris).toContain('atk://docs/commands');
      expect(resourceUris).toContain('atk://docs/project-structure');
      expect(resourceUris).toContain('atk://docs/lifecycle');
    });

    it('should have proper resource definitions', () => {
      const resources = listResources();

      resources.forEach(resource => {
        expect(resource.uri).toMatch(/^atk:\/\//);
        expect(resource.name).toBeDefined();
        expect(resource.description).toBeDefined();
        expect(resource.mimeType).toBe('text/markdown');
      });
    });

    it('should retrieve resource content', () => {
      const resource = getResource('atk://docs/commands');

      expect(resource).toBeDefined();
      expect(resource?.uri).toBe('atk://docs/commands');
      expect(resource?.text).toBeDefined();
      expect(resource?.text.length).toBeGreaterThan(0);
    });
  });

  describe('Feature completeness', () => {
    it('should support TypeSpec format in atk_new', () => {
      const tools = listTools();
      const newTool = tools.find(t => t.name === 'atk_new');

      const formatProperty = newTool?.inputSchema.properties?.format;
      expect(formatProperty).toBeDefined();
      expect(formatProperty?.enum).toContain('typespec');
      expect(formatProperty?.default).toBe('typespec');
    });

    it('should default to ~/AgentsToolkitProjects directory', () => {
      const tools = listTools();
      const newTool = tools.find(t => t.name === 'atk_new');

      const directoryProperty = newTool?.inputSchema.properties?.directory;
      expect(directoryProperty?.description).toContain('AgentsToolkitProjects');
    });

    it('should have critical warnings in multiple places', () => {
      const tools = listTools();
      const prompts = listPrompts();
      const resources = listResources();

      // Tools should warn
      const newTool = tools.find(t => t.name === 'atk_new');
      expect(newTool?.description).toContain('NEVER EDIT');

      // Prompts should warn
      const createPrompt = getPrompt('create-declarative-agent', {
        projectName: 'test'
      });
      expect(createPrompt?.[1]?.content.text).toContain('DO NOT EDIT');

      // Resources should warn
      const projectStructure = getResource('atk://docs/project-structure');
      expect(projectStructure?.text).toContain('AUTO-GENERATED');
    });
  });

  describe('TypeSpec focus', () => {
    it('should only support declarative-agent template', () => {
      const tools = listTools();
      const newTool = tools.find(t => t.name === 'atk_new');

      const templateProperty = newTool?.inputSchema.properties?.template;
      expect(templateProperty?.enum).toEqual(['declarative-agent']);
    });

    it('should emphasize TypeSpec in descriptions', () => {
      const tools = listTools();
      const prompts = listPrompts();

      const newTool = tools.find(t => t.name === 'atk_new');
      expect(newTool?.description).toContain('TypeSpec');

      const createPrompt = getPrompt('create-declarative-agent', {
        projectName: 'test'
      });
      expect(createPrompt?.[1]?.content.text).toContain('TypeSpec');
    });
  });
});
