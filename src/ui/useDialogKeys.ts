// Keyboard rules for our dialogs (layout-spec 8): Esc closes, Tab stays inside.
// Only the dialog on top listens, so one Esc closes one layer.

import { useEffect } from 'preact/hooks';

export function useDialogKeys(
  /** The dialog's element; empty until it is drawn. */
  panel: { readonly current: HTMLElement | null },
  active: boolean,
  onClose: () => void,
): void {
  useEffect(() => {
    if (!active) {
      return;
    }
    const onKey = (event: KeyboardEvent) => {
      const element = panel.current;
      if (!element) {
        return;
      }
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab') {
        return;
      }
      const focusable = Array.from(
        element.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select, [tabindex="0"]',
        ),
      );
      const first = focusable[0];
      const last = focusable.at(-1);
      const active = (element.getRootNode() as Document | ShadowRoot).activeElement;
      if (!first || !last) {
        event.preventDefault();
      } else if (event.shiftKey && (active === first || active === element)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
    };
  }, [panel, active, onClose]);
}
