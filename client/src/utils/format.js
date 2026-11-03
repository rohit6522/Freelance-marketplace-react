// Reusable India-focused formatting utilities

export const formatIndianNumber = (n, options = {}) => {
  const num = Number(n || 0);
  return num.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
    ...options,
  });
};

export const formatCurrency = (n, { includeDecimals = false } = {}) => {
  const num = Number(n || 0);
  const formatted = num.toLocaleString("en-IN", {
    minimumFractionDigits: includeDecimals ? 2 : 0,
    maximumFractionDigits: includeDecimals ? 2 : 2,
  });
  return `₹${formatted}`;
};

export const money = formatCurrency;

export const formatPhoneNumber = (phone) => {
  if (!phone) return "";
  const cleaned = String(phone).trim();
  const digits = cleaned.replace(/\D/g, "");
  if (digits.length === 10) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  }
  if (digits.length === 12 && digits.startsWith("91")) {
    const mobile = digits.slice(2);
    return `+91 ${mobile.slice(0, 5)} ${mobile.slice(5)}`;
  }
  return cleaned.startsWith("+91") ? cleaned : `+91 ${cleaned}`;
};

export const daysLabel = (n) => `${n} ${n === 1 ? "Day" : "Days"}`;

export const revisionsLabel = (r) => (r === -1 ? "Unlimited" : `${r} ${r === 1 ? "Round" : "Rounds"}`);

// DD/MM/YYYY date formatting in IST (Asia/Kolkata) using en-IN locale
export const formatIndianDate = (d) => {
  if (!d) return "";
  const date = new Date(d);
  if (isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
};

export const shortDate = (d) => formatIndianDate(d);

export const monthYear = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric",
        timeZone: "Asia/Kolkata",
      })
    : "";

export const fullName = (u) => (u ? `${u.firstName} ${u.lastName}` : "");

// "Rahul Sharma" -> "Rahul S." (reviewer privacy)
export const publicName = (u) => (u ? `${u.firstName} ${u.lastName?.[0] || ""}.` : "");

export const LEVELS = {
  top_rated: { label: "Top Rated", badge: "bg-on-surface text-surface-container-lowest" },
  pro: { label: "Pro Verified", badge: "bg-primary text-on-primary" },
  level2: { label: "Level 2", badge: "bg-surface-container-lowest text-on-surface border border-on-surface" },
  rising: { label: "Rising Talent", badge: "bg-surface-container-lowest text-on-surface border border-on-surface" },
};

export const TIERS = ["basic", "standard", "premium"];
export const TIER_LABELS = { basic: "Basic", standard: "Standard", premium: "Premium" };

export const formatBytes = (n) => {
  if (!n) return "";
  const units = ["B", "KB", "MB", "GB"];
  let v = n;
  let i = 0;
  while (v >= 1024 && i < 3) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(v >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
};

export const dateTime = (d) => {
  if (!d) return "";
  const date = new Date(d);
  if (isNaN(date.getTime())) return "";
  return (
    date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    }) + " IST"
  );
};

export const dayMonth = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        timeZone: "Asia/Kolkata",
      })
    : "";

export function dueText(due) {
  if (!due) return "";
  const days = Math.ceil((new Date(due) - Date.now()) / 86400000);
  if (days > 1) return `Due in ${days} days (${dayMonth(due)})`;
  if (days === 1) return `Due tomorrow (${dayMonth(due)})`;
  if (days === 0) return "Due today";
  return `Overdue ${Math.abs(days)}d (${dayMonth(due)})`;
}

export const ORDER_STATUS = {
  pending: { label: "Pending", chip: "bg-surface-container-high text-on-surface" },
  in_progress: { label: "In Progress", chip: "bg-tertiary text-surface-container-lowest" },
  delivered: { label: "Delivered", clientLabel: "Awaiting Review", chip: "bg-secondary-fixed text-on-surface" },
  revision_requested: { label: "Revision Requested", chip: "bg-error-container text-on-error-container" },
  completed: { label: "Completed", chip: "bg-primary-container text-on-primary-container" },
  cancelled: { label: "Cancelled", chip: "bg-surface-dim text-on-surface-variant" },
};

// role = the viewer's role ("client" | "freelancer")
export const statusLabel = (status, role) =>
  role === "client" && ORDER_STATUS[status]?.clientLabel ? ORDER_STATUS[status].clientLabel : ORDER_STATUS[status]?.label || status;

export function fileIcon(name = "") {
  const ext = name.split(".").pop().toLowerCase();
  if (ext === "zip") return "folder_zip";
  if (ext === "pdf") return "picture_as_pdf";
  if (["png", "jpg", "jpeg", "webp"].includes(ext)) return "image";
  if (["json", "txt", "md"].includes(ext)) return "description";
  return "attach_file";
}
