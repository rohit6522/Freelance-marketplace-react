import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="max-w-7xl mx-auto px-margin-sm lg:px-margin py-space-xl">
      <span className="font-code-sm text-code-sm text-on-surface-variant">ERROR 404</span>
      <h1 className="font-headline-xl text-headline-xl text-on-surface uppercase tracking-tight mt-space-xs">Page not found</h1>
      <p className="font-body-md text-body-md text-on-surface-variant mt-space-sm">
        The page you're looking for doesn't exist or has moved.
      </p>
      <Link
        to="/explore"
        className="inline-block mt-space-md bg-primary text-on-primary font-label-md text-label-md uppercase px-4 py-2 border border-primary hover:bg-primary-container"
      >
        Back to marketplace
      </Link>
    </div>
  );
}