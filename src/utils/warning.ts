/**
 * Prints a warning in the console if it exists.
 *
 * @param message The warning message.
 */
export default function warning(message: string): void {
  /* oxlint-disable no-console */
  if (typeof console !== 'undefined' && typeof console.error === 'function') {
    console.error(message)
  }
  /* oxlint-enable no-console */
  try {
    // This error was thrown as a convenience so that if you enable
    // "break on all exceptions" in your console,
    // it would pause the execution at this line.
    throw new Error(message)
  } catch {} // oxlint-disable-line no-empty
}
