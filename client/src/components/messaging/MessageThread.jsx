import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import Icon from "../ui/Icon";
import Avatar from "../ui/Avatar";
import { useAuth } from "../../hooks/useAuth";
import { conversationService } from "../../services/conversationService";
import { uploadService } from "../../services/uploadService";
import { dateTime, fullName } from "../../utils/format";

const POLL_MS = 10000;

const mergeMessages = (prev, incoming) => {
  const map = new Map(prev.map((m) => [m._id, m]));
  incoming.forEach((m) => map.set(m._id, m));
  return [...map.values()].sort((a, b) => (a._id < b._id ? -1 : 1)); // ObjectIds sort by time
};

// events: [{ id, at, text }] system lines merged into the thread (e.g. order status changes)
// footerSlot: optional node rendered between the messages and the input (order action buttons)
export default function MessageThread({ conversationId, events = [], footerSlot = null, onActivity, heightClass = "max-h-96" }) {
  const { user } = useAuth();
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [state, setState] = useState({ loading: true, error: "" });
  const [text, setText] = useState("");
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const listRef = useRef(null);
  const stickRef = useRef(true);
  const activityRef = useRef(onActivity);
  activityRef.current = onActivity;

  const markRead = useCallback(() => {
    conversationService
      .read(conversationId)
      .then(() => {
        window.dispatchEvent(new Event("unread:changed"));
        activityRef.current?.();
      })
      .catch(() => {});
  }, [conversationId]);

  // Initial load
  useEffect(() => {
    let active = true;
    setState({ loading: true, error: "" });
    setMessages([]);
    setConversation(null);
    stickRef.current = true;
    conversationService
      .messages(conversationId, { limit: 30 })
      .then((d) => {
        if (!active) return;
        setConversation(d.conversation);
        setMessages(d.messages);
        setHasMore(d.hasMore);
        setState({ loading: false, error: "" });
        markRead();
      })
      .catch((err) => active && setState({ loading: false, error: err.message }));
    return () => {
      active = false;
    };
  }, [conversationId, markRead]);

  // Polling (swap for Socket.IO later using the server-side messageEvents hook)
  useEffect(() => {
    const timer = setInterval(async () => {
      if (document.hidden) return;
      try {
        const d = await conversationService.messages(conversationId, { limit: 30 });
        setMessages((prev) => {
          const merged = mergeMessages(prev, d.messages);
          return merged.length === prev.length ? prev : merged;
        });
        if (d.messages.some((m) => String(m.sender) !== String(user._id) && !(m.readBy || []).map(String).includes(String(user._id)))) {
          markRead();
        }
      } catch {
        /* ignore transient polling errors */
      }
    }, POLL_MS);
    return () => clearInterval(timer);
  }, [conversationId, markRead, user._id]);

  const timeline = useMemo(() => {
    const msgs = messages.map((m) => ({ kind: "msg", key: m._id, at: m.createdAt, m }));
    const evs = events.map((e) => ({ kind: "event", key: `e-${e.id}`, at: e.at, text: e.text }));
    return [...msgs, ...evs].sort((a, b) => new Date(a.at) - new Date(b.at));
  }, [messages, events]);

  // Stay pinned to the newest message unless the user scrolled up
  useEffect(() => {
    const el = listRef.current;
    if (el && stickRef.current) el.scrollTop = el.scrollHeight;
  }, [timeline.length, state.loading]);

  const onScroll = () => {
    const el = listRef.current;
    if (el) stickRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  };

  const loadEarlier = async () => {
    const el = listRef.current;
    const prevHeight = el?.scrollHeight || 0;
    try {
      const d = await conversationService.messages(conversationId, { limit: 30, before: messages[0]._id });
      stickRef.current = false;
      setMessages((prev) => mergeMessages(prev, d.messages));
      setHasMore(d.hasMore);
      requestAnimationFrame(() => {
        if (el) el.scrollTop = el.scrollHeight - prevHeight;
      });
    } catch (err) {
      toast.error(err.message);
    }
  };

  const addFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (files.length >= 5) return toast.error("Maximum 5 attachments per message");
    setUploading(true);
    try {
      setFiles((l) => [...l, await uploadService.file(file)]);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  const send = async (e) => {
    e.preventDefault();
    const body = text.trim();
    if (!body && !files.length) return;
    setSending(true);
    try {
      const msg = await conversationService.send(conversationId, {
        text: body || "Shared a file",
        attachments: files.map(({ url, name, size, publicId }) => ({ url, name, size, publicId })),
      });
      stickRef.current = true;
      setMessages((prev) => mergeMessages(prev, [msg]));
      setText("");
      setFiles([]);
      activityRef.current?.();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSending(false);
    }
  };

  const people = new Map((conversation?.participants || []).map((p) => [String(p._id), p]));
  const label = (p) => (p ? `${p.companyName || fullName(p)} (${p.role === "client" ? "Buyer" : "Seller"})` : "");

  if (state.error) return <p role="alert" className="text-error font-body-md">{state.error}</p>;

  return (
    <div className="flex flex-col gap-space-md">
      <div ref={listRef} onScroll={onScroll} className={`flex flex-col gap-space-md ${heightClass} overflow-y-auto pr-space-xs`} aria-live="polite">
        {state.loading && <p className="text-on-surface-variant font-body-sm">Loading messages...</p>}
        {hasMore && (
          <button type="button" onClick={loadEarlier} className="self-center font-label-sm text-label-sm uppercase font-bold text-primary hover:underline">
            Load earlier messages
          </button>
        )}
        {!state.loading && timeline.length === 0 && (
          <p className="text-on-surface-variant font-body-sm text-center py-space-md">No messages yet. Say hello!</p>
        )}
        {timeline.map((item) => {
          if (item.kind === "event") {
            return (
              <div key={item.key} className="flex items-center justify-center gap-space-sm py-space-xs">
                <div className="h-0.5 bg-surface-container-low flex-1" />
                <div className="flex items-center gap-space-xs bg-surface-container px-space-sm py-1">
                  <Icon name="verified_user" className="text-body-sm text-primary" />
                  <span className="font-code-sm text-code-sm uppercase font-bold text-on-surface">SYSTEM: {item.text}</span>
                  <span className="font-code-sm text-code-sm text-on-surface-variant hidden sm:inline">{dateTime(item.at)}</span>
                </div>
                <div className="h-0.5 bg-surface-container-low flex-1" />
              </div>
            );
          }
          const m = item.m;
          const mine = String(m.sender) === String(user._id);
          const sender = people.get(String(m.sender));
          return (
            <div key={item.key} className={`flex items-start gap-space-sm ${mine ? "flex-row-reverse" : ""}`}>
              <Avatar user={sender || { firstName: "?", lastName: "" }} square className="w-8 h-8" />
              <div className={`flex flex-col gap-space-xs p-space-md max-w-xl ${mine ? "bg-surface-container-high text-left" : "bg-surface-container-low"}`}>
                <div className="flex items-center justify-between gap-space-md">
                  <span className="font-label-sm text-label-sm text-on-surface uppercase font-bold">{mine ? "You" : label(sender)}</span>
                  <span className="font-code-sm text-code-sm text-on-surface-variant">{dateTime(m.createdAt)}</span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface whitespace-pre-wrap break-words">{m.text}</p>
                {m.attachments?.length > 0 && (
                  <div className="pt-space-xs flex flex-wrap items-center gap-space-xs">
                    {m.attachments.map((a) => (
                      <a
                        key={a.url} href={a.url} target="_blank" rel="noopener noreferrer"
                        className="font-code-sm text-code-sm bg-surface-container-lowest px-space-xs py-0.5 text-on-surface font-semibold flex items-center gap-1 hover:text-primary"
                      >
                        <Icon name="attach_file" className="text-body-sm text-primary" /> {a.name || "attachment"}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {footerSlot}

      <form onSubmit={send} className="flex flex-col gap-space-xs">
        {files.length > 0 && (
          <div className="flex flex-wrap gap-space-xs">
            {files.map((f, i) => (
              <span key={f.publicId || f.url} className="font-code-sm text-code-sm bg-surface-container px-space-xs py-0.5 flex items-center gap-1">
                {f.name}
                <button type="button" aria-label={`Remove ${f.name}`} onClick={() => setFiles((l) => l.filter((_, idx) => idx !== i))} className="hover:text-error">
                  <Icon name="close" className="text-sm" />
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="flex items-center bg-surface-container-low p-space-xs">
          <input
            type="text" value={text} onChange={(e) => setText(e.target.value)} maxLength={3000}
            aria-label="Message"
            placeholder="Post a contract update or milestone question..."
            className="bg-transparent text-on-surface placeholder:text-outline font-body-sm text-body-sm px-space-sm py-2 focus:outline-none flex-1 min-w-0"
          />
          <label className="p-2 text-on-surface hover:text-primary cursor-pointer" aria-label="Attach file">
            <Icon name={uploading ? "sync" : "attach_file"} className={`text-body-md ${uploading ? "animate-spin" : ""}`} />
            <input type="file" className="sr-only" onChange={addFile} disabled={uploading} accept=".jpg,.jpeg,.png,.webp,.pdf,.zip,.json,.txt,.md" />
          </label>
          <button
            type="submit" disabled={sending || uploading}
            className="bg-on-surface hover:bg-primary text-surface-container-lowest px-space-md py-2 font-label-sm text-label-sm uppercase transition-colors disabled:opacity-60"
          >
            {sending ? "Sending..." : "Send Message"}
          </button>
        </div>
      </form>
    </div>
  );
}