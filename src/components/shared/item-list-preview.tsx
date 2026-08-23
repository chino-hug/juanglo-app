"use client";

import { useState } from "react";
import { IconChevronDown } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

const COLLAPSED_COUNT = 2;

export function ItemListPreview({
  items,
}: {
  items: { id: string; productName: string; quantity: number }[];
}) {
  const [expanded, setExpanded] = useState(false);
  const canCollapse = items.length > COLLAPSED_COUNT;
  const visible = expanded || !canCollapse ? items : items.slice(0, COLLAPSED_COUNT);

  return (
    <div className="border-t border-dashed border-steel pt-2">
      <ul className="text-sm">
        {visible.map((item) => (
          <li key={item.id} className="flex justify-between">
            <span>{item.productName}</span>
            <span className="tabular text-concrete">×{item.quantity}</span>
          </li>
        ))}
      </ul>
      {canCollapse && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setExpanded((v) => !v);
          }}
          className="mt-1.5 flex items-center gap-1 font-mono text-[11px] uppercase tracking-wide text-concrete"
        >
          <IconChevronDown
            width={12}
            height={12}
            className={cn("transition-transform", expanded && "rotate-180")}
          />
          {expanded ? "Mostrar menos" : `Ver los ${items.length} productos`}
        </button>
      )}
    </div>
  );
}
