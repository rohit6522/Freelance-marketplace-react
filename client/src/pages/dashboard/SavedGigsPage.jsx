import { useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../../components/dashboard/PageHeader";
import GigCard from "../../components/gig/GigCard";
import Pagination from "../../components/ui/Pagination";
import ErrorBox from "../../components/ui/ErrorBox";
import SkeletonBlocks from "../../components/ui/SkeletonBlocks";
import Icon from "../../components/ui/Icon";
import { useFetch } from "../../hooks/useFetch";
import { useFavorites } from "../../hooks/useFavorites";
import { favoriteService } from "../../services/favoriteService";

export default function SavedGigsPage() {
  const [page, setPage] = useState(1);
  const { isSaved, ready } = useFavorites();
  const { data, error, reload } = useFetch(() => favoriteService.list({ page, limit: 12 }), [page]);

  // Un-hearting a card removes it from the list immediately
  const gigs = (data?.gigs || [])
    .filter((g) => !ready || isSaved(g._id))
    .map((g) => ({ ...g, thumbnail: g.images?.[0]?.url, seller: g.freelancer }));

  return (
    <div className="space-y-space-lg">
      <PageHeader eyebrow="CLIENT // SAVED" title="Saved Gigs" description="Gigs you've bookmarked to come back to." />
      {error ? (
        <ErrorBox message={error} onRetry={reload} />
      ) : !data ? (
        <SkeletonBlocks count={3} cols="grid-cols-1 md:grid-cols-2 xl:grid-cols-3" height="h-72" />
      ) : gigs.length === 0 ? (
        <div className="bg-surface-container-lowest p-space-xl text-center shadow-sm">
          <Icon name="favorite" className="text-5xl text-outline" />
          <h2 className="font-headline-sm text-headline-sm uppercase text-on-surface mt-space-sm">No saved gigs</h2>
          <p className="font-body-md text-on-surface-variant mt-1">Tap the heart on any gig to save it here.</p>
          <Link to="/explore" className="inline-block mt-space-md bg-primary text-on-primary font-label-md text-label-md uppercase px-space-lg py-2 border border-primary hover:bg-primary-container">
            Browse gigs
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-space-md">
            {gigs.map((g) => <GigCard key={g._id} gig={g} />)}
          </div>
          <Pagination page={data.pagination.page} pages={data.pagination.pages} total={data.pagination.total} unit="SAVED" onChange={setPage} />
        </>
      )}
    </div>
  );
}