import Link from "next/link";
import { Button } from "@/components/ui/button";

// Deliberately in normal document flow, not `fixed`/`sticky`: a viewport-
// pinned button sits at a constant distance from the bottom of the screen
// no matter how little content precedes it, which overlaps the last list
// item whenever content height happens to land close to the viewport
// height (a real case at this app's realistic list lengths, not just an
// edge case). Rendering it as the next block after the list guarantees it
// never covers content, at the cost of not staying visible mid-scroll.
export function FabLink({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <Link href={href} aria-label={label} className="mt-2 flex justify-end md:justify-start">
      <Button variant="primary" className="!px-4 shadow-tag">
        {icon}
        {label}
      </Button>
    </Link>
  );
}
