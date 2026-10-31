import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import SectionCard from "../dashboard/SectionCard";
import FieldError from "../ui/FieldError";
import { inputCls, labelCls, primaryBtn } from "../ui/formStyles";
import { authService } from "../../services/authService";

export default function PasswordForm() {
  const [serverError, setServerError] = useState("");
  const {
    register, handleSubmit, reset, watch,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { currentPassword: "", newPassword: "", confirm: "" } });

  const onSubmit = async ({ currentPassword, newPassword }) => {
    setServerError("");
    try {
      await authService.changePassword({ currentPassword, newPassword });
      reset();
      toast.success("Password updated");
    } catch (err) {
      setServerError(err.message);
    }
  };

  return (
    <SectionCard title="Change password" description="Other devices are signed out when you change your password.">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-space-md max-w-md">
        <div>
          <label htmlFor="currentPassword" className={labelCls}>Current password</label>
          <input id="currentPassword" type="password" autoComplete="current-password" className={inputCls(errors.currentPassword)} {...register("currentPassword", { required: "Current password is required" })} />
          <FieldError message={errors.currentPassword?.message} />
        </div>
        <div>
          <label htmlFor="newPassword" className={labelCls}>New password</label>
          <input
            id="newPassword" type="password" autoComplete="new-password" className={inputCls(errors.newPassword)}
            {...register("newPassword", {
              required: "New password is required",
              minLength: { value: 8, message: "Password must be at least 8 characters" },
              maxLength: { value: 72, message: "Password must be at most 72 characters" },
              validate: {
                letter: (v) => /[A-Za-z]/.test(v) || "Password must contain a letter",
                number: (v) => /\d/.test(v) || "Password must contain a number",
              },
            })}
          />
          <FieldError message={errors.newPassword?.message} />
        </div>
        <div>
          <label htmlFor="confirm" className={labelCls}>Confirm new password</label>
          <input id="confirm" type="password" autoComplete="new-password" className={inputCls(errors.confirm)} {...register("confirm", { validate: (v) => v === watch("newPassword") || "Passwords do not match" })} />
          <FieldError message={errors.confirm?.message} />
        </div>
        {serverError && <p role="alert" className="p-2 bg-error-container text-on-error-container font-code-sm text-code-sm border border-error">{serverError}</p>}
        <button type="submit" disabled={isSubmitting} className={primaryBtn}>{isSubmitting ? "Updating..." : "Update password"}</button>
      </form>
    </SectionCard>
  );
}