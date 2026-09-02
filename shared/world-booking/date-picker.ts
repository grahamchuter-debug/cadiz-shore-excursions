/** Feature-detect native `HTMLInputElement.showPicker()` (Chromium, Safari 16+). */
export function inputSupportsShowPicker(input: HTMLInputElement): boolean {
  return typeof input.showPicker === "function";
}

/**
 * Focus the native date input and open its picker when the browser allows.
 * Safe fallback: focus + programmatic click (no throw if showPicker is missing).
 */
export function openNativeDatePicker(input: HTMLInputElement): void {
  input.focus({ preventScroll: true });
  if (inputSupportsShowPicker(input)) {
    try {
      input.showPicker();
      return;
    } catch {
      // Already open, unsupported state, or non-user-gesture — fall through.
    }
  }
  input.click();
}
