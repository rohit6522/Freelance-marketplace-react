import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Icon from "../components/ui/Icon";
import Pagination from "../components/ui/Pagination";
import OrderKpis from "../components/orders/OrderKpis";
import OrderList from "../components/orders/OrderList";
import OrderDetail from "../components/orders/OrderDetail";
import { useAuth } from "../hooks/useAuth";
import { orderService } from "../services/orderService";
import { dashboardService } from "../services/dashboardService";
import { downloadCsv } from "../utils/csv";
import { fullName, statusLabel } from "../utils/format";

const PAGE_SIZE = 8;

export default function OrdersPage() {
  const { user } = useAuth();
  const role = user.role;
  const [params, setParams] = useSearchParams();
  const status = params.get("status") || "";
  const q = params.get("q") || "";
  const page = Number(params.get("page")) || 1;
  const orderParam = params.get("order") || "";

  const [qInput, setQInput] = useState(q);
  const [stats, setStats] = useState(null);
  const [list, setList] = useState({ loading: true, error: "", orders: [], counts: null, pagination: null });
  const [detail, setDetail] = useState({ loading: false, error: "", data: null });
  const [refreshKey, setRefreshKey] = useState(0);

  const updateParams = useCallback(
    (patch, resetPage = true) =>
      setParams((prev) => {
        const next = new URLSearchParams(prev);
        Object.entries(patch).forEach(([k, v]) => (v === "" || v == null ? next.delete(k) : next.set(k, String(v))));
        if (resetPage && !("page" in patch)) next.delete("page");
        return next;
      }),
    [setParams]
  );

  // Debounced search box -> ?q=
  useEffect(() => {
    const t = setTimeout(() => {
      if (qInput.trim() !== q) updateParams({ q: qInput.trim(), order: "" });
    }, 350);
    return () => clearTimeout(t);
  }, [qInput]); // eslint-disable-line react-hooks/exhaustive-deps

  // KPI cards (real numbers from the dashboard endpoint)
  useEffect(() => {
    let active = true;
    dashboardService
      .get(role)
      .then((d) => active && setStats(d.stats))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [role, refreshKey]);

  // Order list
  useEffect(() => {
    let active = true;
    setList((s) => ({ ...s, loading: true, error: "" }));
    orderService
      .list({ status, q, page, limit: PAGE_SIZE })
      .then((d) => active && setList({ loading: false, error: "", orders: d.orders, counts: d.counts, pagination: d.pagination }))
      .catch((err) => active && setList((s) => ({ ...s, loading: false, error: err.message })));
    return () => {
      active = false;
    };
  }, [status, q, page, refreshKey]);

  const selectedId = orderParam || list.orders[0]?._id || "";

  // Selected order detail
  useEffect(() => {
    if (!selectedId) {
      setDetail({ loading: false, error: "", data: null });
      return;
    }
    let active = true;
    setDetail((prev) => ({
      loading: true,
      error: "",
      data: prev.data && prev.data.order._id === selectedId ? prev.data : null,
    }));
    orderService
      .get(selectedId)
      .then((d) => active && setDetail({ loading: false, error: "", data: d }))
      .catch((err) => active && setDetail({ loading: false, error: err.message, data: null }));
    return () => {
      active = false;
    };
  }, [selectedId, refreshKey]);

  const onChanged = useCallback(() => setRefreshKey((k) => k + 1), []);

  const exportCsv = () => {
    const rows = [
      ["Order", "Status", "Gig", "Counterparty", "Price (USD)", "Due", "Created"],
      ...list.orders.map((o) => [
        o.orderNumber,
        statusLabel(o.status, role),
        o.gig?.title || o.packageSnapshot?.title,
        role === "client" ? fullName(o.freelancer) : o.client?.companyName || fullName(o.client),
        o.price,
        o.dueDate ? new Date(o.dueDate).toISOString().slice(0, 10) : "",
        new Date(o.createdAt).toISOString().slice(0, 10),
      ]),
    ];
    downloadCsv("gigcraft-orders.csv", rows);
  };

  const counts = list.counts || {};
  const tabs = [
    ["", "All Orders", counts.all],
    ["pending", "Pending", counts.pending],
    ["in_progress", "In Progress", counts.in_progress],
    ["delivered", role === "client" ? "Under Review" : "Delivered", counts.delivered],
    ["revision_requested", "Revisions", counts.revision_requested],
    ["completed", "Completed", counts.completed],
    ["cancelled", "Cancelled", counts.cancelled],
  ];
  const noOrdersAtAll = !list.loading && !list.error && counts.all === 0;

  return (
    <div className="flex flex-col w-full">
      <div className="w-full max-w-7xl mx-auto px-margin-sm lg:px-margin py-space-lg flex flex-col gap-space-lg">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md bg-surface-container-lowest p-space-lg shadow-sm">
          <div className="flex flex-col gap-space-xs">
            <div className="flex items-center gap-space-xs">
              <span className="font-code-sm text-code-sm uppercase tracking-widest text-primary font-bold">SYSTEM // CONTRACT OPS</span>
              <span className="w-1.5 h-1.5 bg-primary" />
              <span className="font-code-sm text-code-sm text-on-surface-variant">SIMULATED ESCROW</span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface uppercase tracking-tight">Order Management & Active Deliveries</h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant max-w-2xl">
              Track every contract from placement to payout: milestones, deliverables, revisions and direct messaging.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-space-sm">
            <div className="flex items-center bg-surface-container-low px-space-sm py-2 w-full sm:w-64">
              <Icon name="search" className="text-outline text-body-md mr-1" />
              <input
                type="text" value={qInput} onChange={(e) => setQInput(e.target.value)} maxLength={100}
                aria-label="Filter orders" placeholder="Filter order # or title..."
                className="bg-transparent text-on-surface placeholder:text-outline font-body-sm text-body-sm focus:outline-none w-full"
              />
            </div>
            <button
              type="button" onClick={exportCsv} disabled={!list.orders.length}
              className="bg-surface-container-low hover:bg-surface-container text-on-surface font-label-sm text-label-sm px-space-md py-2.5 flex items-center gap-space-xs transition-colors uppercase disabled:opacity-50"
            >
              <Icon name="file_download" className="text-body-md" /> Export Report
            </button>
          </div>
        </div>

        {/* Status tabs */}
        <div className="flex items-center gap-space-xs overflow-x-auto bg-surface-container-lowest p-space-xs shadow-sm" role="tablist" aria-label="Order status">
          {tabs.map(([key, label, count]) => (
            <button
              key={key || "all"} type="button" role="tab" aria-selected={status === key}
              onClick={() => updateParams({ status: key, order: "" })}
              className={`px-space-md py-2 font-label-sm text-label-sm uppercase transition-colors whitespace-nowrap ${
                status === key ? "bg-on-surface text-surface-container-lowest" : "bg-surface-container-low text-on-surface hover:bg-surface-container"
              }`}
            >
              {label} ({count ?? 0})
            </button>
          ))}
        </div>

        <OrderKpis stats={stats} role={role} />

        {list.error ? (
          <div role="alert" className="bg-error-container border border-error p-space-lg text-on-error-container">
            <p className="font-body-md mb-space-sm">{list.error}</p>
            <button type="button" onClick={onChanged} className="px-space-md py-2 border border-error font-label-sm text-label-sm uppercase font-bold hover:bg-error hover:text-on-error">Try again</button>
          </div>
        ) : noOrdersAtAll ? (
          <div className="bg-surface-container-lowest p-space-xl text-center shadow-sm">
            <Icon name="inventory_2" className="text-5xl text-outline" />
            <h2 className="font-headline-sm text-headline-sm uppercase text-on-surface mt-space-sm">No orders yet</h2>
            <p className="font-body-md text-on-surface-variant mt-1">
              {role === "client" ? "Find a gig and place your first order." : "Orders appear here when clients purchase your gigs."}
            </p>
            {role === "client" && (
              <Link to="/explore" className="inline-block mt-space-md bg-primary text-on-primary font-label-md text-label-md uppercase px-space-lg py-2 border border-primary hover:bg-primary-container">
                Browse gigs
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
            <div className="lg:col-span-5 flex flex-col gap-space-sm">
              <div className="flex items-center justify-between px-space-xs">
                <span className="font-code-sm text-code-sm uppercase tracking-wider text-on-surface-variant font-bold">Contract Ledger</span>
                <span className="font-code-sm text-code-sm text-on-surface-variant">Newest first</span>
              </div>
              {list.loading && list.orders.length === 0 ? (
                <div className="space-y-space-sm animate-pulse" aria-hidden="true">
                  {[0, 1, 2].map((i) => <div key={i} className="h-32 bg-surface-container-high" />)}
                </div>
              ) : list.orders.length === 0 ? (
                <p className="bg-surface-container-lowest p-space-lg font-body-md text-on-surface-variant shadow-sm">No orders match this filter.</p>
              ) : (
                <OrderList orders={list.orders} selectedId={selectedId} role={role} onSelect={(id) => updateParams({ order: id }, false)} />
              )}
              {list.pagination && list.pagination.pages > 1 && (
                <Pagination page={list.pagination.page} pages={list.pagination.pages} total={list.pagination.total} unit="ORDERS" onChange={(p) => updateParams({ page: p === 1 ? "" : p, order: "" }, false)} />
              )}
            </div>

            <div className="lg:col-span-7 min-w-0">
              {detail.error ? (
                <p role="alert" className="bg-error-container border border-error p-space-lg text-on-error-container font-body-md">{detail.error}</p>
              ) : detail.data ? (
                <OrderDetail key={detail.data.order._id} data={detail.data} role={role} onChanged={onChanged} />
              ) : detail.loading ? (
                <div className="space-y-space-md animate-pulse" role="status" aria-label="Loading order">
                  <div className="h-64 bg-surface-container-high" />
                  <div className="h-64 bg-surface-container-high" />
                </div>
              ) : (
                <p className="bg-surface-container-lowest p-space-lg font-body-md text-on-surface-variant shadow-sm">Select an order to see its details.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}