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
  const [openUpward, setOpenUpward] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // The bottom tab bar is a fixed overlay (~56px), not part of document
  // flow, so it never "pushes" — nothing below the fold makes room for it
  // automatically. Instead: measure space below the trigger before
  // opening, and flip the panel above the trigger when there isn't enough
  // room, so it always lands fully inside the scrollable content and never
  // has to render under (or fight z-index with) the tab bar.
  const TAB_BAR_RESERVE = 72;
  const PANEL_MAX_HEIGHT = 256; // matches max-h-64

  function toggleOpen() {
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom - TAB_BAR_RESERVE;
      setOpenUpward(spaceBelow < PANEL_MAX_HEIGHT);
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
          className={cn(
            "absolute z-50 max-h-64 w-full overflow-auto border border-ink bg-base shadow-tag",
            openUpward ? "bottom-full mb-1" : "top-full mt-1",
          )}
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
