import Icon from "./Icon";

export default function FullPageLoader({ label = "Loading..." }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background" role="status">
      <div className="flex items-center gap-2 text-on-surface-variant font-body-md text-body-md">
        <Icon name="sync" className="animate-spin text-primary" />
        {label}
      </div>
    </div>
  );
}