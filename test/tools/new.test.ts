/**
 * Tests for atk_new tool
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { executeNewTool, NewProjectSchema } from '../../src/tools/new.js';
import { ATKTemplate, DeclarativeAgentFormat } from '../../src/types/atk.js';
import { resetAllMocks, createMockCLIResult } from '../setup.js';
import { homedir } from 'os';
import { join } from 'path';

// Mock dependencies
vi.mock('fs', () => ({
  existsSync: vi.fn(),
  mkdirSync: vi.fn()
}));

vi.mock('../../src/utils/cli-executor.js', () => ({
  executeATKCommand: vi.fn()
}));

import { existsSync, mkdirSync } from 'fs';
import { executeATKCommand } from '../../src/utils/cli-executor.js';

describe('atk_new tool', () => {
  beforeEach(() => {
    resetAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Schema validation', () => {
    it('should validate valid input', () => {
      const input = {
        name: 'test-agent',
        template: ATKTemplate.DECLARATIVE_AGENT,
        format: DeclarativeAgentFormat.TYPESPEC
      };

      const result = NewProjectSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should use default format of typespec', () => {
      const input = {
        name: 'test-agent',
        template: ATKTemplate.DECLARATIVE_AGENT
      };

      const result = NewProjectSchema.parse(input);
      expect(result.format).toBe(DeclarativeAgentFormat.TYPESPEC);
    });

    it('should reject empty name', () => {
      const input = {
        name: '',
        template: ATKTemplate.DECLARATIVE_AGENT
      };

      const result = NewProjectSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should accept optional directory', () => {
      const input = {
        name: 'test-agent',
        template: ATKTemplate.DECLARATIVE_AGENT,
        directory: './custom-dir'
      };

      const result = NewProjectSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.directory).toBe('./custom-dir');
      }
    });
  });

  describe('Project creation', () => {
    it('should create project in default directory', async () => {
      const defaultDir = join(homedir(), 'AgentsToolkitProjects');
      const projectPath = join(defaultDir, 'test-agent');

      vi.mocked(existsSync).mockReturnValue(false);
      vi.mocked(mkdirSync).mockReturnValue(undefined); // Mock successful directory creation
      vi.mocked(executeATKCommand).mockResolvedValue(
        createMockCLIResult({ stdout: 'Project created successfully' })
      );

      const result = await executeNewTool({
        name: 'test-agent',
        template: ATKTemplate.DECLARATIVE_AGENT,
        format: DeclarativeAgentFormat.TYPESPEC
      });

      expect(mkdirSync).toHaveBeenCalledWith(defaultDir, { recursive: true });
      expect(executeATKCommand).toHaveBeenCalledWith(
        expect.objectContaining({
          command: 'atk',
          args: expect.arrayContaining([
            'new',
            '--interactive', 'false',
            '--app-name', 'test-agent',
            '--capability', 'declarative-agent',
            '--folder', defaultDir,
            '-with-plugin', 'type-spec'
          ])
        })
      );
      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Successfully created');
      expect(result.content[0].text).toContain(projectPath);
    });

    it('should create project with TypeSpec plugin', async () => {
      const defaultDir = join(homedir(), 'AgentsToolkitProjects');

      vi.mocked(existsSync).mockReturnValue(false);
      vi.mocked(mkdirSync).mockReturnValue(undefined);
      vi.mocked(executeATKCommand).mockResolvedValue(createMockCLIResult());

      await executeNewTool({
        name: 'test-agent',
        template: ATKTemplate.DECLARATIVE_AGENT,
        format: DeclarativeAgentFormat.TYPESPEC
      });

      expect(executeATKCommand).toHaveBeenCalledWith(
        expect.objectContaining({
          args: expect.arrayContaining(['-with-plugin', 'type-spec'])
        })
      );
    });

    it('should create project without TypeSpec plugin for JSON format', async () => {
      const defaultDir = join(homedir(), 'AgentsToolkitProjects');

      vi.mocked(existsSync).mockReturnValue(false);
      vi.mocked(mkdirSync).mockReturnValue(undefined);
      vi.mocked(executeATKCommand).mockResolvedValue(createMockCLIResult());

      await executeNewTool({
        name: 'test-agent',
        template: ATKTemplate.DECLARATIVE_AGENT,
        format: DeclarativeAgentFormat.JSON
      });

      const call = vi.mocked(executeATKCommand).mock.calls[0][0];
      expect(call.args).not.toContain('-with-plugin');
      expect(call.args).not.toContain('type-spec');
    });

    it('should create project in custom directory', async () => {
      const customDir = './custom-agents';
      const projectPath = join(process.cwd(), customDir, 'test-agent');

      vi.mocked(existsSync).mockReturnValue(false);
      vi.mocked(mkdirSync).mockReturnValue(undefined);
      vi.mocked(executeATKCommand).mockResolvedValue(createMockCLIResult());

      await executeNewTool({
        name: 'test-agent',
        template: ATKTemplate.DECLARATIVE_AGENT,
        format: DeclarativeAgentFormat.TYPESPEC,
        directory: customDir
      });

      expect(executeATKCommand).toHaveBeenCalledWith(
        expect.objectContaining({
          args: expect.arrayContaining([
            '--folder', expect.stringContaining('custom-agents')
          ])
        })
      );
    });

    it('should handle tilde in custom directory path', async () => {
      const customDir = '~/my-agents';

      vi.mocked(existsSync).mockReturnValue(false);
      vi.mocked(mkdirSync).mockReturnValue(undefined);
      vi.mocked(executeATKCommand).mockResolvedValue(createMockCLIResult());

      await executeNewTool({
        name: 'test-agent',
        template: ATKTemplate.DECLARATIVE_AGENT,
        format: DeclarativeAgentFormat.TYPESPEC,
        directory: customDir
      });

      const call = vi.mocked(executeATKCommand).mock.calls[0][0];
      expect(call.args).toContain('--folder');
      const folderIndex = call.args.indexOf('--folder');
      const folderPath = call.args[folderIndex + 1];
      expect(folderPath).toContain(homedir());
      expect(folderPath).not.toContain('~');
    });
  });

  describe('Error handling', () => {
    it('should return error if project directory already exists', async () => {
      const defaultDir = join(homedir(), 'AgentsToolkitProjects');

      vi.mocked(existsSync).mockImplementation((path) => {
        return path === join(defaultDir, 'existing-agent');
      });

      const result = await executeNewTool({
        name: 'existing-agent',
        template: ATKTemplate.DECLARATIVE_AGENT,
        format: DeclarativeAgentFormat.TYPESPEC
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('ProjectAlreadyExists');
      expect(result.content[0].text).toContain('Directory already exists');
    });

    it('should return error if default directory creation fails', async () => {
      vi.mocked(existsSync).mockReturnValue(false);
      vi.mocked(mkdirSync).mockImplementation(() => {
        throw new Error('Permission denied');
      });

      const result = await executeNewTool({
        name: 'test-agent',
        template: ATKTemplate.DECLARATIVE_AGENT,
        format: DeclarativeAgentFormat.TYPESPEC
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('DirectoryCreationFailed');
      expect(result.content[0].text).toContain('Permission denied');
    });

    it('should return error if ATK command fails', async () => {
      vi.mocked(existsSync).mockReturnValue(false);
      vi.mocked(mkdirSync).mockReturnValue(undefined);
      vi.mocked(executeATKCommand).mockResolvedValue(
        createMockCLIResult({
          success: false,
          stdout: '',
          stderr: 'ATK command failed',
          exitCode: 1
        })
      );

      const result = await executeNewTool({
        name: 'test-agent',
        template: ATKTemplate.DECLARATIVE_AGENT,
        format: DeclarativeAgentFormat.TYPESPEC
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('ATKCommandFailed');
    });
  });

  describe('Success message content', () => {
    it('should include VS Code workspace instructions', async () => {
      vi.mocked(existsSync).mockReturnValue(false);
      vi.mocked(mkdirSync).mockReturnValue(undefined);
      vi.mocked(executeATKCommand).mockResolvedValue(createMockCLIResult());

      const result = await executeNewTool({
        name: 'test-agent',
        template: ATKTemplate.DECLARATIVE_AGENT,
        format: DeclarativeAgentFormat.TYPESPEC
      });

      expect(result.content[0].text).toContain('VS CODE / GITHUB COPILOT');
      expect(result.content[0].text).toContain('OPEN THIS WORKSPACE');
    });

    it('should include warning about generated files', async () => {
      vi.mocked(existsSync).mockReturnValue(false);
      vi.mocked(mkdirSync).mockReturnValue(undefined);
      vi.mocked(executeATKCommand).mockResolvedValue(createMockCLIResult());

      const result = await executeNewTool({
        name: 'test-agent',
        template: ATKTemplate.DECLARATIVE_AGENT,
        format: DeclarativeAgentFormat.TYPESPEC
      });

      expect(result.content[0].text).toContain('DO NOT EDIT THESE GENERATED FILES');
      expect(result.content[0].text).toContain('manifest.json');
      expect(result.content[0].text).toContain('declarativeAgent.json');
      expect(result.content[0].text).toContain('.generated');
    });

    it('should list editable files', async () => {
      vi.mocked(existsSync).mockReturnValue(false);
      vi.mocked(mkdirSync).mockReturnValue(undefined);
      vi.mocked(executeATKCommand).mockResolvedValue(createMockCLIResult());

      const result = await executeNewTool({
        name: 'test-agent',
        template: ATKTemplate.DECLARATIVE_AGENT,
        format: DeclarativeAgentFormat.TYPESPEC
      });

      expect(result.content[0].text).toContain('Files You CAN Edit');
      expect(result.content[0].text).toContain('TypeSpec source files');
      expect(result.content[0].text).toContain('.env files');
    });

    it('should include cd command for command line', async () => {
      const defaultDir = join(homedir(), 'AgentsToolkitProjects');
      const projectPath = join(defaultDir, 'test-agent');

      vi.mocked(existsSync).mockReturnValue(false);
      vi.mocked(mkdirSync).mockReturnValue(undefined);
      vi.mocked(executeATKCommand).mockResolvedValue(createMockCLIResult());

      const result = await executeNewTool({
        name: 'test-agent',
        template: ATKTemplate.DECLARATIVE_AGENT,
        format: DeclarativeAgentFormat.TYPESPEC
      });

      expect(result.content[0].text).toContain(`cd ${projectPath}`);
    });
  });
});
