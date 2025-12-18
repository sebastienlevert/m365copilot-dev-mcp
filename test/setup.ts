/**
 * Test setup and utilities
 */

import { vi } from 'vitest';
import type { Mock } from 'vitest';

// Mock file system operations
export const mockFs = {
  existsSync: vi.fn(),
  mkdirSync: vi.fn(),
  readFileSync: vi.fn(),
  writeFileSync: vi.fn()
};

// Mock child_process
export const mockSpawn = vi.fn();

// Mock CLI execution result
export interface MockCLIResult {
  success: boolean;
  stdout: string;
  stderr: string;
  exitCode: number;
  error?: Error;
}

export function createMockCLIResult(overrides: Partial<MockCLIResult> = {}): MockCLIResult {
  return {
    success: true,
    stdout: 'Command executed successfully',
    stderr: '',
    exitCode: 0,
    ...overrides
  };
}

// Mock tool result
export function createMockToolResult(text: string, isError = false) {
  return {
    content: [
      {
        type: 'text',
        text
      }
    ],
    isError
  };
}

// Reset all mocks
export function resetAllMocks() {
  vi.clearAllMocks();
  Object.values(mockFs).forEach(mock => (mock as Mock).mockReset());
  mockSpawn.mockReset();
}

// Setup console error mock (since logger uses console.error)
export const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
