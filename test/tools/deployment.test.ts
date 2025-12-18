/**
 * Tests for deployment tools (provision, deploy, package, publish)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { executeProvisionTool } from '../../src/tools/provision.js';
import { executeDeployTool } from '../../src/tools/deploy.js';
import { executePackageTool } from '../../src/tools/package.js';
import { executePublishTool } from '../../src/tools/publish.js';
import { resetAllMocks, createMockCLIResult } from '../setup.js';

vi.mock('../../src/utils/cli-executor.js', () => ({
  executeATKCommand: vi.fn()
}));

vi.mock('fs', () => ({
  existsSync: vi.fn()
}));

import { executeATKCommand } from '../../src/utils/cli-executor.js';
import { existsSync } from 'fs';

describe('Deployment tools', () => {
  beforeEach(() => {
    resetAllMocks();
  });

  describe('atk_provision', () => {
    it('should provision resources successfully', async () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(executeATKCommand).mockResolvedValue(
        createMockCLIResult({ stdout: 'Resources provisioned' })
      );

      const result = await executeProvisionTool({
        projectPath: './my-agent',
        environment: 'dev'
      });

      expect(executeATKCommand).toHaveBeenCalledWith(
        expect.objectContaining({
          command: 'atk',
          args: expect.arrayContaining([
            'provision',
            '--env', 'dev'
          ]),
          timeout: 600000
        })
      );
      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Successfully provisioned cloud resources');
    });

    it('should handle provisioning errors', async () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(executeATKCommand).mockResolvedValue(
        createMockCLIResult({
          success: false,
          stderr: 'Subscription not found',
          exitCode: 1
        })
      );

      const result = await executeProvisionTool({
        projectPath: './my-agent',
        environment: 'dev'
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('SubscriptionNotFound');
    });

    it('should use default environment if not specified', async () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(executeATKCommand).mockResolvedValue(createMockCLIResult());

      await executeProvisionTool({ projectPath: './my-agent' });

      expect(executeATKCommand).toHaveBeenCalledWith(
        expect.objectContaining({
          args: expect.arrayContaining(['--env', 'local'])
        })
      );
    });
  });

  describe('atk_deploy', () => {
    it('should deploy code successfully', async () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(executeATKCommand).mockResolvedValue(
        createMockCLIResult({ stdout: 'Deployment completed' })
      );

      const result = await executeDeployTool({
        projectPath: './my-agent',
        environment: 'dev'
      });

      expect(executeATKCommand).toHaveBeenCalledWith(
        expect.objectContaining({
          command: 'atk',
          args: expect.arrayContaining([
            'deploy',
            '--env', 'dev'
          ]),
          timeout: 600000
        })
      );
      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Successfully deployed application');
    });

    it('should handle deployment errors', async () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(executeATKCommand).mockResolvedValue(
        createMockCLIResult({
          success: false,
          stderr: 'Build failed',
          exitCode: 1
        })
      );

      const result = await executeDeployTool({
        projectPath: './my-agent',
        environment: 'dev'
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('BuildFailed');
    });
  });

  describe('atk_package', () => {
    it('should package app successfully', async () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(executeATKCommand).mockResolvedValue(
        createMockCLIResult({ stdout: 'Package created' })
      );

      const result = await executePackageTool({
        projectPath: './my-agent',
        environment: 'prod'
      });

      expect(executeATKCommand).toHaveBeenCalledWith(
        expect.objectContaining({
          command: 'atk',
          args: expect.arrayContaining([
            'package',
            '--env', 'prod'
          ]),
          timeout: 120000
        })
      );
      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Successfully created app package');
    });

    it('should use default environment if not specified', async () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(executeATKCommand).mockResolvedValue(createMockCLIResult());

      await executePackageTool({ projectPath: './my-agent' });

      expect(executeATKCommand).toHaveBeenCalledWith(
        expect.objectContaining({
          args: expect.arrayContaining(['--env', 'local'])
        })
      );
    });
  });

  describe('atk_publish', () => {
    it('should publish app successfully', async () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(executeATKCommand).mockResolvedValue(
        createMockCLIResult({ stdout: 'App published' })
      );

      const result = await executePublishTool({
        projectPath: './my-agent',
        environment: 'prod'
      });

      expect(executeATKCommand).toHaveBeenCalledWith(
        expect.objectContaining({
          command: 'atk',
          args: expect.arrayContaining([
            'publish',
            '--env', 'prod'
          ]),
          timeout: 300000
        })
      );
      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('Successfully published application');
    });

    it('should use default environment if not specified', async () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(executeATKCommand).mockResolvedValue(createMockCLIResult());

      await executePublishTool({ projectPath: './my-agent' });

      expect(executeATKCommand).toHaveBeenCalledWith(
        expect.objectContaining({
          args: expect.arrayContaining(['--env', 'prod'])
        })
      );
    });
  });
});
