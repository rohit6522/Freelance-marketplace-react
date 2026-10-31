import ClientReviewsPage from "./ClientReviewsPage";
import ComingSoonPage from "../ComingSoonPage";
import { useAuth } from "../../hooks/useAuth";

export default function ReviewsPage() {
  const { user } = useAuth();
  return user.role === "client" ? <ClientReviewsPage /> : <ComingSoonPage title="Reviews" />;
}