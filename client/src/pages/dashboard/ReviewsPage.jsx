import ClientReviewsPage from "./ClientReviewsPage";
import FreelancerReviewsPage from "./FreelancerReviewsPage";
import { useAuth } from "../../hooks/useAuth";

export default function ReviewsPage() {
  const { user } = useAuth();
  return user.role === "client" ? <ClientReviewsPage /> : <FreelancerReviewsPage />;
}