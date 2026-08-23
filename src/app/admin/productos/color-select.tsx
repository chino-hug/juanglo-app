"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { IconChevronDown } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

// Scoped to whatever list it's given (a category's palette on the product
// form, or the global registry on the category form) — not every scope
// takes the same colors. Picking one closes the dropdown and drops it from
// the list (it's already added); loading brand-new colors happens in their
// own screen, never here, so this component never mutates its source list.
export function ColorSelect({
  id,
  name,
  availableColors,
  initial = [],
  emptyStateHref,
  emptyStateLinkLabel,
  emptyStateMessage = "No hay colores cargados todavía",
}: {
  id?: string;
  name: string;
  availableColors: string[];
  initial?: string[];
  emptyStateHref?: string;
  emptyStateLinkLabel?: string;
  emptyStateMessage?: string;
}) {
  const [selected, setSelected] = useState<string[]>(initial);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

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

  function select(color: string) {
    setSelected((prev) => [...prev, color]);
    setOpen(false);
  }

  function remove(color: string) {
    setSelected((prev) => prev.filter((c) => c !== color));
  }

  const remaining = availableColors.filter((c) => !selected.includes(c));

  return (
    <div className="flex flex-col gap-2">
      <input type="hidden" name={name} value={JSON.stringify(selected)} />

      {selected.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {selected.map((color) => (
            <li
              key={color}
              className="flex items-center gap-1.5 border border-ink px-2 py-1 font-mono text-[11px] uppercase tracking-wide"
            >
              {color}
              <button
                type="button"
                onClick={() => remove(color)}
                aria-label={`Quitar ${color}`}
                className="text-concrete hover:text-safety"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      <div ref={rootRef} className="relative">
        <button
          id={id}
          type="button"
          onClick={() => setOpen((v) => !v)}
          disabled={availableColors.length === 0}
          aria-haspopup="listbox"
          aria-expanded={open}
          className="field-input flex w-full items-center justify-between gap-2 text-left disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="truncate text-concrete">
            {availableColors.length === 0 ? emptyStateMessage : "+ Agregar color"}
          </span>
          <IconChevronDown
            width={16}
            height={16}
            className={cn("shrink-0 text-concrete transition-transform", open && "rotate-180")}
          />
        </button>

        {open && (
          <ul role="listbox" className="absolute z-30 mt-1 max-h-56 w-full overflow-auto border border-ink bg-base shadow-tag">
            {remaining.length === 0 ? (
              <li className="px-3 py-2 text-sm text-concrete">Ya agregaste todos los colores disponibles.</li>
            ) : (
              remaining.map((color) => (
                <li key={color} role="option" aria-selected={false}>
                  <button
                    type="button"
                    onClick={() => select(color)}
                    className="block w-full px-3 py-2 text-left text-sm hover:bg-steel-light"
                  >
                    {color}
                  </button>
                </li>
              ))
            )}
          </ul>
        )}
      </div>

      {availableColors.length === 0 && emptyStateHref && (
        <Link
          href={emptyStateHref}
          className="self-start font-mono text-[10px] uppercase tracking-wide text-concrete underline"
        >
          {emptyStateLinkLabel}
        </Link>
      )}
    </div>
  );
}
