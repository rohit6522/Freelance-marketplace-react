import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import SectionCard from "../dashboard/SectionCard";
import Modal from "../ui/Modal";
import FieldError from "../ui/FieldError";
import { ghostBtn, inputCls, labelCls } from "../ui/formStyles";
import { useAuth } from "../../hooks/useAuth";
import { profileService } from "../../services/profileService";

export default function DeleteAccountCard() {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState("");
  const {
    register, handleSubmit, reset,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { password: "", confirm: "" } });

  const close = () => {
    setOpen(false);
    setServerError("");
    reset();
  };

  const onSubmit = async ({ password, confirm }) => {
    setServerError("");
    try {
      await profileService.deleteAccount({ password, confirm });
      toast.success("Your account has been deleted");
      navigate("/explore", { replace: true }); // leave protected pages first, then drop the session
      setUser(null);
    } catch (err) {
      setServerError(err.message);
    }
  };

  return (
    <SectionCard title="Delete account" description="Permanently remove your personal data from GigCraft.">
      <button
        type="button" onClick={() => setOpen(true)}
        className="px-space-lg py-2.5 border border-error text-error font-label-md text-label-md uppercase font-bold hover:bg-error hover:text-on-error"
      >
        Delete my account
      </button>

      <Modal open={open} onClose={close} title="Delete your account" maxWidth="max-w-lg">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="p-space-lg space-y-space-md">
          <div className="font-body-sm text-body-sm text-on-surface-variant space-y-space-xs">
            <p><strong className="text-on-surface">This can't be undone.</strong></p>
            <ul className="list-disc pl-space-lg space-y-1">
              <li>Your profile, portfolio, saved gigs and photo are deleted.</li>
              <li>Gigs without orders are deleted. Gigs that have orders are hidden.</li>
              <li>Your orders, messages and reviews stay for the other person's records and for accurate ratings, shown as "Deleted User".</li>
              <li>You can't delete your account while you have active orders.</li>
            </ul>
          </div>

          <div>
            <label htmlFor="del-password" className={labelCls}>Your password</label>
            <input id="del-password" type="password" autoComplete="current-password" className={inputCls(errors.password)} {...register("password", { required: "Password is required" })} />
            <FieldError message={errors.password?.message} />
          </div>

          <div>
            <label htmlFor="del-confirm" className={labelCls}>Type DELETE to confirm</label>
            <input
              id="del-confirm" autoComplete="off" className={inputCls(errors.confirm)}
              {...register("confirm", { validate: (v) => v === "DELETE" || "Type DELETE exactly" })}
            />
            <FieldError message={errors.confirm?.message} />
          </div>

          {serverError && <p role="alert" className="p-2 bg-error-container text-on-error-container font-code-sm text-code-sm border border-error">{serverError}</p>}

          <div className="flex flex-col-reverse sm:flex-row gap-space-sm sm:justify-end">
            <button type="button" onClick={close} className={ghostBtn}>Keep my account</button>
            <button
              type="submit" disabled={isSubmitting}
              className="px-space-lg py-2.5 bg-error text-on-error border border-error font-label-md text-label-md uppercase font-bold hover:opacity-90 disabled:opacity-60"
            >
              {isSubmitting ? "Deleting..." : "Delete account permanently"}
            </button>
          </div>
        </form>
      </Modal>
    </SectionCard>
  );
}