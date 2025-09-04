import { useEffect } from 'react';

interface KeyboardShortcuts {
  onAddTransaction?: () => void;
  onExport?: () => void;
  onToggleTheme?: () => void;
  onUndo?: () => void;
}

export function useKeyboardShortcuts({
  onAddTransaction,
  onExport,
  onToggleTheme,
  onUndo
}: KeyboardShortcuts) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (event.target instanceof HTMLInputElement || 
          event.target instanceof HTMLTextAreaElement || 
          event.target instanceof HTMLSelectElement) {
        return;
      }

      // Check for modifier keys
      const isCtrlOrCmd = event.ctrlKey || event.metaKey;

      if (event.key === 'a' && !isCtrlOrCmd) {
        event.preventDefault();
        onAddTransaction?.();
      } else if (event.key === 'e' && !isCtrlOrCmd) {
        event.preventDefault();
        onExport?.();
      } else if (event.key === 't' && !isCtrlOrCmd) {
        event.preventDefault();
        onToggleTheme?.();
      } else if (event.key === 'z' && isCtrlOrCmd) {
        event.preventDefault();
        onUndo?.();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onAddTransaction, onExport, onToggleTheme, onUndo]);
}