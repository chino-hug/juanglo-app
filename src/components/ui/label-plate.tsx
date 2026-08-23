import { cn } from "@/lib/cn";

export function LabelPlate({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <span className={cn("label-plate", className)}>{children}</span>;
}
