import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Icon from "../components/ui/Icon";
import Pagination from "../components/ui/Pagination";
import GigCard from "../components/gig/GigCard";
import GigFilters from "../components/gig/GigFilters";
import { useCategories } from "../hooks/useCategories";
import { gigService } from "../services/gigService";
import { LEVELS, money } from "../utils/format";

const PAGE_SIZE = 12;
const FILTER_KEYS = ["category", "minPrice", "maxPrice", "maxDelivery", "minRating", "levels", "minExperience"];
const SORTS = [
  ["relevance", "Best Match"],
  ["rating", "Highest Rated"],
  ["popular", "Most Orders"],
  ["newest", "Newest"],
  ["price_asc", "Price: Low to High"],
  ["price_desc", "Price: High to Low"],
];

function SkeletonCard() {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant animate-pulse" aria-hidden="true">
      <div className="h-48 bg-surface-container-high" />
      <div className="p-space-md space-y-3">
        <div className="h-4 bg-surface-container-high w-2/3" />
        <div className="h-5 bg-surface-container-high" />
        <div className="h-5 bg-surface-container-high w-5/6" />
        <div className="h-10 bg-surface-container-high mt-6" />
      </div>
    </div>
  );
}

export default function ExplorePage() {
  const [params, setParams] = useSearchParams();
  const categories = useCategories();
  const [state, setState] = useState({ loading: true, error: "", gigs: [], pagination: null });
  const [reloadKey, setReloadKey] = useState(0);
  const query = params.toString();

  // Server-side search + filters + sort + pagination, driven entirely by the URL
  useEffect(() => {
    let active = true;
    setState((s) => ({ ...s, loading: true, error: "" }));
    gigService
      .list({ ...Object.fromEntries(new URLSearchParams(query)), limit: PAGE_SIZE })
      .then((d) => active && setState({ loading: false, error: "", gigs: d.gigs, pagination: d.pagination }))
      .catch((err) => active && setState({ loading: false, error: err.message, gigs: [], pagination: null }));
    return () => {
      active = false;
    };
  }, [query, reloadKey]);

  const update = useCallback(
    (patch) => {
      const next = new URLSearchParams(params);
      Object.entries(patch).forEach(([k, v]) => {
        if (v === "" || v == null) next.delete(k);
        else next.set(k, String(v));
      });
      if (!("page" in patch)) next.delete("page");
      setParams(next);
    },
    [params, setParams]
  );

  const q = params.get("q") || "";
  const sort = params.get("sort") || "relevance";
  const page = Number(params.get("page")) || 1;
  const applied = Object.fromEntries(FILTER_KEYS.map((k) => [k, params.get(k) || ""]));
  const category = categories.find((c) => c.slug === applied.category);

  // Active filter pills
  const pills = [];
  if (q) pills.push({ label: `SEARCH: ${q}`, clear: { q: "" } });
  if (applied.category) pills.push({ label: `CATEGORY: ${category?.name || applied.category}`, clear: { category: "" } });
  if (applied.minPrice || applied.maxPrice) {
    const lo = applied.minPrice, hi = applied.maxPrice;
    pills.push({
      label: `BUDGET: ${lo && hi ? `${money(lo)} - ${money(hi)}` : lo ? `${money(lo)}+` : `Up to ${money(hi)}`}`,
      clear: { minPrice: "", maxPrice: "" },
    });
  }
  if (applied.maxDelivery) pills.push({ label: `DELIVERY: ≤ ${applied.maxDelivery} day${applied.maxDelivery === "1" ? "" : "s"}`, clear: { maxDelivery: "" } });
  if (applied.minRating) pills.push({ label: `RATING: ${applied.minRating}★ & Up`, clear: { minRating: "" } });
  if (applied.levels) pills.push({ label: `TIER: ${applied.levels.split(",").map((l) => LEVELS[l]?.label || l).join(", ")}`, clear: { levels: "" } });
  if (applied.minExperience) pills.push({ label: `EXPERIENCE: ${applied.minExperience}+ yrs`, clear: { minExperience: "" } });

  const filterCount = pills.filter((p) => !("q" in p.clear)).length;
  const clearAll = () => update({ q: "", ...Object.fromEntries(FILTER_KEYS.map((k) => [k, ""])) });
  const resetFilters = () => update(Object.fromEntries(FILTER_KEYS.map((k) => [k, ""])));

  const title = category ? category.name : q ? `Results for “${q}”` : "All Services";
  const { loading, error, gigs, pagination } = state;

  return (
    <div className="flex flex-col w-full">
      {/* Header */}
      <section className="w-full bg-surface-container-lowest border-b border-outline-variant">
        <div className="max-w-7xl mx-auto px-margin-sm lg:px-margin py-space-md">
          <nav className="flex items-center gap-space-xs font-label-sm text-label-sm text-secondary uppercase tracking-wider mb-space-sm">
            <Link to="/explore" className="hover:text-primary transition-colors">Marketplace</Link>
            {category && (
              <>
                <span className="text-outline-variant">/</span>
                <span className="text-on-surface font-bold">{category.name}</span>
              </>
            )}
          </nav>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
            <div>
              <div className="inline-flex items-center gap-space-xs bg-surface-container-high px-space-xs py-0.5 mb-space-xs">
                <span className="w-1.5 h-1.5 bg-primary" />
                <span className="font-code-sm text-code-sm text-on-surface font-semibold tracking-widest uppercase">Published Gig Catalog</span>
              </div>
              <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight uppercase">{title}</h1>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                {pagination ? (
                  <>Displaying <strong className="text-on-surface font-bold">{pagination.total}</strong> published {pagination.total === 1 ? "gig" : "gigs"}</>
                ) : (
                  "Loading gigs..."
                )}
              </p>
            </div>
            <div className="flex items-center bg-surface-container-lowest border border-on-surface self-start md:self-auto">
              <label htmlFor="sortSelect" className="bg-surface-container-high px-space-sm py-2 font-label-sm text-label-sm text-on-surface uppercase border-r border-on-surface">Sort</label>
              <div className="relative">
                <select
                  id="sortSelect" value={sort} onChange={(e) => update({ sort: e.target.value === "relevance" ? "" : e.target.value })}
                  className="appearance-none bg-surface-container-lowest text-on-surface font-label-sm text-label-sm py-2 pl-space-sm pr-8 focus:outline-none cursor-pointer"
                >
                  {SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
                <Icon name="expand_more" className="absolute right-1.5 top-2 pointer-events-none text-body-sm text-on-surface" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Active criteria */}
      {pills.length > 0 && (
        <section className="w-full bg-surface-container-low border-b border-outline-variant py-space-sm">
          <div className="max-w-7xl mx-auto px-margin-sm lg:px-margin flex flex-wrap items-center gap-space-xs">
            <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider mr-space-xs">Active Criteria:</span>
            {pills.map((p) => (
              <div key={p.label} className="inline-flex items-center bg-surface-container-lowest border border-on-surface px-space-sm py-1 shadow-[2px_2px_0px_#0b1c30]">
                <span className="font-code-sm text-code-sm text-on-surface mr-space-xs font-semibold">{p.label}</span>
                <button type="button" aria-label={`Remove ${p.label}`} onClick={() => update(p.clear)} className="text-on-surface hover:text-error transition-colors flex items-center">
                  <Icon name="close" className="text-[14px]" />
                </button>
              </div>
            ))}
            <button type="button" onClick={clearAll} className="font-label-sm text-label-sm text-primary hover:text-primary-container uppercase font-bold underline ml-space-xs">
              Clear All
            </button>
          </div>
        </section>
      )}

      {/* Body */}
      <section className="max-w-7xl mx-auto px-margin-sm lg:px-margin py-space-lg w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
          <GigFilters categories={categories} applied={applied} activeCount={filterCount} onApply={update} onReset={resetFilters} />

          <div className="lg:col-span-9 flex flex-col">
            <div className="flex items-center justify-between bg-surface-container-lowest border border-outline-variant px-space-md py-space-xs mb-space-md">
              <div className="flex items-center gap-space-xs font-code-sm text-code-sm text-on-surface">
                <span className="w-2 h-2 bg-primary" />
                <span>FEED STATUS: <strong>LIVE</strong></span>
                <span className="text-outline-variant">|</span>
                <span className="text-secondary">{pagination ? `${gigs.length} OF ${pagination.total} GIGS LOADED` : "LOADING"}</span>
              </div>
            </div>

            {error ? (
              <div role="alert" className="bg-error-container border border-error p-space-lg text-on-error-container">
                <p className="font-body-md mb-space-sm">{error}</p>
                <button type="button" onClick={() => setReloadKey((k) => k + 1)} className="px-space-md py-2 border border-error font-label-sm text-label-sm uppercase font-bold hover:bg-error hover:text-on-error">
                  Try again
                </button>
              </div>
            ) : loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-space-md">
                {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : gigs.length === 0 ? (
              <div className="bg-surface-container-lowest border border-outline-variant p-space-xl text-center">
                <Icon name="search_off" className="text-5xl text-outline" />
                <h2 className="font-headline-sm text-headline-sm text-on-surface uppercase mt-space-sm">No gigs match these criteria</h2>
                <p className="font-body-md text-on-surface-variant mt-1">Try removing a filter or searching for something broader.</p>
                <button type="button" onClick={clearAll} className="mt-space-md bg-primary text-on-primary font-label-md text-label-md uppercase px-space-lg py-2 border border-primary hover:bg-primary-container">
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-space-md">
                {gigs.map((g) => <GigCard key={g._id} gig={g} />)}
              </div>
            )}

            <div className="mt-space-lg bg-surface-container-high border border-on-surface p-space-md flex flex-col md:flex-row items-center justify-between gap-space-md">
              <div className="flex items-center gap-space-md">
                <div className="w-12 h-12 bg-primary text-on-primary flex items-center justify-center shrink-0">
                  <Icon name="verified_user" className="text-[28px]" />
                </div>
                <div>
                  <h4 className="font-headline-sm text-headline-sm uppercase text-on-surface">Milestone-Backed Escrow System</h4>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Order payments are held in a simulated escrow until you approve the delivery.
                  </p>
                </div>
              </div>
            </div>

            {pagination && <Pagination page={pagination.page} pages={pagination.pages} total={pagination.total} unit="ENTRIES" onChange={(p) => update({ page: p === 1 ? "" : p })} />}
          </div>
        </div>
      </section>
    </div>
  );
}