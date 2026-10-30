import Icon from "./Icon";

function pageList(page, pages) {
  const nums = [...new Set([1, pages, page - 1, page, page + 1])]
    .filter((n) => n >= 1 && n <= pages)
    .sort((a, b) => a - b);
  const out = [];
  nums.forEach((n, i) => {
    if (i && n - nums[i - 1] > 1) out.push(`gap-${n}`);
    out.push(n);
  });
  return out;
}

export default function Pagination({ page, pages, total, onChange, unit = "ENTRIES" }) {
  if (!pages || pages < 1) return null;
  const btn = "px-3.5 py-2 font-code-sm text-code-sm border-r border-on-surface";

  return (
    <nav
      aria-label="Pagination"
      className="mt-space-lg pt-space-md border-t border-outline-variant flex flex-col sm:flex-row items-center justify-between gap-space-md"
    >
      <div className="font-code-sm text-code-sm text-secondary uppercase font-semibold">
        PAGE <span className="text-on-surface font-bold">{page}</span> OF{" "}
        <span className="text-on-surface font-bold">{pages}</span> ({total} {unit})
      </div>
      <div className="flex items-center border border-on-surface bg-surface-container-lowest">
        <button
          type="button" aria-label="Previous page" disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          className="px-3 py-2 border-r border-on-surface flex items-center text-on-surface hover:bg-surface-container-high disabled:text-outline disabled:bg-surface-container-low disabled:cursor-not-allowed"
        >
          <Icon name="chevron_left" className="text-[18px]" />
        </button>
        {pageList(page, pages).map((item) =>
          typeof item === "string" ? (
            <span key={item} className="px-3 py-2 font-code-sm text-code-sm text-secondary border-r border-on-surface bg-surface-container-low select-none">
              ...
            </span>
          ) : (
            <button
              key={item} type="button" onClick={() => onChange(item)}
              aria-current={item === page ? "page" : undefined}
              className={`${btn} ${item === page ? "font-bold bg-primary text-on-primary" : "font-semibold text-on-surface hover:bg-surface-container-high"}`}
            >
              {item}
            </button>
          )
        )}
        <button
          type="button" aria-label="Next page" disabled={page >= pages}
          onClick={() => onChange(page + 1)}
          className="px-3 py-2 flex items-center text-on-surface hover:bg-surface-container-high disabled:text-outline disabled:bg-surface-container-low disabled:cursor-not-allowed"
        >
          <Icon name="chevron_right" className="text-[18px]" />
        </button>
      </div>
    </nav>
  );
}