export default function ComingSoonPage({ title }) {
  return (
    <div className="max-w-7xl mx-auto px-margin-sm lg:px-margin py-space-xl">
      <h1 className="font-headline-lg text-headline-lg text-on-surface uppercase tracking-tight">{title}</h1>
      <p className="font-body-md text-body-md text-on-surface-variant mt-space-sm">This page is built in an upcoming step.</p>
    </div>
  );
}