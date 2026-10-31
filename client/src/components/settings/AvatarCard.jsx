import { useState } from "react";
import toast from "react-hot-toast";
import SectionCard from "../dashboard/SectionCard";
import Avatar from "../ui/Avatar";
import Icon from "../ui/Icon";
import { useAuth } from "../../hooks/useAuth";
import { profileService } from "../../services/profileService";

export default function AvatarCard() {
  const { user, setUser } = useAuth();
  const [busy, setBusy] = useState(false);

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    try {
      setUser(await profileService.uploadAvatar(file));
      toast.success("Profile photo updated");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <SectionCard title="Profile photo" description="JPG, PNG or WebP, up to 5 MB.">
      <div className="flex items-center gap-space-lg">
        <Avatar user={user} square className="w-24 h-24" />
        <label className="inline-flex items-center gap-1.5 px-space-md py-2 border border-on-surface font-label-sm text-label-sm uppercase font-bold cursor-pointer hover:bg-surface-container-high">
          <Icon name={busy ? "sync" : "upload"} className={`text-base ${busy ? "animate-spin" : ""}`} />
          {busy ? "Uploading..." : "Upload new photo"}
          <input type="file" accept=".jpg,.jpeg,.png,.webp" className="sr-only" onChange={onFile} disabled={busy} />
        </label>
      </div>
    </SectionCard>
  );
}