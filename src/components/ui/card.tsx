import { cn } from "@/lib/cn";

export function Card({
  children,
  className,
  attention = false,
}: {
  children: React.ReactNode;
  className?: string;
  attention?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative border border-ink bg-base transition-shadow duration-150 hover:shadow-card",
        className,
      )}
    >
      {attention && (
        <span
          className="hazard-stripe absolute right-0 top-0 h-6 w-6"
          style={{ clipPath: "polygon(100% 0, 0 0, 100% 100%)" }}
          aria-hidden
        />
      )}
      {children}
    </div>
  );
}
