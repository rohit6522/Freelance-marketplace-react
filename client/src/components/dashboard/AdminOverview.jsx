import PageHeader from "./PageHeader";
import StatCard from "./StatCard";
import ErrorBox from "../ui/ErrorBox";
import SkeletonBlocks from "../ui/SkeletonBlocks";
import { useAuth } from "../../hooks/useAuth";
import { useFetch } from "../../hooks/useFetch";
import { adminService } from "../../services/adminService";

const sum = (o = {}) => Object.values(o).reduce((a, b) => a + b, 0);

export default function AdminOverview() {
  const { user } = useAuth();
  const { data: s, error, reload } = useFetch(() => adminService.stats(), []);

  const header = <PageHeader eyebrow="ADMIN // OVERVIEW" title={`Welcome, ${user.firstName}`} description="Platform health and moderation queue." />;
  if (error) return <div className="space-y-space-lg">{header}<ErrorBox message={error} onRetry={reload} /></div>;
  if (!s) return <div className="space-y-space-lg">{header}<SkeletonBlocks count={8} cols="grid-cols-2 xl:grid-cols-4" height="h-28" /></div>;

  return (
    <div className="space-y-space-lg">
      {header}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-space-md">
        <StatCard
          label="Reviews with reports" value={s.reviews.withReports} icon="flag" tone="dark" to="/dashboard/moderation"
          hint={s.reviews.withReports ? "Needs your attention" : "Queue is clear"}
        />
        <StatCard label="Hidden reviews" value={s.reviews.hidden} icon="visibility_off" tone="secondary" to="/dashboard/moderation" />
        <StatCard label="Total reviews" value={s.reviews.total} icon="reviews" tone="tertiary" />
        <StatCard label="Suspended users" value={s.suspendedUsers} icon="block" to="/dashboard/users" />
        <StatCard label="Users" value={sum(s.users)} icon="group" to="/dashboard/users" hint={`${s.users.client || 0} clients, ${s.users.freelancer || 0} freelancers`} />
        <StatCard label="Published gigs" value={s.gigs.published || 0} icon="work" tone="tertiary" hint={`${s.gigs.draft || 0} drafts, ${s.gigs.paused || 0} paused`} />
        <StatCard label="Orders" value={sum(s.orders)} icon="receipt_long" tone="secondary" hint={`${s.orders.completed || 0} completed`} />
        <StatCard label="Active orders" value={(s.orders.pending || 0) + (s.orders.in_progress || 0) + (s.orders.delivered || 0) + (s.orders.revision_requested || 0)} icon="pending_actions" />
      </div>
    </div>
  );
}