import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import PageHeader from "../../components/dashboard/PageHeader";
import Pagination from "../../components/ui/Pagination";
import TextActionModal from "../../components/ui/TextActionModal";
import Avatar from "../../components/ui/Avatar";
import Icon from "../../components/ui/Icon";
import ErrorBox from "../../components/ui/ErrorBox";
import SkeletonBlocks from "../../components/ui/SkeletonBlocks";
import { inputCls } from "../../components/ui/formStyles";
import { useAuth } from "../../hooks/useAuth";
import { useFetch } from "../../hooks/useFetch";
import { adminService } from "../../services/adminService";
import { fullName, shortDate } from "../../utils/format";

export default function AdminUsersPage() {
  const { user: me } = useAuth();
  const [q, setQ] = useState("");
  const [debounced, setDebounced] = useState("");
  const [role, setRole] = useState("");
  const [suspendedOnly, setSuspendedOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [target, setTarget] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebounced(q.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [q]);

  const { data, error, reload } = useFetch(
    () => adminService.users({ q: debounced, role, status: suspendedOnly ? "suspended" : "", page, limit: 15 }),
    [debounced, role, suspendedOnly, page]
  );
  const suspending = target?.isActive;

  return (
    <div className="space-y-space-lg">
      <PageHeader eyebrow="ADMIN // USERS" title="Users" description="Search accounts and suspend or reactivate them. Suspending a seller pauses their published gigs." />

      <div className="bg-surface-container-lowest p-space-md shadow-sm flex flex-wrap items-center gap-space-sm">
        <div className="flex items-center bg-surface-container-low px-space-sm flex-1 min-w-[14rem]">
          <Icon name="search" className="text-outline text-body-md mr-1" />
          <input
            value={q} onChange={(e) => setQ(e.target.value)} maxLength={100} aria-label="Search users" placeholder="Search name or email..."
            className="bg-transparent py-2 font-body-sm text-body-sm focus:outline-none w-full"
          />
        </div>
        <select aria-label="Role" value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }} className={`${inputCls(false)} w-auto`}>
          <option value="">All roles</option>
          <option value="client">Clients</option>
          <option value="freelancer">Freelancers</option>
          <option value="admin">Admins</option>
        </select>
        <label className="flex items-center gap-2 font-body-sm text-body-sm cursor-pointer">
          <input type="checkbox" checked={suspendedOnly} onChange={(e) => { setSuspendedOnly(e.target.checked); setPage(1); }} className="w-[18px] h-[18px] rounded-none accent-primary" />
          Suspended only
        </label>
      </div>

      {error ? (
        <ErrorBox message={error} onRetry={reload} />
      ) : !data ? (
        <SkeletonBlocks count={4} height="h-16" />
      ) : data.users.length === 0 ? (
        <p className="bg-surface-container-lowest p-space-lg font-body-md text-on-surface-variant shadow-sm">No users match.</p>
      ) : (
        <div className="bg-surface-container-lowest shadow-sm overflow-x-auto">
          <table className="w-full text-left font-body-sm text-body-sm min-w-[40rem]">
            <thead>
              <tr className="bg-surface-container-low font-label-sm text-label-sm uppercase text-on-surface-variant">
                {["User", "Role", "Joined", "Status", ""].map((h) => <th key={h} className="p-space-sm">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {data.users.map((u) => {
                const protectedAccount = u.role === "admin" || u._id === me._id || Boolean(u.deletedAt);
                return (
                  <tr key={u._id} className="border-t border-outline-variant">
                    <td className="p-space-sm">
                      <div className="flex items-center gap-space-sm">
                        <Avatar user={u} square className="w-8 h-8" />
                        <div className="min-w-0">
                          <div className="font-bold text-on-surface truncate">{fullName(u)}</div>
                          <div className="font-code-sm text-code-sm text-on-surface-variant truncate">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-space-sm uppercase font-label-sm">{u.role}</td>
                    <td className="p-space-sm whitespace-nowrap">{shortDate(u.createdAt)}</td>
                    <td className="p-space-sm">

                      <span className={`font-label-sm text-label-sm px-space-xs py-0.5 uppercase font-bold ${u.deletedAt ? "bg-surface-dim text-on-surface-variant" : u.isActive ? "bg-primary-container text-on-primary-container" : "bg-error-container text-on-error-container"
                        }`}>
                        {u.deletedAt ? "Deleted" : u.isActive ? "Active" : "Suspended"}
                      </span>

                    </td>
                    <td className="p-space-sm text-right">
                      <button
                        type="button" disabled={protectedAccount} onClick={() => setTarget(u)}
                        title={protectedAccount ? "Admins and your own account can't be changed here" : undefined}
                        className={`font-label-sm text-label-sm uppercase font-bold px-space-md py-1.5 border disabled:opacity-40 disabled:cursor-not-allowed ${u.isActive ? "border-error text-error hover:bg-error hover:text-on-error" : "border-on-surface hover:bg-surface-container-high"}`}
                      >
                        {u.isActive ? "Suspend" : "Reactivate"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {data && <Pagination page={data.pagination.page} pages={data.pagination.pages} total={data.pagination.total} unit="USERS" onChange={setPage} />}

      <TextActionModal
        open={Boolean(target)} onClose={() => setTarget(null)}
        title={suspending ? "Suspend user" : "Reactivate user"}
        description={target ? (suspending ? `${fullName(target)} will be signed out, can't log in, and any published gigs are paused.` : `${fullName(target)} will be able to log in again. Paused gigs stay paused until they republish them.`) : ""}
        label={suspending ? "Reason (saved in the activity log) *" : "Note (optional)"}
        minLength={suspending ? 5 : 0} maxLength={500}
        submitLabel={suspending ? "Suspend user" : "Reactivate user"} tone={suspending ? "danger" : "primary"}
        onSubmit={async (text) => {
          const r = await adminService.setUserActive(target._id, !target.isActive, text);
          toast.success(suspending ? `User suspended${r.pausedGigs ? `, ${r.pausedGigs} gig(s) paused` : ""}` : "User reactivated");
          reload();
        }}
      />
    </div>
  );
}