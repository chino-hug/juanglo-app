import Link from "next/link";
import { cn } from "@/lib/cn";

export function UtilityTile({
  label,
  value,
  alert = false,
  href,
}: {
  label: string;
  value: string | number;
  alert?: boolean;
  href?: string;
}) {
  const content = (
    <>
      <span className="utility-tile-label">{label}</span>
      <span className={alert ? "utility-tile-value text-safety" : "utility-tile-value"}>
        {value}
      </span>
    </>
  );

  const className = cn(
    alert ? "utility-tile border-safety" : "utility-tile",
    href && "transition-colors hover:bg-steel-light",
  );

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
}
