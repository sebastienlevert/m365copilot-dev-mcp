/**
 * Tests for atk_version tool
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { executeVersionTool, VersionSchema } from '../../src/tools/version.js';
import { resetAllMocks, createMockCLIResult } from '../setup.js';

// Mock dependencies
vi.mock('../../src/utils/cli-executor.js', () => ({
  executeATKCommand: vi.fn()
}));

vi.mock('fs', () => ({
  readFileSync: vi.fn(),
  existsSync: vi.fn()
}));

import { executeATKCommand } from '../../src/utils/cli-executor.js';
import { readFileSync } from 'fs';

describe('atk_version tool', () => {
  beforeEach(() => {
    resetAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Schema validation', () => {
    it('should validate valid input', () => {
      const input = {
        verbose: false
      };

      const result = VersionSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should accept checkMinimum parameter', () => {
      const input = {
        checkMinimum: '1.1.0',
        verbose: false
      };

      const result = VersionSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should default verbose to false', () => {
      const input = {};

      const result = VersionSchema.parse(input);
      expect(result.verbose).toBe(false);
    });
  });

  describe('Version check', () => {
    it('should return version information', async () => {
      vi.mocked(executeATKCommand).mockResolvedValue(
        createMockCLIResult({ stdout: '1.1.3' })
      );
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify({ version: '1.1.3' }));

      const result = await executeVersionTool({ verbose: false });

      expect(result.isError).toBeFalsy();
      expect(result.content[0].text).toContain('1.1.3');
      expect(result.content[0].text).toContain('Installed Version');
    });

    it('should pass minimum version check', async () => {
      vi.mocked(executeATKCommand).mockResolvedValue(
        createMockCLIResult({ stdout: '1.2.0' })
      );
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify({ version: '1.2.0' }));

      const result = await executeVersionTool({
        checkMinimum: '1.1.0',
        verbose: false
      });

      expect(result.isError).toBeFalsy();
      expect(result.content[0].text).toContain('Version check passed');
      expect(result.content[0].text).toContain('1.2.0 >= 1.1.0');
    });

    it('should fail minimum version check', async () => {
      vi.mocked(executeATKCommand).mockResolvedValue(
        createMockCLIResult({ stdout: '1.0.0' })
      );

      const result = await executeVersionTool({
        checkMinimum: '1.1.0',
        verbose: false
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('IncompatibleVersion');
      expect(result.content[0].text).toContain('below the minimum required version');
    });

    it('should show verbose information', async () => {
      vi.mocked(executeATKCommand).mockResolvedValue(
        createMockCLIResult({ stdout: '1.1.3' })
      );
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify({ version: '1.1.3' }));

      const result = await executeVersionTool({ verbose: true });

      expect(result.isError).toBeFalsy();
      expect(result.content[0].text).toContain('Raw Output');
      expect(result.content[0].text).toContain('Package Location');
      expect(result.content[0].text).toContain('Major:');
      expect(result.content[0].text).toContain('Minor:');
      expect(result.content[0].text).toContain('Patch:');
    });

    it('should handle version command failure', async () => {
      vi.mocked(executeATKCommand).mockResolvedValue(
        createMockCLIResult({
          success: false,
          stderr: 'ATK not found',
          exitCode: 127
        })
      );

      const result = await executeVersionTool({ verbose: false });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('ATKCommandFailed');
    });
  });

  describe('Version comparison', () => {
    it('should detect older version', async () => {
      vi.mocked(executeATKCommand).mockResolvedValue(
        createMockCLIResult({ stdout: '1.0.0' })
      );
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify({ version: '1.1.3' }));

      const result = await executeVersionTool({ verbose: false });

      expect(result.isError).toBeFalsy();
      expect(result.content[0].text).toContain('older than expected');
    });

    it('should detect newer version', async () => {
      vi.mocked(executeATKCommand).mockResolvedValue(
        createMockCLIResult({ stdout: '1.2.0' })
      );
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify({ version: '1.1.3' }));

      const result = await executeVersionTool({ verbose: false });

      expect(result.isError).toBeFalsy();
      expect(result.content[0].text).toContain('newer than expected');
    });

    it('should detect matching versions', async () => {
      vi.mocked(executeATKCommand).mockResolvedValue(
        createMockCLIResult({ stdout: '1.1.3' })
      );
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify({ version: '1.1.3' }));

      const result = await executeVersionTool({ verbose: false });

      expect(result.isError).toBeFalsy();
      expect(result.content[0].text).toContain('Versions match');
    });
  });
});
