import { Link } from "react-router-dom";
import { useCategories } from "../../hooks/useCategories";

const columns = [
  { title: "About", links: [["How it works", "/about"], ["For clients", "/about#clients"], ["For freelancers", "/about#freelancers"]] },
  { title: "Support", links: [["Help Center", "/help"], ["Escrow explained", "/escrow"], ["Contact", "/help#contact"]] },
  { title: "Trust & Safety", links: [["Community Guidelines", "/guidelines"], ["Reviews & moderation", "/guidelines#reviews"], ["Safety tips", "/guidelines#safety"]] },
  { title: "Terms & Law", links: [["Terms of Service", "/terms"], ["Privacy Policy", "/privacy"], ["Cookies", "/privacy#cookies"]] },
];

const headingClass = "font-label-md text-label-md uppercase tracking-wider text-on-surface mb-space-md";
const listClass = "space-y-space-xs font-body-sm text-body-sm text-on-surface-variant";

export default function Footer() {
  const categories = useCategories().slice(0, 4);

  return (
    <footer className="w-full bg-surface-container-lowest border-t border-outline-variant mt-space-xl">
      <div className="max-w-7xl mx-auto px-margin-sm lg:px-margin py-space-xl">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-space-lg mb-space-xl">
          <div>
            <h4 className={headingClass}>Categories</h4>
            <ul className={listClass}>
              {categories.map((c) => (
                <li key={c._id}>
                  <Link to={`/explore?category=${c.slug}`} className="hover:text-primary transition-colors">{c.name}</Link>
                </li>
              ))}
            </ul>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className={headingClass}>{col.title}</h4>
              <ul className={listClass}>
                {col.links.map(([label, to]) => (
                  <li key={to}>
                    <Link to={to} className="hover:text-primary transition-colors">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-outline-variant pt-space-md flex flex-col md:flex-row items-center justify-between gap-space-sm">
          <div className="flex items-center gap-space-xs">
            <span className="font-headline-sm text-headline-sm text-primary font-bold uppercase">GigCraft</span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">© {new Date().getFullYear()} GigCraft. A demonstration project.</span>
          </div>
          <div className="font-code-sm text-code-sm text-on-surface-variant">PAYMENTS ARE SIMULATED</div>
        </div>
      </div>
    </footer>
  );
}