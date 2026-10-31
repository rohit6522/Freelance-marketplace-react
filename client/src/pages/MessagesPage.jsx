import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Avatar from "../components/ui/Avatar";
import Icon from "../components/ui/Icon";
import MessageThread from "../components/messaging/MessageThread";
import { conversationService } from "../services/conversationService";
import { dateTime, fullName } from "../utils/format";

export default function MessagesPage() {
  const [params, setParams] = useSearchParams();
  const selectedId = params.get("conversation") || "";
  const [state, setState] = useState({ loading: true, error: "", conversations: [] });

  const load = useCallback(() => {
    conversationService
      .list({ limit: 50 })
      .then((d) => setState({ loading: false, error: "", conversations: d.conversations }))
      .catch((err) => setState((s) => ({ ...s, loading: false, error: err.message })));
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(() => !document.hidden && load(), 20000);
    return () => clearInterval(t);
  }, [load]);

  const select = (id) => setParams(id ? { conversation: id } : {});

  // On wide screens open the first conversation automatically
  useEffect(() => {
    if (!selectedId && state.conversations.length && window.matchMedia("(min-width: 1024px)").matches) {
      setParams({ conversation: state.conversations[0]._id }, { replace: true });
    }
  }, [selectedId, state.conversations, setParams]);

  const active = state.conversations.find((c) => c._id === selectedId);

  return (
    <div className="w-full max-w-7xl mx-auto px-margin-sm lg:px-margin py-space-lg">
      <div className="mb-space-md">
        <span className="font-code-sm text-code-sm uppercase tracking-widest text-primary font-bold">SYSTEM // DIRECT MESSAGING</span>
        <h1 className="font-headline-lg text-headline-lg text-on-surface uppercase tracking-tight">Messages</h1>
      </div>

      {state.error ? (
        <p role="alert" className="bg-error-container border border-error p-space-lg text-on-error-container">{state.error}</p>
      ) : state.loading ? (
        <div className="h-96 bg-surface-container-high animate-pulse" role="status" aria-label="Loading conversations" />
      ) : state.conversations.length === 0 && !selectedId ? (
        <div className="bg-surface-container-lowest p-space-xl text-center shadow-sm">
          <Icon name="forum" className="text-5xl text-outline" />
          <h2 className="font-headline-sm text-headline-sm uppercase text-on-surface mt-space-sm">No conversations yet</h2>
          <p className="font-body-md text-on-surface-variant mt-1">Use "Contact Seller" on a gig or profile to start one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
          <aside className={`lg:col-span-4 bg-surface-container-lowest shadow-sm ${selectedId ? "hidden lg:block" : ""}`}>
            <div className="px-space-md py-space-sm border-b border-outline-variant font-code-sm text-code-sm uppercase text-on-surface-variant font-bold">Conversations</div>
            <ul className="max-h-[36rem] overflow-y-auto">
              {state.conversations.map((c) => (
                <li key={c._id}>
                  <button
                    type="button" onClick={() => select(c._id)} aria-current={c._id === selectedId ? "true" : undefined}
                    className={`w-full text-left p-space-md flex items-start gap-space-sm border-b border-outline-variant hover:bg-surface-container-low ${c._id === selectedId ? "bg-surface-container-low" : ""}`}
                  >
                    <Avatar user={c.other} square className="w-10 h-10" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-label-md text-label-md text-on-surface font-bold truncate">{c.other?.companyName || fullName(c.other)}</span>
                        <span className="font-code-sm text-code-sm text-on-surface-variant shrink-0">{c.lastMessage?.at ? dateTime(c.lastMessage.at) : ""}</span>
                      </div>
                      {(c.order || c.gig) && (
                        <span className="font-code-sm text-code-sm text-primary block truncate">{c.order ? `#${c.order.orderNumber}` : c.gig.title}</span>
                      )}
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-body-sm text-body-sm text-on-surface-variant truncate">{c.lastMessage?.text || "No messages yet"}</p>
                        {c.unreadCount > 0 && (
                          <span className="bg-primary text-on-primary font-code-sm text-code-sm px-1.5 min-w-5 text-center shrink-0">{c.unreadCount}</span>
                        )}
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          <section className={`lg:col-span-8 bg-surface-container-lowest p-space-lg shadow-sm ${selectedId ? "" : "hidden lg:block"}`}>
            {selectedId ? (
              <>
                <div className="flex items-center gap-space-sm pb-space-md mb-space-md border-b border-outline-variant">
                  <button type="button" onClick={() => select("")} aria-label="Back to conversations" className="lg:hidden text-on-surface">
                    <Icon name="arrow_back" />
                  </button>
                  {active && (
                    <>
                      <Avatar user={active.other} square className="w-10 h-10" />
                      <div className="min-w-0">
                        <div className="font-headline-sm text-headline-sm text-on-surface font-bold truncate">{active.other?.companyName || fullName(active.other)}</div>
                        <div className="font-code-sm text-code-sm text-on-surface-variant">
                          {active.order ? (
                            <Link to={`/orders?order=${active.order._id}`} className="text-primary hover:underline">Order #{active.order.orderNumber}</Link>
                          ) : active.gig ? (
                            <Link to={`/gigs/${active.gig._id}`} className="text-primary hover:underline">{active.gig.title}</Link>
                          ) : (
                            "Direct conversation"
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
                <MessageThread key={selectedId} conversationId={selectedId} onActivity={load} heightClass="h-[28rem]" />
              </>
            ) : (
              <p className="font-body-md text-on-surface-variant">Select a conversation.</p>
            )}
          </section>
        </div>
      )}
    </div>
  );
}