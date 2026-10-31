import { Link } from "react-router-dom";
import Icon from "../ui/Icon";
import Avatar from "../ui/Avatar";
import { useFavorites } from "../../hooks/useFavorites";
import { LEVELS, money, fullName } from "../../utils/format";

export default function GigCard({ gig }) {
  const { isSaved, toggle } = useFavorites();
  const saved = isSaved(gig._id);
  const level = gig.sellerLevel ? LEVELS[gig.sellerLevel] : null;
  const express = gig.minDeliveryDays === 1;

  return (
    <article className="bg-surface-container-lowest border border-outline-variant hover:border-on-surface hover:shadow-[3px_3px_0px_#0b1c30] transition-all flex flex-col justify-between group">
      <div>
        <div className="relative w-full h-48 bg-surface-container-high overflow-hidden border-b border-outline-variant">
          <Link to={`/gigs/${gig._id}`} aria-label={gig.title} className="block w-full h-full">
            {gig.thumbnail ? (
              <img src={gig.thumbnail} alt="" loading="lazy" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-outline">
                <Icon name="image" className="text-5xl" />
              </div>
            )}
          </Link>
          {level && (
            <div className={`absolute top-2 left-2 font-code-sm text-label-sm px-2 py-0.5 font-bold uppercase tracking-wider ${level.badge}`}>
              {level.label}
            </div>
          )}
          <button
            type="button" aria-pressed={saved}
            aria-label={saved ? "Remove from saved gigs" : "Save gig"}
            onClick={() => toggle(gig._id)}
            className={`absolute top-2 right-2 w-8 h-8 border flex items-center justify-center transition-colors ${saved
                ? "bg-error text-on-error border-error"
                : "bg-surface-container-lowest border-on-surface text-on-surface hover:bg-error hover:text-on-error hover:border-error"
              }`}
          >
            <Icon name="favorite" filled={saved} className="text-[18px]" />
          </button>
          <div className="absolute bottom-2 left-2 bg-surface-container-lowest border border-on-surface px-1.5 py-0.5 flex items-center gap-1 pointer-events-none">
            <Icon name={express ? "bolt" : "schedule"} className="text-[14px] text-primary" />
            <span className="font-code-sm text-code-sm text-on-surface font-semibold uppercase">
              {express ? "24H Express" : `${gig.minDeliveryDays}-Day Delivery`}
            </span>
          </div>
        </div>

        <div className="p-space-md">
          <div className="flex items-center justify-between mb-space-xs gap-2">
            <Link to={`/freelancers/${gig.seller._id}`} className="flex items-center gap-space-xs min-w-0">
              <Avatar user={gig.seller} square className="w-7 h-7" />
              <span className="font-label-md text-label-md text-on-surface font-bold hover:text-primary truncate">
                {fullName(gig.seller)}
              </span>
            </Link>
            <div className="flex items-center gap-0.5 text-on-surface font-code-sm text-code-sm shrink-0">
              {gig.ratingCount > 0 ? (
                <>
                  <Icon name="star" filled className="text-[15px] text-tertiary" />
                  <span className="font-bold">{gig.ratingAverage.toFixed(1)}</span>
                  <span className="text-secondary">({gig.ratingCount})</span>
                </>
              ) : (
                <span className="text-secondary font-semibold uppercase">New</span>
              )}
            </div>
          </div>

          <h3 className="font-headline-sm text-[1.125rem] leading-snug text-on-surface font-bold group-hover:text-primary transition-colors line-clamp-2 mb-space-sm">
            <Link to={`/gigs/${gig._id}`}>{gig.title}</Link>
          </h3>

          <div className="flex flex-wrap gap-1 mb-space-md">
            {(gig.tags || []).slice(0, 3).map((t) => (
              <span key={t} className="font-code-sm text-code-sm bg-surface-container px-1.5 py-0.5 text-on-surface border border-outline-variant">
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="p-space-md pt-0">
        <div className="border-t border-outline-variant pt-space-sm flex items-center justify-between">
          <div>
            <span className="block font-code-sm text-[11px] text-secondary uppercase font-semibold">Starting At</span>
            <span className="font-headline-md text-headline-md text-on-surface font-bold leading-tight">{money(gig.startingPrice)}</span>
          </div>
          <Link
            to={`/gigs/${gig._id}`}
            className="bg-primary text-on-primary font-label-sm text-label-sm uppercase font-bold px-space-md py-2 border border-primary hover:bg-primary-container transition-colors"
          >
            Inspect Spec
          </Link>
        </div>
      </div>
    </article>
  );
}