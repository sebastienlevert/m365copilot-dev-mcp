/**
 * Tests for atk_doctor tool
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { executeDoctorTool, DoctorSchema } from '../../src/tools/doctor.js';
import { resetAllMocks, createMockCLIResult } from '../setup.js';

vi.mock('../../src/utils/cli-executor.js', () => ({
  executeATKCommand: vi.fn()
}));

import { executeATKCommand } from '../../src/utils/cli-executor.js';

describe('atk_doctor tool', () => {
  beforeEach(() => {
    resetAllMocks();
  });

  describe('Schema validation', () => {
    it('should validate with verbose flag', () => {
      const result = DoctorSchema.safeParse({ verbose: true });
      expect(result.success).toBe(true);
    });

    it('should default verbose to false', () => {
      const result = DoctorSchema.parse({});
      expect(result.verbose).toBe(false);
    });
  });

  describe('Prerequisites check', () => {
    it('should check prerequisites successfully', async () => {
      vi.mocked(executeATKCommand).mockResolvedValue(
        createMockCLIResult({ stdout: 'All prerequisites met' })
      );

      const result = await executeDoctorTool({ verbose: false });

      expect(executeATKCommand).toHaveBeenCalledWith(
        expect.objectContaining({
          command: 'atk',
          args: ['doctor']
        })
      );
      expect(result.isError).toBe(false);
    });

    it('should report missing prerequisites', async () => {
      vi.mocked(executeATKCommand).mockResolvedValue(
        createMockCLIResult({
          success: false,
          stderr: 'Node.js not found',
          exitCode: 1
        })
      );

      const result = await executeDoctorTool({ verbose: false });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('ATKCommandFailed');
      expect(result.content[0].text).toContain('System diagnostics check');
    });
  });
});
