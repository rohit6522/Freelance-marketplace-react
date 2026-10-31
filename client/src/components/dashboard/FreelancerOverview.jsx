import { Link } from "react-router-dom";
import PageHeader from "./PageHeader";
import SectionCard from "./SectionCard";
import StatCard from "./StatCard";
import RecentOrders from "./RecentOrders";
import EarningsChart from "./EarningsChart";
import ErrorBox from "../ui/ErrorBox";
import SkeletonBlocks from "../ui/SkeletonBlocks";
import { useAuth } from "../../hooks/useAuth";
import { useFetch } from "../../hooks/useFetch";
import { dashboardService } from "../../services/dashboardService";
import { LEVELS, money } from "../../utils/format";

export default function FreelancerOverview() {
  const { user } = useAuth();
  const { data, error, reload } = useFetch(() => dashboardService.get("freelancer"), []);

  const header = (
    <PageHeader
      eyebrow="SELLER // OVERVIEW"
      title={`Welcome back, ${user.firstName}`}
      description="Orders, earnings and gig performance, calculated from your real activity."
      actions={
        <Link to="/dashboard/gigs/new" className="bg-primary text-on-primary font-label-md text-label-md uppercase px-space-lg py-2.5 border border-primary hover:bg-primary-container">
          Create gig
        </Link>
      }
    />
  );

  if (error) return <div className="space-y-space-lg">{header}<ErrorBox message={error} onRetry={reload} /></div>;
  if (!data) return <div className="space-y-space-lg">{header}<SkeletonBlocks count={8} cols="grid-cols-2 xl:grid-cols-4" height="h-28" /></div>;

  const s = data.stats;
  const onTime = s.onTimeDelivery;

  return (
    <div className="space-y-space-lg">
      {header}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-space-md">
        <StatCard label="Awaiting acceptance" value={s.awaitingAcceptance} icon="hourglass_top" tone="dark" to="/orders?status=pending" hint={s.awaitingAcceptance ? "Needs your response" : "All clear"} />
        <StatCard label="Active orders" value={s.activeOrders} icon="pending_actions" tone="tertiary" to="/orders?status=in_progress" />
        <StatCard label="Awaiting client" value={s.awaitingClientReview} icon="rate_review" tone="secondary" to="/orders?status=delivered" hint="Delivered, in review" />
        <StatCard label="Completed orders" value={s.completedOrders} icon="task_alt" to="/orders?status=completed" />
        <StatCard label="Earned (released)" value={money(s.earnings.released)} icon="payments" hint="Simulated payouts" />
        <StatCard label="Pending in escrow" value={money(s.earnings.pendingInEscrow)} icon="shield" tone="tertiary" hint="Released on approval" />
        <StatCard label="This month" value={money(s.earnings.thisMonth)} icon="calendar_month" tone="secondary" />
        <StatCard
          label="Rating" value={s.ratingCount ? s.ratingAverage.toFixed(1) : "—"} icon="star" tone="dark" to="/dashboard/reviews"
          hint={`${s.ratingCount} ${s.ratingCount === 1 ? "review" : "reviews"}`}
        />
      </div>

      <SectionCard title="Earnings, last 6 months" description="Released (simulated) payments grouped by month.">
        <EarningsChart data={s.earnings.monthly} />
      </SectionCard>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-space-lg">
        <div className="xl:col-span-2">
          <SectionCard title="Recent orders" actions={<Link to="/orders" className="font-label-sm text-label-sm uppercase font-bold text-primary hover:underline">View all</Link>}>
            <RecentOrders orders={data.recentOrders} role="freelancer" />
          </SectionCard>
        </div>
        <div className="space-y-space-lg">
          <SectionCard title="Your gigs" actions={<Link to="/dashboard/gigs" className="font-label-sm text-label-sm uppercase font-bold text-primary hover:underline">Manage</Link>}>
            <div className="grid grid-cols-3 gap-space-xs text-center">
              {[["Published", s.gigs.published], ["Draft", s.gigs.draft], ["Paused", s.gigs.paused]].map(([label, n]) => (
                <div key={label} className="bg-surface-container-low p-space-sm">
                  <div className="font-headline-md text-headline-md text-on-surface font-bold">{n}</div>
                  <div className="font-label-sm text-label-sm uppercase text-on-surface-variant">{label}</div>
                </div>
              ))}
            </div>
            <div className="mt-space-md flex items-center justify-between font-body-sm text-body-sm">
              <span className="text-on-surface-variant uppercase font-label-sm">Seller level</span>
              <span className={`px-2 py-0.5 font-label-sm uppercase font-bold ${LEVELS[s.sellerLevel].badge}`}>{LEVELS[s.sellerLevel].label}</span>
            </div>
            <div className="mt-space-xs flex items-center justify-between font-body-sm text-body-sm">
              <span className="text-on-surface-variant uppercase font-label-sm">On-time delivery</span>
              <span className="font-bold text-on-surface">{onTime.rate != null ? `${onTime.rate}% (${onTime.sampleSize})` : "No data yet"}</span>
            </div>
          </SectionCard>

          <SectionCard title="Top gigs">
            {data.topGigs.length === 0 ? (
              <p className="font-body-md text-on-surface-variant">No gigs yet. <Link to="/dashboard/gigs/new" className="text-primary font-bold hover:underline">Create your first</Link>.</p>
            ) : (
              <ul className="divide-y divide-outline-variant">
                {data.topGigs.map((g) => (
                  <li key={g._id} className="py-space-sm">
                    <Link to={`/gigs/${g._id}`} className="font-label-md text-label-md text-on-surface font-bold hover:text-primary line-clamp-2">{g.title}</Link>
                    <div className="font-code-sm text-code-sm text-on-surface-variant uppercase mt-0.5">
                      {g.status} // from {money(g.startingPrice)} // {g.completedOrders} orders
                      {g.ratingCount > 0 && ` // ★ ${g.ratingAverage.toFixed(1)}`}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </div>
      </div>
      <p className="font-code-sm text-code-sm text-on-surface-variant uppercase">Earnings are simulated. No real payouts are made.</p>
    </div>
  );
}