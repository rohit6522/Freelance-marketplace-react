import { useState } from "react";
import PageHeader from "../../components/dashboard/PageHeader";
import Pagination from "../../components/ui/Pagination";
import ErrorBox from "../../components/ui/ErrorBox";
import SkeletonBlocks from "../../components/ui/SkeletonBlocks";
import { useFetch } from "../../hooks/useFetch";
import { adminService } from "../../services/adminService";
import { dateTime, fullName } from "../../utils/format";

const LABELS = {
  review_hidden: "Review hidden",
  review_unhidden: "Review restored",
  reports_dismissed: "Reports dismissed",
  user_suspended: "User suspended",
  user_reactivated: "User reactivated",
    category_created: "Category created",
  category_updated: "Category updated",
  category_deleted: "Category deleted",
};

export default function AdminLogPage() {
  const [page, setPage] = useState(1);
  const { data, error, reload } = useFetch(() => adminService.log({ page, limit: 20 }), [page]);

  return (
    <div className="space-y-space-lg">
      <PageHeader eyebrow="ADMIN // AUDIT" title="Activity Log" description="Every moderation action, with who did it and why." />
      {error ? (
        <ErrorBox message={error} onRetry={reload} />
      ) : !data ? (
        <SkeletonBlocks count={4} height="h-14" />
      ) : data.logs.length === 0 ? (
        <p className="bg-surface-container-lowest p-space-lg font-body-md text-on-surface-variant shadow-sm">No moderation actions yet.</p>
      ) : (
        <div className="bg-surface-container-lowest shadow-sm overflow-x-auto">
          <table className="w-full text-left font-body-sm text-body-sm min-w-[44rem]">
            <thead>
              <tr className="bg-surface-container-low font-label-sm text-label-sm uppercase text-on-surface-variant">
                {["When", "Admin", "Action", "Target", "Reason"].map((h) => <th key={h} className="p-space-sm">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {data.logs.map((l) => (
                <tr key={l._id} className="border-t border-outline-variant align-top">
                  <td className="p-space-sm whitespace-nowrap font-code-sm text-code-sm">{dateTime(l.createdAt)}</td>
                  <td className="p-space-sm">{fullName(l.admin)}</td>
                  <td className="p-space-sm font-bold">{LABELS[l.action] || l.action}</td>
                  <td className="p-space-sm">{l.targetLabel}</td>
                  <td className="p-space-sm text-on-surface-variant">{l.reason || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {data && <Pagination page={data.pagination.page} pages={data.pagination.pages} total={data.pagination.total} unit="ACTIONS" onChange={setPage} />}
    </div>
  );
}