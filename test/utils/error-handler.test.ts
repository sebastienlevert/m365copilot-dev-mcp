/**
 * Tests for error handler utility
 */

import { describe, it, expect } from 'vitest';
import {
  createErrorResult,
  createSuccessResult,
  createErrorFromCLIResult
} from '../../src/utils/error-handler.js';
import { createMockCLIResult } from '../setup.js';

describe('Error Handler', () => {
  describe('createErrorResult', () => {
    it('should create structured error result', () => {
      const error = {
        error: 'ValidationError',
        reason: 'Invalid input',
        suggestion: 'Check your parameters',
        documentation: 'atk://docs/validation'
      };

      const result = createErrorResult(error);

      expect(result.isError).toBe(true);
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('ValidationError');
      expect(result.content[0].text).toContain('Invalid input');
      expect(result.content[0].text).toContain('Check your parameters');
    });

    it('should include details if provided', () => {
      const error = {
        error: 'TestError',
        reason: 'Test failed',
        suggestion: 'Try again',
        details: { code: 'ERR_123', file: 'test.ts' }
      };

      const result = createErrorResult(error);

      expect(result.content[0].text).toContain('ERR_123');
      expect(result.content[0].text).toContain('test.ts');
    });
  });

  describe('createSuccessResult', () => {
    it('should create success result', () => {
      const message = 'Operation completed successfully';

      const result = createSuccessResult(message);

      expect(result.isError).toBeFalsy(); // Should be false or undefined
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toBe(message);
    });
  });

  describe('createErrorFromCLIResult', () => {
    it('should create error from failed CLI result', () => {
      const cliResult = createMockCLIResult({
        success: false,
        stdout: 'Some output',
        stderr: 'Error occurred',
        exitCode: 1
      });

      const result = createErrorFromCLIResult(cliResult, 'Test operation');

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('ATKCommandFailed');
      expect(result.content[0].text).toContain('Test operation');
      expect(result.content[0].text).toContain('exit code 1');
    });

    it('should include stderr in error details', () => {
      const cliResult = createMockCLIResult({
        success: false,
        stderr: 'Command not found',
        exitCode: 127
      });

      const result = createErrorFromCLIResult(cliResult, 'Command execution');

      expect(result.content[0].text).toContain('Command not found');
    });

    it('should suggest running atk_doctor', () => {
      const cliResult = createMockCLIResult({
        success: false,
        stderr: 'Node.js not found',
        exitCode: 1
      });

      const result = createErrorFromCLIResult(cliResult, 'Prerequisites');

      expect(result.content[0].text).toContain('atk_doctor');
    });
  });
});
