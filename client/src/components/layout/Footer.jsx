import { Link } from "react-router-dom";
import { useCategories } from "../../hooks/useCategories";

const columns = [
  { title: "About", links: ["Platform Overview", "Engineering Careers", "Press & Media", "Partnership Network"] },
  { title: "Support", links: ["Help Center", "Escrow Dispute Desk", "Contract Standards", "Contact Support"] },
  { title: "Trust & Safety", links: ["Verified Badging", "Milestone Protection", "Code Auditing", "Community Guidelines"] },
  { title: "Terms & Law", links: ["Terms of Service", "Privacy Policy", "Escrow Agreement", "Cookie Preferences"] },
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
                  <Link to={`/explore?category=${c.slug}`} className="hover:text-primary transition-colors">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className={headingClass}>{col.title}</h4>
              <ul className={listClass}>
                {col.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="hover:text-primary transition-colors">{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-outline-variant pt-space-md flex flex-col md:flex-row items-center justify-between gap-space-sm">
          <div className="flex items-center gap-space-xs">
            <span className="font-headline-sm text-headline-sm text-primary font-bold uppercase">GigCraft</span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              © {new Date().getFullYear()} GigCraft Marketplace Inc. All rights reserved.
            </span>
          </div>
          <div className="font-code-sm text-code-sm text-on-surface-variant">
            ENGINEERED FOR HIGH-OUTPUT TECHNICAL CONTRACTS
          </div>
        </div>
      </div>
    </footer>
  );
}