export default function Avatar({ user, className = "w-8 h-8", square = false }) {
  const shape = square ? "" : "rounded-full";
  const name = user ? `${user.firstName} ${user.lastName}` : "";

  if (user?.avatar?.url) {
    return (
      <img
        src={user.avatar.url}
        alt={name}
        className={`${className} ${shape} object-cover border border-outline-variant`}
      />
    );
  }
  const initials = user ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase() : "?";
  return (
    <span
      aria-label={name}
      className={`${className} ${shape} bg-surface-container-high border border-outline-variant inline-flex items-center justify-center font-headline-sm text-xs font-bold text-on-surface shrink-0`}
    >
      {initials}
    </span>
  );
}