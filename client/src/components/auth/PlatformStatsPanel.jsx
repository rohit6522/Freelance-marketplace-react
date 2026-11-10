import Icon from "../ui/Icon";
import StarRating from "../ui/StarRating";
import { useFetch } from "../../hooks/useFetch";
import { publicService } from "../../services/publicService";
import { money } from "../../utils/format";

function Tile({ label, value }) {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant p-space-md">
      <span className="font-code-sm text-code-sm uppercase text-on-surface-variant block">{label}</span>
      <div className="font-headline-md text-headline-md text-on-surface font-bold mt-1">{value}</div>
    </div>
  );
}

export default function PlatformStatsPanel({ compact = false }) {
  const { data: s, error } = useFetch(() => publicService.stats(), []);

  return (
    <div>
      <div className="flex items-center justify-between border-b border-outline-variant pb-space-sm mb-space-md">
        <span className="font-code-sm text-code-sm uppercase tracking-wider text-on-surface-variant font-semibold">PLATFORM METRICS</span>
        <span className="px-2 py-0.5 bg-primary text-on-primary font-code-sm text-code-sm">LIVE DATA</span>
      </div>

      {error ? (
        <p className="font-body-sm text-body-sm text-on-surface-variant">Stats are unavailable right now.</p>
      ) : !s ? (
        <div className="grid grid-cols-2 gap-space-sm animate-pulse" role="status" aria-label="Loading stats">
          {[0, 1, 2, 3].map((i) => <div key={i} className="h-20 bg-surface-container-high" />)}
        </div>
      ) : (
        <div className="space-y-space-md">
          <div className="grid grid-cols-2 gap-space-sm">
            <Tile label="Published gigs" value={s.gigs} />
            <Tile label="Freelancers" value={s.freelancers} />
            <Tile label="Completed orders" value={s.completedOrders} />
            <Tile label="Average rating" value={s.reviews.count ? `${s.reviews.average.toFixed(1)} ★` : "—"} />
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant p-space-md">
            <div className="flex items-start justify-between gap-space-sm">
              <div>
                <span className="font-code-sm text-code-sm uppercase text-on-surface-variant block">Simulated escrow released</span>
                <div className="font-headline-lg text-headline-lg text-on-surface font-bold mt-1 tracking-tight">{money(s.simulatedVolume)}</div>
              </div>
              <div className="p-2 bg-surface-container text-primary border border-outline-variant">
                <Icon name="account_balance" className="text-2xl" />
              </div>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-sm">Demo payments only. No real money moves on GigCraft.</p>
          </div>

          {!compact && s.latestReview && (
            <figure className="bg-surface-container-lowest border border-outline-variant p-space-md">
              <StarRating value={s.latestReview.rating} />
              <blockquote className="font-body-sm text-body-sm text-on-surface italic leading-relaxed mt-space-xs">
                “{s.latestReview.comment}”
              </blockquote>
              <figcaption className="mt-space-sm pt-space-sm border-t border-outline-variant font-code-sm text-code-sm text-on-surface-variant">
                {s.latestReview.author} on “{s.latestReview.gigTitle}”
              </figcaption>
            </figure>
          )}
        </div>
      )}
    </div>
  );
}