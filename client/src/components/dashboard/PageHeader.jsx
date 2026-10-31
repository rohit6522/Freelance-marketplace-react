export default function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md bg-surface-container-lowest p-space-lg shadow-sm">
      <div>
        {eyebrow && <span className="font-code-sm text-code-sm uppercase tracking-widest text-primary font-bold">{eyebrow}</span>}
        <h1 className="font-headline-lg text-headline-lg text-on-surface uppercase tracking-tight">{title}</h1>
        {description && <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 max-w-2xl">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-space-sm">{actions}</div>}
    </div>
  );
}