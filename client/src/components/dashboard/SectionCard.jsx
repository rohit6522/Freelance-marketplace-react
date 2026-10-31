export default function SectionCard({ title, description, actions, children }) {
  return (
    <section className="bg-surface-container-lowest p-space-lg shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-space-sm mb-space-md pb-space-sm border-b border-outline-variant">
        <div>
          <h2 className="font-headline-sm text-headline-sm uppercase tracking-wider text-on-surface">{title}</h2>
          {description && <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">{description}</p>}
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}