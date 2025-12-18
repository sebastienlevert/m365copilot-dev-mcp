/**
 * Output formatting utilities
 * Handles cleaning and formatting CLI output
 */

import stripAnsi from 'strip-ansi';

/**
 * Clean CLI output by removing ANSI escape codes and special characters
 * @param output Raw CLI output
 * @returns Cleaned output suitable for display
 */
export function cleanCLIOutput(output: string): string {
  // Strip ANSI escape codes (colors, cursor movements, etc.)
  let cleaned = stripAnsi(output);

  // Remove common terminal control sequences that strip-ansi might miss
  // Remove CSI sequences: ESC [ ... (various control sequences)
  cleaned = cleaned.replace(/\x1B\[[0-9;]*[A-Za-z]/g, '');

  // Remove OSC sequences: ESC ] ... BEL or ESC ] ... ESC \
  cleaned = cleaned.replace(/\x1B\][^\x07]*\x07/g, '');
  cleaned = cleaned.replace(/\x1B\][^\x1B]*\x1B\\/g, '');

  // Remove other escape sequences
  cleaned = cleaned.replace(/\x1B[^[]/g, '');

  // Remove carriage returns without newlines (used for progress bars)
  cleaned = cleaned.replace(/\r(?!\n)/g, '\n');

  // Remove multiple consecutive blank lines (keep max 2)
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

  // Trim leading and trailing whitespace
  cleaned = cleaned.trim();

  return cleaned;
}

/**
 * Extract progress information from CLI output
 * @param output Raw CLI output
 * @returns Array of progress lines
 */
export function extractProgress(output: string): string[] {
  const cleaned = cleanCLIOutput(output);
  const lines = cleaned.split('\n');

  // Filter for lines that look like progress information
  return lines.filter(line => {
    const trimmed = line.trim();
    return trimmed.length > 0 && (
      trimmed.includes('%') ||
      trimmed.includes('Done:') ||
      trimmed.includes('Executing') ||
      trimmed.match(/^\(\d+\/\d+\)/) ||
      trimmed.includes('✔') ||
      trimmed.includes('√')
    );
  });
}
