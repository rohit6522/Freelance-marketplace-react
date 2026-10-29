import { useSearchParams } from "react-router-dom";

export default function ExplorePage() {
  const [params] = useSearchParams();
  return (
    <div className="max-w-7xl mx-auto px-margin-sm lg:px-margin py-space-xl">
      <h1 className="font-headline-lg text-headline-lg text-on-surface uppercase tracking-tight">Explore Gigs</h1>
      <p className="font-body-md text-body-md text-on-surface-variant mt-space-sm">
        The marketplace listing is built in Step 8.
      </p>
      <pre className="mt-space-md p-space-md bg-surface-container-low border border-outline-variant font-code-sm text-code-sm">
        {JSON.stringify(Object.fromEntries(params), null, 2)}
      </pre>
    </div>
  );
}