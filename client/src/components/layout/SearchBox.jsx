import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Icon from "../ui/Icon";

export default function SearchBox({ className = "" }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [q, setQ] = useState(params.get("q") || "");

  const submit = (e) => {
    e.preventDefault();
    const query = q.trim();
    navigate(query ? `/explore?q=${encodeURIComponent(query)}` : "/explore");
  };

  return (
    <form
      onSubmit={submit}
      role="search"
      className={`items-center border border-outline bg-surface-container-lowest ${className}`}
    >
      <Icon name="search" className="text-outline px-space-xs text-body-md" />
      <input
        type="text"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        maxLength={100}
        aria-label="Search services, talent, or gigs"
        placeholder="Search services, talent, or gigs..."
        className="bg-transparent text-on-surface placeholder:text-outline font-body-sm text-body-sm px-space-xs py-1.5 focus:outline-none w-full md:w-64 lg:w-80"
      />
      <button
        type="submit"
        className="bg-primary text-on-primary font-label-sm text-label-sm px-space-md py-1.5 border-l border-primary hover:bg-primary-container hover:text-on-primary-container transition-colors uppercase"
      >
        Search
      </button>
    </form>
  );
}