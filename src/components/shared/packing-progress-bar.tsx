export function PackingProgressBar({ total, packed }: { total: number; packed: number }) {
  const pct = total === 0 ? 0 : Math.round((packed / total) * 100);

  return (
    <div className="border border-ink bg-base p-3.5">
      <div className="flex items-baseline justify-between gap-2">
        <p className="field-label">Progreso de empacado</p>
        <p className="tabular text-xs text-concrete">
          {packed} / {total} empacados
        </p>
      </div>
      <div className="mt-2.5 h-2.5 w-full bg-steel-light">
        <div className="h-full bg-progress transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
