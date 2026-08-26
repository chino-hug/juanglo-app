import { cn } from "@/lib/cn";

/**
 * Wraps a list of <Card>-based <li> items. Mobile keeps the existing
 * single-column stacked list (unchanged); from md up it switches to a
 * multi-column grid so wider screens use the extra horizontal space
 * instead of stretching a phone-width column down the middle of the page.
 * Structure only — no visual restyling beyond what individual cards
 * already carry (their own hover:shadow-card handles the hover state).
 */
export function CardGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <ul
      className={cn(
        "flex flex-col gap-2.5",
        "md:grid md:grid-cols-2 md:items-start md:gap-3",
        "lg:grid-cols-3",
        "xl:grid-cols-4",
        className,
      )}
    >
      {children}
    </ul>
  );
}
