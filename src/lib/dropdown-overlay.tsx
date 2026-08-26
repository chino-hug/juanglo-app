"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

// Coordinates floating panels (Select's options list, the notification
// bell) with the fixed bottom tab bar. Rather than computing exact space
// and hoping a panel fits above/below it, any panel that opens registers
// itself here and the tab bar slides fully off-screen for as long as at
// least one panel is open — so overlap is structurally impossible instead
// of being avoided by (fallible) measurement.
const DropdownOverlayContext = createContext<{
  openCount: number;
  registerOpen: (open: boolean) => void;
} | null>(null);

export function DropdownOverlayProvider({ children }: { children: React.ReactNode }) {
  const [openCount, setOpenCount] = useState(0);

  const registerOpen = useCallback((open: boolean) => {
    setOpenCount((count) => Math.max(0, count + (open ? 1 : -1)));
  }, []);

  const value = useMemo(() => ({ openCount, registerOpen }), [openCount, registerOpen]);

  return (
    <DropdownOverlayContext.Provider value={value}>{children}</DropdownOverlayContext.Provider>
  );
}

/** Call with the panel's own open/closed boolean; registers/unregisters automatically. */
export function useRegisterDropdownOpen(open: boolean) {
  const ctx = useContext(DropdownOverlayContext);
  // Outside a provider, no-op — lets components using this hook stay safe
  // to render in isolation (e.g. Storybook, tests) without crashing.
  const registerOpen = ctx?.registerOpen;
  useEffect(() => {
    if (!registerOpen || !open) return;
    registerOpen(true);
    return () => registerOpen(false);
  }, [open, registerOpen]);
}

/** Call from the tab bar to know whether it should slide out of the way. */
export function useAnyDropdownOpen() {
  const ctx = useContext(DropdownOverlayContext);
  return (ctx?.openCount ?? 0) > 0;
}
