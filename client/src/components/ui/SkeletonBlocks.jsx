export default function SkeletonBlocks({ count = 3, height = "h-32", cols = "grid-cols-1" }) {
  return (
    <div className={`grid ${cols} gap-space-md animate-pulse`} role="status" aria-label="Loading">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`${height} bg-surface-container-high`} />
      ))}
    </div>
  );
}