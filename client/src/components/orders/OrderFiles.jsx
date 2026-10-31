import Icon from "../ui/Icon";
import { dateTime, fileIcon, formatBytes } from "../../utils/format";

function FileCard({ file, hint }) {
  return (
    <div className="bg-surface-container-low p-space-sm flex flex-col justify-between hover:bg-surface-container transition-colors">
      <div className="flex items-start justify-between">
        <Icon name={fileIcon(file.name)} className="text-primary text-headline-md" />
        {file.size ? <span className="font-code-sm text-code-sm bg-surface-container px-space-xs py-0.5 text-on-surface">{formatBytes(file.size)}</span> : null}
      </div>
      <div className="mt-space-md">
        <div className="font-label-md text-label-md text-on-surface truncate font-bold" title={file.name}>{file.name || "file"}</div>
        <span className="font-code-sm text-code-sm text-on-surface-variant block">{hint}</span>
      </div>
      <a
        href={file.url} target="_blank" rel="noopener noreferrer" download
        className="mt-space-sm bg-surface-container-lowest text-primary hover:bg-primary hover:text-on-primary font-label-sm text-label-sm uppercase p-space-xs text-center transition-colors block"
      >
        Download
      </a>
    </div>
  );
}

export default function OrderFiles({ order }) {
  const groups = [
    ...order.deliveries.map((d, i) => ({
      key: d._id || `d-${i}`,
      title: `Delivery #${i + 1}`,
      sub: dateTime(d.deliveredAt),
      message: d.message,
      files: d.files || [],
      hint: `Delivery #${i + 1}`,
    })),
    ...(order.attachments?.length
      ? [{ key: "brief", title: "Client briefing files", sub: "", message: "", files: order.attachments, hint: "Client brief" }]
      : []),
  ];
  const total = groups.reduce((n, g) => n + g.files.length, 0);

  return (
    <div className="bg-surface-container-lowest p-space-lg shadow-sm flex flex-col gap-space-md">
      <div className="flex items-center justify-between">
        <h3 className="font-headline-sm text-headline-sm uppercase tracking-wider text-on-surface">Deliverables & Artifact Repository</h3>
        <span className="font-code-sm text-code-sm text-on-surface-variant">{total} {total === 1 ? "FILE" : "FILES"} ATTACHED</span>
      </div>
      {groups.length === 0 ? (
        <p className="font-body-sm text-body-sm text-on-surface-variant">Nothing delivered yet. Files appear here when the seller delivers.</p>
      ) : (
        groups.map((g) => (
          <div key={g.key} className="space-y-space-sm">
            <div className="flex flex-wrap items-center gap-space-sm font-label-sm text-label-sm uppercase">
              <span className="font-bold text-on-surface">{g.title}</span>
              {g.sub && <span className="font-code-sm text-code-sm text-on-surface-variant">{g.sub}</span>}
            </div>
            {g.message && <p className="font-body-sm text-body-sm text-on-surface-variant bg-surface-container-low p-space-sm whitespace-pre-wrap">{g.message}</p>}
            {g.files.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-space-sm">
                {g.files.map((f) => <FileCard key={f.url} file={f} hint={g.hint} />)}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}