import PageHeader from "../../components/dashboard/PageHeader";
import SectionCard from "../../components/dashboard/SectionCard";
import ReviewsPanel from "../../components/reviews/ReviewsPanel";
import SellerReviewActions from "../../components/reviews/SellerReviewActions";
import { useAuth } from "../../hooks/useAuth";

export default function FreelancerReviewsPage() {
  const { user } = useAuth();
  return (
    <div className="space-y-space-lg">
      <PageHeader eyebrow="SELLER // REVIEWS" title="Client Reviews" description="Reply publicly to reviews, or report ones that break the rules." />
      <SectionCard title="All reviews">
        <ReviewsPanel
          scope={{ freelancer: user._id }} showGigTitle
          actions={(review, reload) => <SellerReviewActions review={review} onChanged={reload} />}
        />
      </SectionCard>
    </div>
  );
}