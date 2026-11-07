/** A plain left click opens our view; Ctrl/Cmd/Shift/Alt/middle clicks keep the browser's own behavior. */
export function isPlainClick(event: MouseEvent): boolean {
  return event.button === 0 && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey;
}
