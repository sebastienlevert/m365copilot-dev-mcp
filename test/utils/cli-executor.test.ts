/**
 * Tests for CLI executor utility
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { executeATKCommand } from '../../src/utils/cli-executor.js';
import { resetAllMocks } from '../setup.js';
import { EventEmitter } from 'events';

// Mock child_process
vi.mock('child_process', () => ({
  spawn: vi.fn()
}));

import { spawn } from 'child_process';

describe('CLI Executor', () => {
  beforeEach(() => {
    resetAllMocks();
  });

  function createMockChildProcess(options: {
    stdout?: string;
    stderr?: string;
    exitCode?: number;
    error?: Error;
  } = {}) {
    const mockProcess = new EventEmitter() as any;
    mockProcess.stdout = new EventEmitter();
    mockProcess.stderr = new EventEmitter();
    mockProcess.kill = vi.fn();

    // Simulate process execution
    setTimeout(() => {
      if (options.stdout) {
        mockProcess.stdout.emit('data', Buffer.from(options.stdout));
      }
      if (options.stderr) {
        mockProcess.stderr.emit('data', Buffer.from(options.stderr));
      }
      if (options.error) {
        mockProcess.emit('error', options.error);
      } else {
        mockProcess.emit('close', options.exitCode ?? 0);
      }
    }, 10);

    return mockProcess;
  }

  describe('Command execution', () => {
    it('should execute command successfully', async () => {
      const mockProcess = createMockChildProcess({
        stdout: 'Command output',
        exitCode: 0
      });

      vi.mocked(spawn).mockReturnValue(mockProcess);

      const result = await executeATKCommand({
        command: 'atk',
        args: ['doctor'],
        timeout: 1000
      });

      expect(result.success).toBe(true);
      expect(result.stdout).toContain('Command output');
      expect(result.exitCode).toBe(0);
    });

    it('should handle command errors', async () => {
      const mockProcess = createMockChildProcess({
        stderr: 'Error message',
        exitCode: 1
      });

      vi.mocked(spawn).mockReturnValue(mockProcess);

      const result = await executeATKCommand({
        command: 'atk',
        args: ['doctor'],
        timeout: 1000
      });

      expect(result.success).toBe(false);
      expect(result.stderr).toContain('Error message');
      expect(result.exitCode).toBe(1);
    });

    it('should handle spawn errors (command not found)', async () => {
      const mockProcess = createMockChildProcess({
        error: new Error('ENOENT: command not found')
      });

      vi.mocked(spawn).mockReturnValue(mockProcess);

      const result = await executeATKCommand({
        command: 'invalid-command',
        args: [],
        timeout: 1000
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain('ENOENT');
    });

    it('should build correct command with npx for atk', async () => {
      const mockProcess = createMockChildProcess({ exitCode: 0 });
      vi.mocked(spawn).mockReturnValue(mockProcess);

      await executeATKCommand({
        command: 'atk',
        args: ['new', '--app-name', 'test'],
        timeout: 1000
      });

      expect(spawn).toHaveBeenCalled();
      const spawnCall = vi.mocked(spawn).mock.calls[0];
      const commandArgs = spawnCall[1];

      // commandArgs is ['-c', 'full command string']
      // The actual command is in commandArgs[1]
      const fullCommand = commandArgs[1];

      // Should build: npx --yes -p @microsoft/m365agentstoolkit-cli@latest atk new --app-name test
      expect(fullCommand).toContain('npx');
      expect(fullCommand).toContain('@microsoft/m365agentstoolkit-cli@latest');
      expect(fullCommand).toContain('atk');
      expect(fullCommand).toContain('new');
      expect(fullCommand).toContain('--app-name');
      expect(fullCommand).toContain('test');
    });
  });

  describe('Timeout handling', () => {
    it('should timeout if command takes too long', async () => {
      // Create a mock process that never completes on its own
      const mockProcess = new EventEmitter() as any;
      mockProcess.stdout = new EventEmitter();
      mockProcess.stderr = new EventEmitter();
      mockProcess.kill = vi.fn((signal) => {
        // When killed, emit close event after a short delay
        setTimeout(() => {
          mockProcess.emit('close', -1);
        }, 10);
      });
      mockProcess.killed = false;

      vi.mocked(spawn).mockReturnValue(mockProcess);

      const resultPromise = executeATKCommand({
        command: 'atk',
        args: ['doctor'],
        timeout: 50 // Very short timeout
      });

      const result = await resultPromise;

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.message).toMatch(/timed\s+out/i);

      // Verify process was killed
      expect(mockProcess.kill).toHaveBeenCalled();
    }, 10000);
  });

  describe('Cross-platform shell handling', () => {
    it('should use appropriate shell for platform', async () => {
      const mockProcess = createMockChildProcess({ exitCode: 0 });
      vi.mocked(spawn).mockReturnValue(mockProcess);

      await executeATKCommand({
        command: 'atk',
        args: ['doctor'],
        timeout: 1000
      });

      expect(spawn).toHaveBeenCalled();
      const spawnCall = vi.mocked(spawn).mock.calls[0];
      const shellCommand = spawnCall[0];

      // Should use sh or cmd depending on platform
      expect(['sh', 'cmd'].some(cmd => shellCommand.includes(cmd))).toBe(true);
    });
  });
});
