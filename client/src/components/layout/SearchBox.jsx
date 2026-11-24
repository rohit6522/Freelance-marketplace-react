import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Icon from "../ui/Icon";
import { gigService } from "../../services/gigService";
import { money } from "../../utils/format";

export default function SearchBox({ className = "" }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [q, setQ] = useState(params.get("q") || "");
  const [suggestions, setSuggestions] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const boxRef = useRef(null);
  const debounceTimer = useRef(null);

  // Sync state if URL query changes
  useEffect(() => {
    setQ(params.get("q") || "");
  }, [params]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch suggestions with debounce
  useEffect(() => {
    const trimmed = q.trim();
    if (!trimmed || trimmed.length < 1) {
      setSuggestions(null);
      setLoading(false);
      return;
    }

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await gigService.getSuggestions(trimmed);
        setSuggestions(res);
        setSelectedIndex(-1);
      } catch (err) {
        console.error("Failed to load search suggestions:", err);
      } finally {
        setLoading(false);
      }
    }, 220);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [q]);

  const submit = (e) => {
    if (e) e.preventDefault();
    const query = q.trim();
    setIsOpen(false);
    navigate(query ? `/explore?q=${encodeURIComponent(query)}` : "/explore");
  };

  const handleSelectQuery = (val) => {
    setQ(val);
    setIsOpen(false);
    navigate(`/explore?q=${encodeURIComponent(val)}`);
  };

  const handleSelectCategory = (cat) => {
    setIsOpen(false);
    navigate(`/explore?category=${encodeURIComponent(cat.slug)}`);
  };

  const handleSelectTag = (tag) => {
    setQ(tag);
    setIsOpen(false);
    navigate(`/explore?q=${encodeURIComponent(tag)}`);
  };

  const handleSelectGig = (gigId) => {
    setIsOpen(false);
    navigate(`/gigs/${gigId}`);
  };

  // Build flattened list of keyboard navigable actions
  const navigableItems = [];
  if (suggestions?.didYouMean) {
    navigableItems.push({ type: "didYouMean", value: suggestions.didYouMean });
  }
  suggestions?.categories?.forEach((c) => {
    navigableItems.push({ type: "category", value: c });
  });
  suggestions?.tags?.forEach((t) => {
    navigableItems.push({ type: "tag", value: t });
  });
  suggestions?.gigs?.forEach((g) => {
    navigableItems.push({ type: "gig", value: g });
  });

  const handleKeyDown = (e) => {
    if (!isOpen || !suggestions) {
      if (e.key === "Enter") submit(e);
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < navigableItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : navigableItems.length - 1));
    } else if (e.key === "Escape") {
      setIsOpen(false);
    } else if (e.key === "Enter") {
      if (selectedIndex >= 0 && selectedIndex < navigableItems.length) {
        e.preventDefault();
        const item = navigableItems[selectedIndex];
        if (item.type === "didYouMean") handleSelectQuery(item.value);
        else if (item.type === "category") handleSelectCategory(item.value);
        else if (item.type === "tag") handleSelectTag(item.value);
        else if (item.type === "gig") handleSelectGig(item.value._id);
      } else {
        submit(e);
      }
    }
  };

  const hasSuggestions =
    suggestions &&
    (suggestions.didYouMean ||
      suggestions.categories?.length > 0 ||
      suggestions.tags?.length > 0 ||
      suggestions.gigs?.length > 0);

  return (
    <div ref={boxRef} className={`relative ${className}`}>
      <form
        onSubmit={submit}
        role="search"
        className="flex items-center border border-outline bg-surface-container-lowest w-full relative"
      >
        <Icon name="search" className="text-outline px-space-xs text-body-md" />
        <input
          type="text"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            if (q.trim()) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          maxLength={100}
          aria-label="Search services, talent, or gigs"
          placeholder="Search services, talent, or gigs..."
          className="bg-transparent text-on-surface placeholder:text-outline font-body-sm text-body-sm px-space-xs py-1.5 focus:outline-none w-full md:w-64 lg:w-80"
          autoComplete="off"
        />
        {loading && (
          <span className="text-outline text-xs px-2 animate-pulse">...</span>
        )}
        <button
          type="submit"
          className="bg-primary text-on-primary font-label-sm text-label-sm px-space-md py-1.5 border-l border-primary hover:bg-primary-container hover:text-on-primary-container transition-colors uppercase shrink-0"
        >
          Search
        </button>
      </form>

      {/* Autocomplete / Suggestions Dropdown */}
      {isOpen && hasSuggestions && (
        <div
          role="listbox"
          className="absolute left-0 right-0 top-full mt-1 bg-surface-container-lowest border-2 border-primary shadow-xl z-50 overflow-hidden divide-y divide-outline-variant text-left"
        >
          {/* Typo tolerance 'Did you mean?' hint */}
          {suggestions.didYouMean && (
            <div
              onClick={() => handleSelectQuery(suggestions.didYouMean)}
              className={`p-space-xs px-space-sm flex items-center gap-space-xs cursor-pointer transition-colors bg-secondary-container/30 hover:bg-secondary-container text-on-secondary-container ${
                navigableItems[selectedIndex]?.type === "didYouMean" ? "ring-2 ring-primary" : ""
              }`}
            >
              <Icon name="spellcheck" className="text-primary text-body-md" />
              <div className="font-body-sm text-body-sm">
                <span>Did you mean: </span>
                <strong className="text-primary underline uppercase font-bold">
                  {suggestions.didYouMean}
                </strong>
                ?
              </div>
            </div>
          )}

          {/* Categories */}
          {suggestions.categories?.length > 0 && (
            <div className="p-space-xs px-space-sm">
              <div className="font-code-sm text-code-sm text-outline uppercase font-bold tracking-wider mb-1">
                Categories
              </div>
              <div className="flex flex-wrap gap-1.5">
                {suggestions.categories.map((cat) => {
                  const itemIndex = navigableItems.findIndex(
                    (it) => it.type === "category" && it.value._id === cat._id
                  );
                  const isSelected = selectedIndex === itemIndex;
                  return (
                    <button
                      key={cat._id}
                      type="button"
                      onClick={() => handleSelectCategory(cat)}
                      className={`text-left inline-flex items-center gap-1 font-label-sm text-label-sm px-2 py-0.5 border border-outline-variant hover:border-primary hover:bg-surface-container-high transition-colors ${
                        isSelected ? "bg-primary text-on-primary border-primary" : "text-on-surface"
                      }`}
                    >
                      {cat.icon && <Icon name={cat.icon} className="text-xs" />}
                      <span>{cat.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tags */}
          {suggestions.tags?.length > 0 && (
            <div className="p-space-xs px-space-sm">
              <div className="font-code-sm text-code-sm text-outline uppercase font-bold tracking-wider mb-1">
                Tags & Skills
              </div>
              <div className="flex flex-wrap gap-1.5">
                {suggestions.tags.map((tag) => {
                  const itemIndex = navigableItems.findIndex(
                    (it) => it.type === "tag" && it.value === tag
                  );
                  const isSelected = selectedIndex === itemIndex;
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleSelectTag(tag)}
                      className={`font-label-sm text-label-sm px-2 py-0.5 border border-outline-variant hover:border-secondary hover:text-secondary transition-colors ${
                        isSelected ? "bg-secondary text-on-secondary border-secondary" : "text-on-surface-variant bg-surface-container-high"
                      }`}
                    >
                      #{tag}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Matching Gigs */}
          {suggestions.gigs?.length > 0 && (
            <div className="divide-y divide-outline-variant">
              <div className="p-space-xs px-space-sm font-code-sm text-code-sm text-outline uppercase font-bold tracking-wider bg-surface-container-low">
                Services & Gigs
              </div>
              {suggestions.gigs.map((gig) => {
                const itemIndex = navigableItems.findIndex(
                  (it) => it.type === "gig" && it.value._id === gig._id
                );
                const isSelected = selectedIndex === itemIndex;
                return (
                  <div
                    key={gig._id}
                    onClick={() => handleSelectGig(gig._id)}
                    className={`p-space-xs px-space-sm flex items-center justify-between gap-space-sm cursor-pointer hover:bg-surface-container transition-colors ${
                      isSelected ? "bg-surface-container-high border-l-4 border-primary" : ""
                    }`}
                  >
                    <div className="flex items-center gap-space-xs min-w-0">
                      {gig.thumbnail ? (
                        <img
                          src={gig.thumbnail}
                          alt=""
                          className="w-8 h-8 object-cover border border-outline-variant shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-surface-container-high flex items-center justify-center shrink-0 border border-outline-variant">
                          <Icon name="work" className="text-outline text-sm" />
                        </div>
                      )}
                      <div className="truncate">
                        <div className="font-body-sm text-body-sm text-on-surface truncate font-semibold">
                          {gig.title}
                        </div>
                        {gig.categoryName && (
                          <div className="font-label-sm text-label-sm text-outline truncate">
                            {gig.categoryName}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-label-sm text-label-sm font-bold text-primary">
                        From {money(gig.startingPrice)}
                      </div>
                      {gig.ratingAverage > 0 && (
                        <div className="font-code-sm text-code-sm text-outline">
                          ★ {gig.ratingAverage.toFixed(1)}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* View all button / hint */}
          <div
            onClick={() => submit()}
            className="p-space-xs px-space-sm font-label-sm text-label-sm text-primary uppercase font-bold hover:bg-primary-container/30 cursor-pointer flex items-center justify-between"
          >
            <span>See all results for &quot;{q}&quot;</span>
            <Icon name="arrow_forward" className="text-sm" />
          </div>
        </div>
      )}
    </div>
  );
}
