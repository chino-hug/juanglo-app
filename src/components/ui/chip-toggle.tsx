import Link from "next/link";
import { IconCheck } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

// A filter option rendered as a chip: plain when unselected, solid black
// with a leading checkmark when selected, or a grey inert span when picking
// it would zero out the list under the other active filters.
export function ChipToggle({
  href,
  label,
  selected,
  disabled,
}: {
  href: string;
  label: string;
  selected: boolean;
  disabled?: boolean;
}) {
  if (disabled) {
    return (
      <span
        aria-disabled="true"
        className="inline-flex cursor-not-allowed items-center gap-1.5 border border-ink px-3 py-1.5 font-mono text-xs uppercase tracking-wide opacity-40"
      >
        {label}
      </span>
    );
  }

  return (
    <Link
      href={href}
      aria-pressed={selected}
      className={cn(
        "inline-flex items-center gap-1.5 border border-ink px-3 py-1.5 font-mono text-xs uppercase tracking-wide transition-colors",
        selected ? "bg-ink text-base" : "bg-base text-ink hover:bg-steel-light",
      )}
    >
      {selected && <IconCheck width={13} height={13} className="shrink-0" />}
      {label}
    </Link>
  );
}
