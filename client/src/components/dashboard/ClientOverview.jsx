import { Link } from "react-router-dom";
import PageHeader from "./PageHeader";
import SectionCard from "./SectionCard";
import StatCard from "./StatCard";
import RecentOrders from "./RecentOrders";
import ErrorBox from "../ui/ErrorBox";
import SkeletonBlocks from "../ui/SkeletonBlocks";
import { useAuth } from "../../hooks/useAuth";
import { useFetch } from "../../hooks/useFetch";
import { dashboardService } from "../../services/dashboardService";
import { money } from "../../utils/format";

export default function ClientOverview() {
  const { user } = useAuth();
  const { data, error, reload } = useFetch(() => dashboardService.get("client"), []);

  const header = (
    <PageHeader
      eyebrow="CLIENT // OVERVIEW"
      title={`Welcome back, ${user.firstName}`}
      description="Your contracts, escrow and activity at a glance."
      actions={
        <Link to="/explore" className="bg-primary text-on-primary font-label-md text-label-md uppercase px-space-lg py-2.5 border border-primary hover:bg-primary-container">
          Browse gigs
        </Link>
      }
    />
  );

  if (error) return <div className="space-y-space-lg">{header}<ErrorBox message={error} onRetry={reload} /></div>;
  if (!data) return <div className="space-y-space-lg">{header}<SkeletonBlocks count={8} cols="grid-cols-2 xl:grid-cols-4" height="h-28" /></div>;

  const s = data.stats;
  return (
    <div className="space-y-space-lg">
      {header}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-space-md">
        <StatCard label="Active orders" value={s.activePipeline} icon="pending_actions" tone="tertiary" to="/orders" hint="Pending + in progress" />
        <StatCard label="Awaiting your review" value={s.awaitingReview} icon="rate_review" tone="dark" to="/orders?status=delivered" hint={s.awaitingReview ? "Action required" : "All clear"} />
        <StatCard label="In escrow" value={money(s.escrowHeld)} icon="shield" to="/orders" hint="Simulated escrow" />
        <StatCard label="Total spent" value={money(s.totalSpent)} icon="payments" tone="secondary" hint="Released to sellers" />
        <StatCard label="Completed orders" value={s.completedOrders} icon="task_alt" to="/orders?status=completed" />
        <StatCard label="Reviews to write" value={s.reviewsPending} icon="reviews" tone="dark" to="/dashboard/reviews" />
        <StatCard label="Saved gigs" value={s.savedGigs} icon="favorite" tone="tertiary" to="/dashboard/saved" />
        <StatCard label="Unread messages" value={s.unreadMessages} icon="forum" tone="secondary" to="/messages" />
      </div>
      <SectionCard title="Recent orders" actions={<Link to="/orders" className="font-label-sm text-label-sm uppercase font-bold text-primary hover:underline">View all</Link>}>
        <RecentOrders orders={data.recentOrders} role="client" />
      </SectionCard>
      <p className="font-code-sm text-code-sm text-on-surface-variant uppercase">Payments in this project are simulated. No real money is charged.</p>
    </div>
  );
}