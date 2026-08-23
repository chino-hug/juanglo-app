"use client";

import { useState } from "react";
import { IconChevronDown } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

export function FilterDisclosure({
  label,
  summary,
  defaultOpen = false,
  children,
}: {
  label: string;
  summary?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border border-ink">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left"
      >
        <span className="field-label">{label}</span>
        <span className="flex items-center gap-2">
          {summary && <span className="tabular text-xs text-concrete">{summary}</span>}
          <IconChevronDown
            width={16}
            height={16}
            className={cn("shrink-0 text-concrete transition-transform", open && "rotate-180")}
          />
        </span>
      </button>
      {open && <div className="flex flex-wrap gap-2 border-t border-ink p-3">{children}</div>}
    </div>
  );
}
