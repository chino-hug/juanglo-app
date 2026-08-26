"use client";

import { useEffect, useRef, useState } from "react";
import { IconChevronDown } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

// A native <select>'s closed control can be styled, but its open options
// panel is drawn by the OS and ignores our CSS entirely — on mobile that
// panel shows up as a generic dark system sheet with no relation to the
// app's world. This renders both states ourselves, in the field-input
// language, and mirrors the value into a hidden input so it still posts
// through a plain <form action={serverAction}> like a native select would.
export function Select({
  name,
  value,
  onChange,
  options,
  placeholder = "Elegí una opción…",
  required,
  disabled,
  ariaLabel,
  id,
  className,
}: {
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  ariaLabel?: string;
  id?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [panelMaxHeight, setPanelMaxHeight] = useState<number | undefined>(undefined);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Always opens downward — but the fixed tab bar (~56px) means the space
  // below the trigger isn't necessarily all usable. Rather than flipping
  // the panel upward (which just trades one overlap for a worse one, e.g.
  // covering the field it belongs to) or hiding the tab bar, cap the
  // panel's own height to whatever room genuinely exists above the tab
  // bar and let its existing overflow-auto handle the rest by scrolling
  // internally. The tab bar stays put and visible; the panel never reaches it.
  const TAB_BAR_RESERVE = 64;
  const EDGE_MARGIN = 8;
  const MIN_PANEL_HEIGHT = 96;
  const DEFAULT_MAX_HEIGHT = 256; // matches max-h-64, used while nothing's measured yet

  function toggleOpen() {
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom - TAB_BAR_RESERVE - EDGE_MARGIN;
      setPanelMaxHeight(Math.max(MIN_PANEL_HEIGHT, Math.min(spaceBelow, DEFAULT_MAX_HEIGHT)));
    }
    setOpen((v) => !v);
  }

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <input type="hidden" name={name} value={value} required={required} />
      <button
        ref={buttonRef}
        id={id}
        type="button"
        disabled={disabled}
        onClick={toggleOpen}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        className="field-input flex w-full items-center justify-between gap-2 text-left disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className={cn("truncate", !selected && "text-concrete")}>
          {selected?.label ?? placeholder}
        </span>
        <IconChevronDown
          width={16}
          height={16}
          className={cn("shrink-0 text-concrete transition-transform", open && "rotate-180")}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          style={{ maxHeight: panelMaxHeight ?? DEFAULT_MAX_HEIGHT }}
          className="absolute top-full z-50 mt-1 w-full overflow-auto border border-ink bg-base shadow-tag"
        >
          {options.length === 0 && (
            <li className="px-3 py-2 text-sm text-concrete">Sin opciones</li>
          )}
          {options.map((o) => (
            <li key={o.value} role="option" aria-selected={o.value === value} aria-disabled={o.disabled}>
              <button
                type="button"
                disabled={o.disabled}
                onClick={() => {
                  if (o.disabled) return;
                  onChange(o.value);
                  setOpen(false);
                }}
                className={cn(
                  "block w-full px-3 py-2 text-left text-sm",
                  o.disabled ? "cursor-not-allowed text-steel" : "hover:bg-steel-light",
                )}
              >
                {o.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
