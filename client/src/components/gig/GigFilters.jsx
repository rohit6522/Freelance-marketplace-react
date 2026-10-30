import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Icon from "../ui/Icon";
import { LEVELS } from "../../utils/format";

const box = "w-[18px] h-[18px] border border-on-surface rounded-none";
const labelCls = "flex items-center gap-space-xs cursor-pointer group py-0.5";
const QUICK_RANGES = [
  ["Under $50", "", "50"],
  ["$50 - $150", "50", "150"],
  ["$150 - $500", "150", "500"],
  ["$500+", "500", ""],
];

function Section({ title, index, last, children }) {
  return (
    <div className={last ? "" : "pb-space-md border-b border-outline-variant"}>
      <div className="flex items-center justify-between mb-space-sm">
        <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface font-bold">{title}</span>
        <span className="text-outline font-code-sm text-code-sm">[{index}]</span>
      </div>
      <div className="space-y-space-xs font-body-sm text-body-sm text-on-surface">{children}</div>
    </div>
  );
}

function Radio({ name, checked, onChange, children, count }) {
  return (
    <label className={`${labelCls} justify-between`}>
      <span className="flex items-center gap-space-xs">
        <input type="radio" name={name} checked={checked} onChange={onChange} className={`${box} accent-on-surface`} />
        <span className="group-hover:text-primary">{children}</span>
      </span>
      {count !== undefined && <span className="font-code-sm text-code-sm text-secondary">{count}</span>}
    </label>
  );
}

export default function GigFilters({ categories, applied, activeCount, onApply, onReset }) {
  const [draft, setDraft] = useState(applied);
  const appliedKey = JSON.stringify(applied);
  // Keep the sidebar in sync when filters change elsewhere (pills, navbar search, back button)
  useEffect(() => setDraft(applied), [appliedKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (key, value) => setDraft((d) => ({ ...d, [key]: value }));
  const levels = draft.levels ? draft.levels.split(",") : [];
  const toggleLevel = (lv) =>
    set("levels", (levels.includes(lv) ? levels.filter((x) => x !== lv) : [...levels, lv]).join(","));

  const submit = (e) => {
    e.preventDefault();
    if (draft.minPrice !== "" && draft.maxPrice !== "" && Number(draft.minPrice) > Number(draft.maxPrice)) {
      toast.error("Minimum budget can't be higher than the maximum");
      return;
    }
    onApply(draft);
  };

  return (
    <aside className="lg:col-span-3 bg-surface-container-lowest border border-outline-variant p-space-md lg:sticky lg:top-[7.5rem]">
      <div className="flex items-center justify-between pb-space-sm border-b border-outline-variant mb-space-md">
        <div className="flex items-center gap-space-xs">
          <Icon name="tune" className="text-primary text-body-md" />
          <h2 className="font-headline-sm text-headline-sm uppercase text-on-surface">Filters</h2>
        </div>
        <span className="font-code-sm text-code-sm bg-surface-container-high px-1.5 py-0.5 text-on-surface font-semibold">
          ACTIVE: {activeCount}
        </span>
      </div>

      <form onSubmit={submit} className="space-y-space-md">
        <Section title="Service Type" index="01">
          <Radio name="category" checked={draft.category === ""} onChange={() => set("category", "")}>All services</Radio>
          {categories.map((c) => (
            <Radio key={c._id} name="category" checked={draft.category === c.slug} onChange={() => set("category", c.slug)} count={c.gigCount}>
              {c.name}
            </Radio>
          ))}
        </Section>

        <Section title="Delivery Time" index="02">
          {[["", "Anytime"], ["1", "Up to 24 hours (Rush)"], ["3", "Up to 3 days"], ["7", "Up to 7 days"]].map(([v, l]) => (
            <Radio key={v} name="delivery" checked={draft.maxDelivery === v} onChange={() => set("maxDelivery", v)}>{l}</Radio>
          ))}
        </Section>

        <Section title="Budget (USD)" index="03">
          <div className="grid grid-cols-2 gap-space-xs mb-space-sm">
            {[["minPrice", "Min"], ["maxPrice", "Max"]].map(([key, label]) => (
              <div key={key}>
                <label htmlFor={key} className="block font-label-sm text-label-sm text-secondary uppercase mb-1">{label}</label>
                <div className="flex items-center border border-outline bg-surface-container-lowest">
                  <span className="px-2 font-code-sm text-code-sm bg-surface-container-high text-on-surface border-r border-outline font-bold">$</span>
                  <input
                    id={key} type="number" min="0" inputMode="numeric" value={draft[key]}
                    onChange={(e) => set(key, e.target.value)}
                    className="w-full font-code-sm text-code-sm py-1.5 px-2 bg-transparent text-on-surface focus:outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-space-xs">
            {QUICK_RANGES.map(([label, min, max]) => {
              const active = draft.minPrice === min && draft.maxPrice === max;
              return (
                <button
                  key={label} type="button"
                  onClick={() => setDraft((d) => ({ ...d, minPrice: min, maxPrice: max }))}
                  className={`py-1 px-2 text-center font-code-sm text-code-sm border text-on-surface uppercase hover:border-on-surface hover:bg-surface-container-high ${
                    active ? "bg-surface-container-high border-on-surface font-semibold" : "bg-surface-container-low border-outline-variant"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </Section>

        <Section title="Seller Tier" index="04">
          {Object.entries(LEVELS).map(([key, lv]) => (
            <label key={key} className={labelCls}>
              <input type="checkbox" checked={levels.includes(key)} onChange={() => toggleLevel(key)} className={`${box} accent-primary`} />
              <span className="group-hover:text-primary">{lv.label}</span>
            </label>
          ))}
        </Section>

        <Section title="Review Score" index="05">
          {[["", "Any rating"], ["4.5", "4.5 & above"], ["4", "4.0 & above"]].map(([v, l]) => (
            <Radio key={v} name="rating" checked={draft.minRating === v} onChange={() => set("minRating", v)}>
              {v ? (
                <span className="flex items-center">
                  <Icon name="star" filled className="text-[16px] text-tertiary mr-1" />
                  {l}
                </span>
              ) : (
                l
              )}
            </Radio>
          ))}
        </Section>

        <Section title="Seller Experience" index="06" last>
          {[["", "Any experience"], ["2", "2+ years"], ["5", "5+ years"], ["8", "8+ years"]].map(([v, l]) => (
            <Radio key={v} name="experience" checked={draft.minExperience === v} onChange={() => set("minExperience", v)}>{l}</Radio>
          ))}
        </Section>

        <div className="pt-space-xs space-y-space-xs">
          <button
            type="submit"
            className="w-full bg-primary text-on-primary font-label-md text-label-md py-2.5 uppercase tracking-wider font-bold border border-primary hover:bg-primary-container shadow-[2px_2px_0px_#0b1c30] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
          >
            Apply Filter State
          </button>
          <button
            type="button" onClick={onReset}
            className="w-full bg-surface-container-lowest text-on-surface font-label-md text-label-md py-2.5 uppercase tracking-wider font-bold border border-on-surface hover:bg-surface-container-high transition-colors"
          >
            Reset Parameters
          </button>
        </div>
      </form>
    </aside>
  );
}