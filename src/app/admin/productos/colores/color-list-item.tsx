"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { IconTrash } from "@/components/ui/icons";
import { deleteColor } from "./actions";

// The trash button sits outside the Link (a sibling, not nested inside it)
// so it can carry its own click handler. It stays hit-testable only while
// visible — pointer-events toggle alongside opacity — so the invisible 48px
// tap target doesn't swallow clicks meant for the row underneath it.
//
// The error message lives outside the "group relative" wrapper on purpose:
// if it were inside, its extra line would grow that wrapper's height and
// drag the absolutely-positioned (top: 50%) button down with it the moment
// an error appeared.
export function ColorListItem({ id, name }: { id: string; name: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleDelete() {
    startTransition(async () => {
      const err = await deleteColor(id);
      if (err) setError(err);
    });
  }

  return (
    <div>
      <div className="group relative">
        <Link href={`/admin/productos/colores/${id}`}>
          <Card className="p-2 pr-14 transition-colors group-hover:bg-steel/40">
            <p className="display text-sm">{name}</p>
          </Card>
        </Link>
        <button
          type="button"
          onClick={handleDelete}
          disabled={pending}
          aria-label={`Eliminar ${name}`}
          className="pointer-events-none absolute right-0 top-1/2 flex h-12 w-12 -translate-y-1/2 cursor-pointer items-center justify-center text-red-600 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100 focus:pointer-events-auto focus:opacity-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <IconTrash width={18} height={18} />
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
