import Icon from "./Icon";

export default function PageLoader() {
  return (
    <div role="status" aria-label="Loading page" className="min-h-[40vh] flex items-center justify-center text-on-surface-variant">
      <Icon name="sync" className="animate-spin text-primary mr-2" />
      <span className="font-body-md text-body-md">Loading...</span>
    </div>
  );
}