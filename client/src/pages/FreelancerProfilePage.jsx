import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import Icon from "../components/ui/Icon";
import Avatar from "../components/ui/Avatar";
import ReviewsPanel from "../components/reviews/ReviewsPanel";
import { useAuth } from "../hooks/useAuth";
import { freelancerService } from "../services/freelancerService";
import { conversationService } from "../services/conversationService";
import { LEVELS, daysLabel, fullName, money, monthYear } from "../utils/format";

export default function FreelancerProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("gigs");

  useEffect(() => {
    let active = true;
    setData(null);
    setError("");
    setTab("gigs");
    freelancerService
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
        <h1 className="font-headline-lg text-headline-lg text-on-surface uppercase">Profile unavailable</h1>
        <p className="font-body-md text-on-surface-variant mt-space-sm">{error}</p>
        <Link to="/explore" className="inline-block mt-space-md bg-primary text-on-primary font-label-md uppercase px-4 py-2 border border-primary hover:bg-primary-container">
          Back to marketplace
        </Link>
      </div>
    );
  }
  if (!data) {
    return (
      <div className="max-w-7xl mx-auto px-margin-sm lg:px-margin py-space-xl animate-pulse" role="status" aria-label="Loading profile">
        <div className="h-48 bg-surface-container-high mb-space-lg" />
        <div className="h-96 bg-surface-container-high" />
      </div>
    );
  }

  const { freelancer, gigs, portfolio } = data;
  const profile = freelancer.profile || {};
  const level = LEVELS[profile.sellerLevel] || LEVELS.rising;
  const name = fullName(freelancer);
  const isOwner = user && String(user._id) === String(freelancer._id);

  const contact = async () => {
    if (!user) return navigate("/login", { state: { from: location } });
    if (user.role !== "client") return toast.error("Only client accounts can message a seller.");
    try {
      const convo = await conversationService.start({ freelancerId: freelancer._id });
      navigate(`/messages?conversation=${convo._id}`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Profile link copied");
    } catch {
      toast.error("Couldn't copy the link");
    }
  };

  const stats = [
    [profile.ratingCount ? Number(profile.ratingAverage).toFixed(1) : "—", `${profile.ratingCount || 0} Client Reviews`, true],
    [String(profile.completedOrders || 0), "Orders Completed"],
    [`${profile.experienceYears || 0}+`, "Years Experience"],
    [String(gigs.length), "Published Gigs"],
    [monthYear(freelancer.createdAt), "Member Since", false, true],
  ];

  const tabs = [
    ["gigs", `Active Gigs (${gigs.length})`],
    ["portfolio", `Portfolio & Case Studies (${portfolio.length})`],
    ["reviews", `Client Reviews (${profile.ratingCount || 0})`],
    ["history", "Work History"],
  ];

  return (
    <div className="flex flex-col w-full">
      {/* Dark spec strip */}
      <div className="w-full bg-inverse-surface text-inverse-on-surface px-margin-sm lg:px-margin py-2 flex flex-wrap items-center justify-between gap-space-sm font-code-sm text-code-sm">
        <span className="inline-flex items-center gap-1 font-label-sm text-label-sm text-primary-fixed uppercase tracking-wider">
          <span className="w-2 h-2 bg-primary-fixed" />
          SELLER ID // {String(freelancer._id).slice(-6).toUpperCase()}
        </span>
        <div className="flex items-center gap-space-lg">
          <span>LEVEL: <strong className="text-white uppercase">{level.label}</strong></span>
          <span className="hidden sm:inline">MEMBER SINCE: <strong className="text-white uppercase">{monthYear(freelancer.createdAt)}</strong></span>
        </div>
      </div>

      {/* Hero */}
      <section className="w-full bg-surface-container-lowest border-b border-outline-variant">
        <div className="max-w-7xl mx-auto px-margin-sm lg:px-margin py-space-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
            <div className="lg:col-span-8 flex flex-col md:flex-row gap-space-lg items-start">
              <div className="relative shrink-0">
                <div className="w-32 h-32 md:w-40 md:h-40 bg-surface-container-high border-2 border-on-surface overflow-hidden">
                  {freelancer.avatar?.url ? (
                    <img src={freelancer.avatar.url} alt={name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-headline-xl text-headline-xl text-on-surface">
                      {freelancer.firstName[0]}{freelancer.lastName[0]}
                    </div>
                  )}
                </div>
                <div className={`absolute -bottom-2 -right-2 px-2 py-0.5 font-label-sm text-label-sm border border-on-surface tracking-wider uppercase ${level.badge}`}>
                  {level.label}
                </div>
              </div>

              <div className="flex-1 space-y-space-sm">
                <div className="flex flex-wrap items-center gap-space-xs">
                  {profile.location && (
                    <span className="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm px-2 py-0.5 border border-outline-variant flex items-center gap-1">
                      <Icon name="location_on" className="text-[14px]" /> {profile.location}
                    </span>
                  )}
                  {profile.experienceYears > 0 && (
                    <span className="bg-surface-container text-on-surface font-label-sm text-label-sm px-2 py-0.5 border border-outline-variant uppercase">
                      {profile.experienceYears}+ yrs experience
                    </span>
                  )}
                </div>
                <div>
                  <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-bold uppercase">{name}</h1>
                  {profile.title && <p className="font-headline-sm text-headline-sm text-primary font-medium mt-0.5">{profile.title}</p>}
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl pt-1">
                  {profile.bio || "This freelancer hasn't added a bio yet."}
                </p>
              </div>
            </div>

            <div className="lg:col-span-4 w-full flex flex-col gap-space-sm bg-surface-container-low p-space-md border border-outline">
              {profile.hourlyRate > 0 && (
                <div className="flex items-center justify-between pb-space-xs border-b border-outline-variant">
                  <span className="font-label-sm text-label-sm uppercase text-on-surface-variant">Rate Indicator</span>
                  <span className="font-code-sm text-code-sm font-bold text-on-surface">{money(profile.hourlyRate)} / HOUR</span>
                </div>
              )}
              {isOwner ? (
                <p className="font-body-sm text-body-sm text-on-surface-variant">This is your public profile.</p>
              ) : (
                <button
                  type="button" onClick={contact}
                  className="w-full bg-primary-container text-white py-3 px-space-md font-label-md text-label-md uppercase tracking-wider border border-primary-container hover:bg-primary flex items-center justify-center gap-space-xs"
                >
                  <Icon name="mail" className="text-[18px]" /> Contact Seller
                </button>
              )}
              <button
                type="button" onClick={share}
                className="w-full bg-surface-container text-on-surface-variant py-2 px-space-sm font-label-sm text-label-sm uppercase border border-outline hover:text-on-surface hover:border-on-surface flex items-center justify-center gap-1"
              >
                <Icon name="share" className="text-[16px]" /> Share Profile
              </button>
            </div>
          </div>

          <div className="mt-space-lg grid grid-cols-2 md:grid-cols-5 border border-outline bg-surface-container-lowest">
            {stats.map(([value, label, star, highlight], i) => (
              <div key={label} className={`p-space-md flex flex-col justify-center border-outline ${i < 4 ? "border-r" : ""} ${i < 4 ? "border-b md:border-b-0" : ""} ${highlight ? "bg-surface-container-low" : ""}`}>
                <div className={`flex items-center gap-1 font-headline-sm text-headline-sm font-bold ${highlight ? "text-primary" : "text-on-surface"}`}>
                  {star && <Icon name="star" filled className="text-[18px] text-primary" />}
                  {value}
                </div>
                <span className="font-label-sm text-label-sm uppercase text-on-surface-variant mt-0.5">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Body */}
      <div className="max-w-7xl mx-auto px-margin-sm lg:px-margin py-space-xl w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
          <aside className="lg:col-span-4 space-y-space-lg">
            <div className="bg-surface-container-lowest border border-outline p-space-md">
              <div className="flex items-center justify-between border-b border-outline pb-space-sm mb-space-md">
                <h2 className="font-label-md text-label-md text-on-surface font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Icon name="military_tech" className="text-tertiary text-[18px]" /> Skills
                </h2>
                <span className="font-code-sm text-code-sm text-on-surface-variant">{profile.skills?.length || 0} LISTED</span>
              </div>
              {profile.skills?.length ? (
                <div className="flex flex-wrap gap-1.5">
                  {profile.skills.map((s) => (
                    <span key={s} className="border border-outline bg-surface-container-lowest text-on-surface font-code-sm text-code-sm px-2.5 py-1">{s}</span>
                  ))}
                </div>
              ) : (
                <p className="font-body-sm text-on-surface-variant">No skills listed yet.</p>
              )}
            </div>

            <div className="bg-surface-container-lowest border border-outline p-space-md">
              <div className="flex items-center justify-between border-b border-outline pb-space-sm mb-space-md">
                <h2 className="font-label-md text-label-md text-on-surface font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Icon name="translate" className="text-on-surface text-[18px]" /> Languages
                </h2>
                <span className="font-code-sm text-code-sm text-on-surface-variant">{profile.languages?.length || 0} DETECTED</span>
              </div>
              {profile.languages?.length ? (
                <div className="space-y-space-xs font-body-sm text-body-sm">
                  {profile.languages.map((l) => (
                    <div key={l.name} className="flex items-center justify-between">
                      <span className="text-on-surface">{l.name}</span>
                      <span className="font-label-sm text-label-sm bg-surface-container px-2 py-0.5 border border-outline-variant uppercase">{l.level}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="font-body-sm text-on-surface-variant">No languages listed yet.</p>
              )}
            </div>
          </aside>

          <main className="lg:col-span-8 flex flex-col space-y-space-xl">
            <div className="border-b-2 border-on-surface flex flex-wrap bg-surface-container-low" role="tablist">
              {tabs.map(([key, label], i) => (
                <button
                  key={key} type="button" role="tab" aria-selected={tab === key} onClick={() => setTab(key)}
                  className={`py-3 px-space-md font-label-md text-label-md uppercase tracking-wider ${i < tabs.length - 1 ? "border-r" : ""} ${
                    tab === key ? "bg-on-surface text-surface border-on-surface" : "bg-surface-container-lowest text-on-surface border-outline-variant hover:bg-surface-container"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {tab === "gigs" && (
              <section className="space-y-space-md">
                <div className="flex items-center justify-between border-b border-outline pb-space-xs">
                  <div>
                    <h2 className="font-headline-sm text-headline-sm uppercase text-on-surface font-bold">Available Direct Contracts</h2>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">Order directly with milestone-style escrow protection.</p>
                  </div>
                  <span className="font-code-sm text-code-sm bg-primary text-on-primary px-2.5 py-1 uppercase">{gigs.length} {gigs.length === 1 ? "Gig" : "Gigs"} Active</span>
                </div>
                {gigs.length === 0 ? (
                  <p className="font-body-md text-on-surface-variant">No published gigs yet.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-space-md">
                    {gigs.map((g) => (
                      <div key={g._id} className="bg-surface-container-lowest border border-outline flex flex-col justify-between hover:border-on-surface">
                        <Link to={`/gigs/${g._id}`} className="relative block w-full h-44 bg-surface-container-high border-b border-outline overflow-hidden">
                          {g.images?.[0]?.url ? (
                            <img src={g.images[0].url} alt="" loading="lazy" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-outline"><Icon name="image" className="text-5xl" /></div>
                          )}
                        </Link>
                        <div className="p-space-md flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between font-code-sm text-code-sm text-on-surface-variant mb-1">
                              <span className="uppercase">{daysLabel(g.minDeliveryDays)} delivery</span>
                              {g.ratingCount > 0 && <span className="text-primary font-bold">★ {g.ratingAverage.toFixed(1)} ({g.ratingCount})</span>}
                            </div>
                            <h3 className="font-label-md text-label-md font-bold text-on-surface uppercase leading-snug line-clamp-3">
                              <Link to={`/gigs/${g._id}`} className="hover:text-primary">{g.title}</Link>
                            </h3>
                          </div>
                          <div className="mt-space-md pt-space-sm border-t border-outline-variant flex items-center justify-between">
                            <div>
                              <span className="font-code-sm text-[11px] block uppercase text-on-surface-variant">Starting from</span>
                              <span className="font-headline-sm text-headline-sm font-bold text-on-surface">{money(g.startingPrice)}</span>
                            </div>
                            <Link to={`/gigs/${g._id}`} className="bg-surface-container text-on-surface border border-on-surface px-space-sm py-1.5 font-label-sm text-label-sm uppercase hover:bg-on-surface hover:text-surface">
                              Select Tier
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {tab === "portfolio" && (
              <section className="space-y-space-md">
                <div className="border-b border-outline pb-space-xs">
                  <h2 className="font-headline-sm text-headline-sm uppercase text-on-surface font-bold">Featured Case Studies & Product Proofs</h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Past engagements and their outcomes.</p>
                </div>
                {portfolio.length === 0 ? (
                  <p className="font-body-md text-on-surface-variant">No portfolio projects yet.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg">
                    {portfolio.map((p) => (
                      <div key={p._id} className="bg-surface-container-lowest border border-outline flex flex-col justify-between">
                        <div className="w-full h-56 bg-surface-container-high border-b border-outline overflow-hidden relative">
                          {p.images?.[0]?.url ? (
                            <img src={p.images[0].url} alt="" loading="lazy" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-outline"><Icon name="image" className="text-5xl" /></div>
                          )}
                          {p.metric && (
                            <div className="absolute bottom-2 left-2 bg-on-surface text-surface px-2 py-0.5 font-code-sm text-code-sm uppercase">METRIC: {p.metric}</div>
                          )}
                        </div>
                        <div className="p-space-md space-y-space-sm">
                          {(p.industry || p.durationWeeks) && (
                            <div className="flex items-center gap-space-xs font-label-sm text-label-sm uppercase text-on-surface-variant">
                              {p.industry && <span className="bg-surface-container px-2 py-0.5 border border-outline-variant">{p.industry}</span>}
                              {p.industry && p.durationWeeks && <span>//</span>}
                              {p.durationWeeks && <span>{p.durationWeeks} weeks</span>}
                            </div>
                          )}
                          <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold uppercase">{p.title}</h3>
                          <p className="font-body-sm text-body-sm text-on-surface-variant">{p.description}</p>
                          {p.deliverables?.length > 0 && (
                            <div className="border-t border-outline-variant pt-2 space-y-1">
                              <span className="font-code-sm text-[11px] block uppercase text-on-surface-variant">Key Deliverables:</span>
                              <div className="flex flex-wrap gap-1 font-code-sm text-[12px] text-on-surface">
                                {p.deliverables.map((d) => <span key={d} className="bg-surface-container-low px-1.5 py-0.5 border border-outline-variant">{d}</span>)}
                              </div>
                            </div>
                          )}
                          {p.externalLink && (
                            <a
                              href={p.externalLink} target="_blank" rel="noopener noreferrer"
                              className="w-full mt-2 bg-surface-container-lowest text-on-surface py-2 border border-on-surface font-label-sm text-label-sm uppercase hover:bg-on-surface hover:text-white flex items-center justify-center gap-1"
                            >
                              View Project <Icon name="open_in_new" className="text-[16px]" />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {tab === "reviews" && (
              <section className="space-y-space-md">
                <div className="border-b border-outline pb-space-xs">
                  <h2 className="font-headline-sm text-headline-sm uppercase text-on-surface font-bold">Verified Client Testimonials</h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Every review is tied to a completed order.</p>
                </div>
                <ReviewsPanel scope={{ freelancer: freelancer._id }} showGigTitle />
              </section>
            )}

            {tab === "history" && (
              <section className="space-y-space-md">
                <div className="border-b border-outline pb-space-xs">
                  <h2 className="font-headline-sm text-headline-sm uppercase text-on-surface font-bold">Work History & Career Trajectory</h2>
                </div>
                {profile.workHistory?.length ? (
                  <div className="space-y-space-sm">
                    {profile.workHistory.map((w, i) => (
                      <div key={`${w.company}-${i}`} className="bg-surface-container-lowest border border-outline p-space-md flex items-start justify-between gap-space-md">
                        <div>
                          <h3 className="font-label-md text-label-md text-on-surface font-bold uppercase">{w.title}</h3>
                          <p className="font-code-sm text-code-sm text-on-surface-variant uppercase mt-0.5">
                            {w.company}{w.location ? ` // ${w.location}` : ""}
                          </p>
                        </div>
                        <span className="font-code-sm text-code-sm bg-surface-container px-2 py-0.5 border border-outline-variant whitespace-nowrap uppercase">
                          {w.startYear} — {w.endYear || "Present"}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="font-body-md text-on-surface-variant">No work history added yet.</p>
                )}
              </section>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}