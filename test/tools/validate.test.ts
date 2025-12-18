/**
 * Tests for atk_validate tool
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { executeValidateTool, ValidateSchema } from '../../src/tools/validate.js';
import { resetAllMocks, createMockCLIResult } from '../setup.js';

// Mock dependencies
vi.mock('../../src/utils/cli-executor.js', () => ({
  executeATKCommand: vi.fn()
}));

vi.mock('fs', () => ({
  existsSync: vi.fn()
}));

import { executeATKCommand } from '../../src/utils/cli-executor.js';
import { existsSync } from 'fs';

describe('atk_validate tool', () => {
  beforeEach(() => {
    resetAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Schema validation', () => {
    it('should validate with projectPath', () => {
      const input = { projectPath: './my-agent' };
      const result = ValidateSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should accept optional parameters', () => {
      const input = {
        projectPath: './my-agent',
        manifestPath: './custom-manifest.json',
        environment: 'dev'
      };
      const result = ValidateSchema.safeParse(input);
      expect(result.success).toBe(true);
    });
  });

  describe('Project validation', () => {
    it('should validate project successfully', async () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(executeATKCommand).mockResolvedValue(
        createMockCLIResult({ stdout: 'Validation passed' })
      );

      const result = await executeValidateTool({ projectPath: './my-agent' });

      expect(executeATKCommand).toHaveBeenCalledWith(
        expect.objectContaining({
          command: 'atk',
          args: expect.arrayContaining(['validate'])
        })
      );
      expect(result.isError).toBeFalsy();
      expect(result.content[0].text).toContain('Validation passed successfully');
    });

    it('should handle validation errors', async () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(executeATKCommand).mockResolvedValue(
        createMockCLIResult({
          success: false,
          stderr: 'Validation failed: Invalid manifest',
          exitCode: 1
        })
      );

      const result = await executeValidateTool({ projectPath: './my-agent' });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Validation failed');
    });
  });
});
