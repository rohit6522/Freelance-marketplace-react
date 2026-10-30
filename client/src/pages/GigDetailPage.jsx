import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import Icon from "../components/ui/Icon";
import Avatar from "../components/ui/Avatar";
import StarRating from "../components/ui/StarRating";
import CheckoutModal from "../components/gig/CheckoutModal";
import ReviewsPanel from "../components/reviews/ReviewsPanel";
import { useAuth } from "../hooks/useAuth";
import { useFavorites } from "../hooks/useFavorites";
import { gigService } from "../services/gigService";
import { conversationService } from "../services/conversationService";
import { LEVELS, TIERS, TIER_LABELS, daysLabel, fullName, money, monthYear, revisionsLabel } from "../utils/format";

const FAQS = [
  ["How does payment work?", "When you place an order, the amount is held in escrow (simulated in this demo; no real money moves). It is released to the seller only after you approve the delivery."],
  ["What if I need changes to the delivery?", "Each package includes a set number of revision rounds. After a delivery you can request a revision or approve the work. Revisions left are shown on your order."],
  ["Can I cancel an order?", "Yes, while the order is still pending you can cancel it and the held amount is refunded. Once the seller has started work, cancellation is handled by the seller."],
  ["How do I share files and requirements?", "Describe your project when you order and attach files if needed. You can also message the seller from the order page or the Contact button on this gig."],
];

export default function GigDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { isSaved, toggle } = useFavorites();

  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [tier, setTier] = useState("standard");
  const [imgIndex, setImgIndex] = useState(0);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
  const compareRef = useRef(null);

  useEffect(() => {
    let active = true;
    setData(null);
    setError("");
    setImgIndex(0);
    gigService
      .get(id)
      .then((d) => active && setData(d))
      .catch((err) => active && setError(err.message));
    return () => {
      active = false;
    };
  }, [id]);

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-margin-sm lg:px-margin py-space-xl">
        <span className="font-code-sm text-code-sm text-on-surface-variant">ERROR</span>
        <h1 className="font-headline-lg text-headline-lg text-on-surface uppercase mt-space-xs">Gig unavailable</h1>
        <p className="font-body-md text-on-surface-variant mt-space-sm">{error}</p>
        <Link to="/explore" className="inline-block mt-space-md bg-primary text-on-primary font-label-md uppercase px-4 py-2 border border-primary hover:bg-primary-container">
          Back to marketplace
        </Link>
      </div>
    );
  }
  if (!data) {
    return (
      <div className="max-w-7xl mx-auto px-margin-sm lg:px-margin py-space-xl animate-pulse" role="status" aria-label="Loading gig">
        <div className="h-10 bg-surface-container-high w-3/4 mb-space-lg" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
          <div className="lg:col-span-8 h-96 bg-surface-container-high" />
          <div className="lg:col-span-4 h-96 bg-surface-container-high" />
        </div>
      </div>
    );
  }

  const { gig, seller } = data;
  const profile = seller.profile || {};
  const level = LEVELS[profile.sellerLevel] || LEVELS.rising;
  const pkg = gig.packages[tier];
  const isOwner = user && String(user._id) === String(gig.freelancer);
  const images = gig.images || [];
  const allFeatures = [...new Set(TIERS.flatMap((t) => gig.packages[t].features))];
  const sellerName = fullName(seller);
  const saved = isSaved(gig._id);

  // Order button state
  let ctaLabel = `Continue (${money(pkg.price)})`;
  let ctaDisabled = false;
  if (gig.status !== "published") { ctaLabel = `Gig is ${gig.status}`; ctaDisabled = true; }
  else if (isOwner) { ctaLabel = "This is your gig"; ctaDisabled = true; }
  else if (user && user.role !== "client") { ctaLabel = "Client account required"; ctaDisabled = true; }
  else if (!user) ctaLabel = "Log in to order";

  const goLogin = () => navigate("/login", { state: { from: location } });
  const onContinue = () => (user ? setCheckoutOpen(true) : goLogin());

  const contactSeller = async () => {
    if (!user) return goLogin();
    if (user.role !== "client") return toast.error("Only client accounts can message a seller.");
    try {
      const convo = await conversationService.start({ gigId: gig._id });
      navigate(`/messages?conversation=${convo._id}`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const selectTier = (t) => {
    setTier(t);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="flex flex-col w-full">
      {/* Breadcrumb strip */}
      <div className="w-full bg-surface-container-low py-space-xs">
        <div className="max-w-7xl mx-auto px-margin-sm lg:px-margin flex items-center justify-between">
          <nav className="flex items-center gap-space-xs font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant overflow-x-auto py-1">
            <Link to="/explore" className="hover:text-primary whitespace-nowrap">Marketplace</Link>
            <span className="text-outline-variant font-bold">/</span>
            {gig.category && (
              <>
                <Link to={`/explore?category=${gig.category.slug}`} className="hover:text-primary whitespace-nowrap">{gig.category.name}</Link>
                <span className="text-outline-variant font-bold">/</span>
              </>
            )}
            <span className="text-on-surface font-bold whitespace-nowrap">Gig #{String(gig._id).slice(-6).toUpperCase()}</span>
          </nav>
          <span className="hidden md:inline bg-primary text-on-primary px-space-xs py-0.5 uppercase font-bold font-label-sm text-label-sm">
            Simulated escrow
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-margin-sm lg:px-margin py-space-lg w-full">
        {gig.status !== "published" && (
          <div role="status" className="mb-space-md p-space-sm bg-surface-container-high border border-on-surface font-label-md text-label-md uppercase">
            Preview: this gig is currently <strong>{gig.status}</strong> and is only visible to you.
          </div>
        )}

        {/* Header */}
        <header className="mb-space-lg">
          <div className="flex items-center gap-space-sm mb-space-xs">
            <span className={`font-label-sm text-label-sm px-2 py-0.5 uppercase tracking-wider font-bold ${level.badge}`}>{level.label}</span>
            {gig.category && <span className="bg-surface-container-high text-on-surface font-label-sm text-label-sm px-2 py-0.5 uppercase font-bold">{gig.category.name}</span>}
          </div>
          <h1 className="font-headline-xl text-headline-xl text-on-surface uppercase tracking-tight leading-none mb-space-md">{gig.title}</h1>

          <div className="bg-surface-container-lowest p-space-md flex flex-wrap items-center justify-between gap-space-md shadow-sm">
            <Link to={`/freelancers/${seller._id}`} className="flex flex-wrap items-center gap-space-md">
              <Avatar user={seller} square className="w-12 h-12" />
              <div>
                <div className="flex items-center gap-space-xs">
                  <span className="font-headline-sm text-headline-sm text-on-surface font-bold hover:text-primary">{sellerName}</span>
                </div>
                <div className="flex flex-wrap items-center gap-x-space-md gap-y-1 font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                  {gig.ratingCount > 0 ? (
                    <span className="flex items-center text-on-surface font-bold">
                      <Icon name="star" filled className="text-body-sm text-primary mr-1" />
                      {gig.ratingAverage.toFixed(1)}
                      <span className="font-normal text-on-surface-variant ml-1">({gig.ratingCount} {gig.ratingCount === 1 ? "review" : "reviews"})</span>
                    </span>
                  ) : (
                    <span className="font-bold text-on-surface">New gig</span>
                  )}
                  <span>•</span>
                  <span className="text-primary font-bold">{gig.completedOrders} completed {gig.completedOrders === 1 ? "order" : "orders"}</span>
                </div>
              </div>
            </Link>
            <div className="flex items-center gap-space-sm w-full sm:w-auto">
              <button
                type="button" onClick={() => toggle(gig._id)} aria-pressed={saved}
                className="flex-1 sm:flex-initial bg-surface-container-high text-on-surface font-label-md text-label-md uppercase tracking-wider px-space-md py-2.5 hover:bg-surface-container-highest flex items-center justify-center gap-1 font-bold"
              >
                <Icon name="bookmark" filled={saved} className="text-body-md" />
                {saved ? "Saved" : "Save"}
              </button>
              <button
                type="button" onClick={contactSeller} disabled={isOwner}
                className="flex-1 sm:flex-initial bg-primary text-on-primary font-label-md text-label-md uppercase tracking-wider px-space-lg py-2.5 hover:bg-primary-container font-bold flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Icon name="mail" className="text-body-md" /> Contact Seller
              </button>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
          {/* LEFT */}
          <section className="lg:col-span-8 flex flex-col gap-space-xl">
            {/* Gallery */}
            <div className="bg-surface-container-lowest p-space-md shadow-sm">
              <div className="relative w-full aspect-[16/10] bg-surface-container overflow-hidden">
                {images[imgIndex] ? (
                  <>
                    <img src={images[imgIndex].url} alt={`${gig.title} preview ${imgIndex + 1}`} className="w-full h-full object-cover" />
                    <a
                      href={images[imgIndex].url} target="_blank" rel="noopener noreferrer"
                      className="absolute bottom-4 right-4 bg-surface-container-lowest text-on-surface px-3 py-1.5 flex items-center gap-2 font-label-sm text-label-sm font-bold shadow-sm hover:text-primary"
                    >
                      <Icon name="visibility" className="text-body-sm text-primary" /> View full size
                    </a>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-outline"><Icon name="image" className="text-6xl" /></div>
                )}
              </div>
              {images.length > 1 && (
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-space-sm mt-space-md">
                  {images.map((img, i) => (
                    <button
                      key={img.url} type="button" onClick={() => setImgIndex(i)} aria-label={`Show image ${i + 1}`} aria-pressed={i === imgIndex}
                      className={`p-1 ${i === imgIndex ? "bg-surface-container-highest" : "bg-surface-container hover:bg-surface-container-high"}`}
                    >
                      <img src={img.url} alt="" className="w-full h-16 object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* About */}
            <article className="bg-surface-container-lowest p-space-xl shadow-sm">
              <div className="bg-surface-container-low px-space-md py-space-xs font-code-sm text-code-sm uppercase tracking-wider text-on-surface-variant font-bold mb-space-md inline-block">
                MODULE 02 // SCOPE
              </div>
              <h2 className="font-headline-lg text-headline-lg text-on-surface uppercase mb-space-md tracking-tight">About This Gig</h2>
              <div className="space-y-space-md font-body-md text-body-md text-on-surface-variant leading-relaxed">
                {gig.description.split(/\n+/).filter(Boolean).map((p, i) => <p key={i}>{p}</p>)}
              </div>

              <div className="mt-space-xl bg-surface-container-low p-space-lg">
                <h3 className="font-headline-sm text-headline-sm text-on-surface uppercase font-bold mb-space-md flex items-center gap-2">
                  <Icon name="check_box" filled className="text-primary text-headline-sm" />
                  What You Will Receive ({TIER_LABELS[tier]})
                </h3>
                {pkg.features.length ? (
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-space-md font-body-sm text-body-sm text-on-surface">
                    {pkg.features.map((f) => (
                      <li key={f} className="flex items-start gap-space-sm bg-surface-container-lowest p-space-md">
                        <span className="w-5 h-5 bg-primary text-on-primary flex items-center justify-center font-bold text-label-sm shrink-0">✓</span>
                        <span className="font-bold">{f}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="font-body-sm text-on-surface-variant">{pkg.description}</p>
                )}
              </div>

              <div className="mt-space-lg">
                <h3 className="font-headline-sm text-headline-sm text-on-surface uppercase font-bold mb-space-md">Why Work With Me</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md">
                  {[
                    [`${profile.experienceYears || 0}+ YRS`, "Professional Experience", profile.title || "Independent specialist"],
                    [String(profile.completedOrders || 0), "Orders Completed", "Delivered through GigCraft escrow"],
                    [profile.ratingCount ? Number(profile.ratingAverage).toFixed(1) : "—", "Average Rating", `${profile.ratingCount || 0} client ${profile.ratingCount === 1 ? "review" : "reviews"}`],
                  ].map(([big, label, text]) => (
                    <div key={label} className="bg-surface-container p-space-md">
                      <div className="font-headline-lg text-headline-lg font-bold text-primary mb-1">{big}</div>
                      <div className="font-label-sm text-label-sm uppercase font-bold text-on-surface">{label}</div>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </article>

            {/* Compare packages */}
            <section ref={compareRef} className="bg-surface-container-lowest p-space-xl shadow-sm scroll-mt-32">
              <div className="bg-surface-container-low px-space-md py-space-xs font-code-sm text-code-sm uppercase tracking-wider text-on-surface-variant font-bold mb-space-xs inline-block">
                MODULE 03 // MATRIX SPECIFICATION
              </div>
              <h2 className="font-headline-lg text-headline-lg text-on-surface uppercase tracking-tight mb-space-md">Compare Packages</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left font-body-sm text-body-sm min-w-[32rem]">
                  <thead>
                    <tr className="bg-surface-container-low text-on-surface uppercase font-label-sm text-label-sm">
                      <th className="p-space-md">Parameters</th>
                      {TIERS.map((t) => (
                        <th key={t} className={`p-space-md ${t === "standard" ? "bg-primary-fixed text-on-primary-fixed" : "bg-surface-container"}`}>
                          {TIER_LABELS[t]}
                          <div className="font-headline-sm text-headline-sm font-bold mt-1">{money(gig.packages[t].price)}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["Delivery Time", (p) => daysLabel(p.deliveryDays)],
                      ["Revisions Included", (p) => revisionsLabel(p.revisions)],
                    ].map(([label, fn], r) => (
                      <tr key={label} className={r % 2 ? "bg-surface-container-low/40" : "bg-surface-container-lowest"}>
                        <td className="p-space-md font-bold text-on-surface">{label}</td>
                        {TIERS.map((t) => (
                          <td key={t} className={`p-space-md ${t === "standard" ? "bg-primary-fixed-dim/20 font-bold text-primary" : "bg-surface-container text-on-surface-variant"}`}>
                            {fn(gig.packages[t])}
                          </td>
                        ))}
                      </tr>
                    ))}
                    {allFeatures.map((f, r) => (
                      <tr key={f} className={(r + 2) % 2 ? "bg-surface-container-low/40" : "bg-surface-container-lowest"}>
                        <td className="p-space-md font-bold text-on-surface">{f}</td>
                        {TIERS.map((t) => {
                          const has = gig.packages[t].features.includes(f);
                          return (
                            <td key={t} className={`p-space-md font-bold ${t === "standard" ? "bg-primary-fixed-dim/20" : "bg-surface-container"} ${has ? "text-primary" : "text-outline-variant"}`}>
                              {has ? "✓ Included" : "—"}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                    <tr className="bg-surface-container-low">
                      <td className="p-space-md" />
                      {TIERS.map((t) => (
                        <td key={t} className={`p-space-md ${t === "standard" ? "bg-primary-fixed" : "bg-surface-container"}`}>
                          <button
                            type="button" onClick={() => selectTier(t)}
                            className={`w-full font-label-sm text-label-sm uppercase py-2 font-bold transition-colors ${
                              t === "standard" ? "bg-primary text-on-primary hover:bg-primary-container" : "bg-surface-container-highest text-on-surface hover:bg-on-surface hover:text-surface"
                            }`}
                          >
                            Select {TIER_LABELS[t]}
                          </button>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Reviews */}
            <section className="bg-surface-container-lowest p-space-xl shadow-sm">
              <div className="bg-surface-container-low px-space-md py-space-xs font-code-sm text-code-sm uppercase tracking-wider text-on-surface-variant font-bold mb-space-xs inline-block">
                MODULE 04 // CLIENT REVIEWS
              </div>
              <h2 className="font-headline-lg text-headline-lg text-on-surface uppercase tracking-tight mb-space-lg">Client Verification & Reviews</h2>
              <ReviewsPanel scope={{ gig: gig._id }} />
            </section>

            {/* FAQ */}
            <section className="bg-surface-container-lowest p-space-xl shadow-sm">
              <div className="bg-surface-container-low px-space-md py-space-xs font-code-sm text-code-sm uppercase tracking-wider text-on-surface-variant font-bold mb-space-xs inline-block">
                MODULE 05 // FREQUENT INQUIRIES
              </div>
              <h2 className="font-headline-lg text-headline-lg text-on-surface uppercase tracking-tight mb-space-lg">Frequently Asked Questions</h2>
              <div className="space-y-space-sm">
                {FAQS.map(([q, a], i) => {
                  const open = openFaq === i;
                  return (
                    <div key={q} className="bg-surface-container-low">
                      <button
                        type="button" aria-expanded={open} onClick={() => setOpenFaq(open ? -1 : i)}
                        className="w-full text-left p-space-md flex items-center justify-between font-headline-sm text-headline-sm text-on-surface font-bold hover:bg-surface-container"
                      >
                        <span>{q}</span>
                        <Icon name="expand_more" className={`text-primary transition-transform ${open ? "rotate-180" : ""}`} />
                      </button>
                      {open && <div className="p-space-md pt-0 font-body-md text-body-md text-on-surface-variant">{a}</div>}
                    </div>
                  );
                })}
              </div>
            </section>
          </section>

          {/* RIGHT (sticky) */}
          <aside className="lg:col-span-4 flex flex-col gap-space-lg lg:sticky lg:top-[7.5rem]">
            <div className="bg-surface-container-lowest p-space-lg shadow-sm">
              <div className="grid grid-cols-3 bg-surface-container mb-space-md" role="tablist" aria-label="Packages">
                {TIERS.map((t) => (
                  <button
                    key={t} type="button" role="tab" aria-selected={tier === t} onClick={() => setTier(t)}
                    className={`py-space-sm px-1 text-center font-label-sm text-label-sm font-bold uppercase transition-colors ${
                      tier === t ? "bg-surface-container-lowest text-primary" : "text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    {TIER_LABELS[t]}
                    <span className={`block font-code-sm text-code-sm ${tier === t ? "text-primary font-bold" : "text-on-surface"}`}>{money(gig.packages[t].price)}</span>
                  </button>
                ))}
              </div>

              <div className="mb-space-lg">
                <div className="flex items-baseline justify-between gap-2 mb-space-xs">
                  <h3 className="font-headline-sm text-headline-sm text-on-surface uppercase font-bold">{pkg.title}</h3>
                  <span className="font-headline-lg text-headline-lg text-primary font-bold">{money(pkg.price)}</span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">{pkg.description}</p>

                <div className="bg-surface-container-low p-space-md space-y-space-xs mb-space-md font-body-sm text-body-sm">
                  <div className="flex items-center justify-between text-on-surface">
                    <span className="flex items-center gap-1.5 font-bold uppercase text-label-sm"><Icon name="schedule" className="text-body-md text-primary" /> Delivery Time</span>
                    <span className="font-code-sm text-code-sm font-bold">{daysLabel(pkg.deliveryDays)}</span>
                  </div>
                  <div className="flex items-center justify-between text-on-surface">
                    <span className="flex items-center gap-1.5 font-bold uppercase text-label-sm"><Icon name="sync" className="text-body-md text-primary" /> Revisions</span>
                    <span className="font-code-sm text-code-sm font-bold">{revisionsLabel(pkg.revisions)}</span>
                  </div>
                </div>

                <ul className="space-y-space-xs font-body-sm text-body-sm text-on-surface mb-space-lg">
                  {pkg.features.map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <span className="w-4 h-4 bg-primary text-on-primary flex items-center justify-center font-bold text-label-sm shrink-0">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>

                <div className="space-y-space-sm">
                  <button
                    type="button" onClick={onContinue} disabled={ctaDisabled}
                    className="w-full bg-primary text-on-primary font-headline-sm text-headline-sm uppercase tracking-wider py-space-md font-bold hover:bg-primary-container shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {ctaLabel}
                    {!ctaDisabled && <Icon name="arrow_forward" className="text-headline-sm" />}
                  </button>
                  <button
                    type="button" onClick={() => compareRef.current?.scrollIntoView({ behavior: "smooth" })}
                    className="w-full bg-surface-container-high text-on-surface font-label-md text-label-md uppercase tracking-wider py-space-sm font-bold hover:bg-surface-container-highest"
                  >
                    Compare Packages
                  </button>
                </div>

                <div className="mt-space-md bg-surface-container-low p-space-sm text-center font-code-sm text-code-sm text-on-surface-variant uppercase font-bold">
                  <span className="text-primary">🔒 Simulated escrow</span> // released on your approval
                </div>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-space-lg shadow-sm">
              <div className="bg-surface-container-low px-space-md py-space-xs font-code-sm text-code-sm uppercase tracking-wider text-on-surface-variant font-bold mb-space-md">
                ABOUT THE SELLER
              </div>
              <div className="flex items-center gap-space-md mb-space-md">
                <Avatar user={seller} square className="w-14 h-14" />
                <div className="min-w-0">
                  <h4 className="font-headline-sm text-headline-sm text-on-surface font-bold truncate">{sellerName}</h4>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">{profile.title || "Freelancer"}</p>
                </div>
              </div>
              <div className="space-y-space-xs font-body-sm text-body-sm bg-surface-container-low p-space-md mb-space-md">
                {[
                  ["Location", profile.location],
                  ["Member Since", monthYear(seller.createdAt)],
                  ["Experience", profile.experienceYears ? `${profile.experienceYears}+ years` : null],
                  ["Languages", profile.languages?.length ? profile.languages.map((l) => l.name).join(", ") : null],
                ].filter(([, v]) => v).map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between gap-2">
                    <span className="text-on-surface-variant font-bold uppercase text-label-sm">{label}</span>
                    <span className="text-on-surface font-bold text-right">{value}</span>
                  </div>
                ))}
              </div>
              <Link
                to={`/freelancers/${seller._id}`}
                className="w-full bg-surface-container-highest text-on-surface font-label-md text-label-md uppercase tracking-wider py-space-md font-bold hover:bg-on-surface hover:text-surface flex items-center justify-center gap-2"
              >
                <Icon name="person" className="text-body-md" /> View Profile
              </Link>
            </div>

            <div className="bg-surface-container-high p-space-md">
              <div className="flex items-start gap-space-sm">
                <Icon name="shield" filled className="text-primary text-headline-md" />
                <div>
                  <h5 className="font-headline-sm text-body-md text-on-surface font-bold uppercase">GigCraft Escrow Guard</h5>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 leading-normal">
                    Funds are held in escrow and only released once you inspect and approve the delivery.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {checkoutOpen && <CheckoutModal open={checkoutOpen} onClose={() => setCheckoutOpen(false)} gig={gig} tier={tier} />}
    </div>
  );
}