import PageHeader from "../../components/dashboard/PageHeader";
import AvatarCard from "../../components/settings/AvatarCard";
import AccountForm from "../../components/settings/AccountForm";
import FreelancerProfileForm from "../../components/settings/FreelancerProfileForm";
import PasswordForm from "../../components/settings/PasswordForm";
import { useAuth } from "../../hooks/useAuth";

export default function SettingsPage() {
  const { user } = useAuth();
  return (
    <div className="space-y-space-lg">
      <PageHeader eyebrow="ACCOUNT" title="Account Settings" description="Manage your photo, details and security." />
      <AvatarCard />
      <AccountForm />
      {user.role === "freelancer" && <FreelancerProfileForm />}
      <PasswordForm />
    </div>
  );
}