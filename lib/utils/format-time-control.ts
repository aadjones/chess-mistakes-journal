/**
 * Formats time control from seconds to minutes for human readability.
 *
 * Examples:
 * - "180+2" -> "3+2" (3 minutes + 2 second increment)
 * - "300+0" -> "5+0" (5 minutes)
 * - "600" -> "10" (10 minutes, no increment)
 * - "180" -> "3" (3 minutes)
 *
 * @param timeControl - Time control string in seconds (e.g., "180+2")
 * @returns Formatted time control in minutes (e.g., "3+2")
 */
export function formatTimeControl(timeControl: string | null | undefined): string {
  if (!timeControl) return '';

  const parts = timeControl.split('+');

  if (parts.length === 2) {
    // Format with increment (e.g., "180+2" -> "3+2")
    const minutes = Math.floor(parseInt(parts[0]) / 60);
    const increment = parts[1];
    return `${minutes}+${increment}`;
  }

  // Format without increment (e.g., "180" -> "3")
  if (!timeControl.includes('+')) {
    const minutes = Math.floor(parseInt(timeControl) / 60);
    return `${minutes}`;
  }

  // Return as-is if format is unexpected
  return timeControl;
}
