import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", className, style, children, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      style={style}
      className={cn(
        "relative inline-flex items-center justify-center gap-2 px-5 py-2.5 font-mono text-xs font-semibold uppercase tracking-wide transition-colors disabled:cursor-not-allowed disabled:opacity-40",
        variant === "primary" && "bg-safety text-ink hover:bg-ink hover:text-safety",
        variant === "secondary" &&
          "border border-ink bg-base text-ink hover:bg-ink hover:text-base",
        variant === "danger" && "border border-ink bg-base text-ink pb-[calc(0.625rem+3px)]",
        className,
      )}
      {...props}
    >
      {children}
      {variant === "danger" && (
        <span className="hazard-stripe absolute inset-x-0 bottom-0 h-[3px]" aria-hidden />
      )}
    </button>
  );
});
