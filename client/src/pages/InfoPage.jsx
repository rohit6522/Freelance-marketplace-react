import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { PAGES, PAGE_ORDER } from "../content/infoPages";

export default function InfoPage({ pageKey }) {
  const page = PAGES[pageKey];
  const { hash } = useLocation();

  useEffect(() => {
    const previous = document.title;
    document.title = `${page.title} | GigCraft`;
    return () => {
      document.title = previous;
    };
  }, [page]);

  // Jump to #anchors from footer links, otherwise start at the top
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView?.();
    else window.scrollTo(0, 0);
  }, [hash, pageKey]);

  return (
    <div className="max-w-7xl mx-auto px-margin-sm lg:px-margin py-space-xl">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        <nav aria-label="Information pages" className="lg:col-span-3 lg:sticky lg:top-[7.5rem] bg-surface-container-lowest shadow-sm flex lg:flex-col overflow-x-auto">
          {PAGE_ORDER.map((key) => (
            <Link
              key={key} to={PAGES[key].path} aria-current={key === pageKey ? "page" : undefined}
              className={`px-space-md py-space-sm font-label-md text-label-md whitespace-nowrap border-b-2 lg:border-b-0 lg:border-l-4 ${
                key === pageKey ? "bg-surface-container-low text-primary font-bold border-primary" : "text-on-surface-variant border-transparent hover:bg-surface-container-low hover:text-on-surface"
              }`}
            >
              {PAGES[key].title}
            </Link>
          ))}
        </nav>

        <article className="lg:col-span-9 bg-surface-container-lowest p-space-xl shadow-sm space-y-space-lg">
          <header>
            <span className="font-code-sm text-code-sm uppercase tracking-widest text-primary font-bold">GIGCRAFT // INFO</span>
            <h1 className="font-headline-lg text-headline-lg text-on-surface uppercase tracking-tight">{page.title}</h1>
            {page.intro && <p className="font-body-md text-body-md text-on-surface-variant mt-space-sm">{page.intro}</p>}
          </header>

          {page.notice && (
            <p role="note" className="p-space-sm bg-surface-container-high border-l-4 border-primary font-body-sm text-body-sm text-on-surface">{page.notice}</p>
          )}

          {page.sections.map((s) => (
            <section key={s.id} id={s.id} className="scroll-mt-32">
              <h2 className="font-headline-sm text-headline-sm text-on-surface uppercase mb-space-xs">{s.heading}</h2>
              {s.paragraphs?.map((p) => (
                <p key={p} className="font-body-md text-body-md text-on-surface-variant mb-space-xs">{p}</p>
              ))}
              {s.items && (
                <ul className="list-disc pl-space-lg space-y-1 font-body-md text-body-md text-on-surface-variant">
                  {s.items.map((i) => <li key={i}>{i}</li>)}
                </ul>
              )}
            </section>
          ))}
        </article>
      </div>
    </div>
  );
}