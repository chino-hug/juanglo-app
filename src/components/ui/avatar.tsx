import { cn } from "@/lib/cn";
import type { UserRole } from "@/lib/supabase/database.types";

function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const first = words[0]?.[0] ?? "";
  const last = words.length > 1 ? words[words.length - 1][0] : "";
  return (first + last).toUpperCase();
}

// A generated initials tile, not an uploaded photo — square, not round, to
// match the tag/utility-tile language rather than looking like a stray
// social-app import. Admins get the safety-orange border as the one place
// role hierarchy shows up visually.
export function Avatar({
  name,
  role,
  size = 40,
  className,
}: {
  name: string;
  role?: UserRole;
  size?: number;
  className?: string;
}) {
  const isAdmin = role === "admin";
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center border bg-ink font-mono font-semibold text-base",
        isAdmin ? "border-safety" : "border-ink",
        className,
      )}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      aria-hidden
    >
      {initialsOf(name)}
    </div>
  );
}
