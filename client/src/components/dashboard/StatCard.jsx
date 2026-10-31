import { Link } from "react-router-dom";
import Icon from "../ui/Icon";

const TONES = {
  primary: ["bg-primary text-on-primary", "bg-primary"],
  tertiary: ["bg-tertiary text-on-tertiary", "bg-tertiary"],
  secondary: ["bg-secondary text-on-secondary", "bg-secondary"],
  dark: ["bg-on-surface text-surface-container-lowest", "bg-on-surface"],
};

export default function StatCard({ label, value, hint, icon, to, tone = "primary" }) {
  const [iconBox, bar] = TONES[tone];
  const body = (
    <div className="bg-surface-container-lowest p-space-md shadow-sm relative h-full flex flex-col justify-between hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-space-sm">
        <div className="min-w-0">
          <span className="font-code-sm text-code-sm text-on-surface-variant uppercase tracking-wider block">{label}</span>
          <div className="font-headline-lg text-headline-lg text-on-surface mt-1 truncate">{value}</div>
        </div>
        <div className={`w-8 h-8 flex items-center justify-center shrink-0 ${iconBox}`}>
          <Icon name={icon} className="text-body-md" />
        </div>
      </div>
      {hint && <p className="font-code-sm text-code-sm text-on-surface-variant mt-space-sm uppercase">{hint}</p>}
      <div className={`absolute bottom-0 left-0 right-0 h-1 ${bar}`} />
    </div>
  );
  return to ? (
    <Link to={to} className="block h-full" aria-label={`${label}: ${value}`}>{body}</Link>
  ) : (
    body
  );
}