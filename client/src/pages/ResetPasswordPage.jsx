import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import FieldError from "../components/ui/FieldError";
import { useAuth } from "../hooks/useAuth";

const inputClass =
  "w-full px-space-md py-2.5 bg-surface-container-lowest border font-body-md text-body-md focus:border-2 focus:border-on-surface focus:outline-none";

export default function ResetPasswordPage() {
  const { token } = useParams();
  const { resetPassword } = useAuth();
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { password: "", confirm: "" } });

  const onSubmit = async ({ password }) => {
    setServerError("");
    try {
      await resetPassword(token, password);
      toast.success("Password updated. You're signed in.");
      // GuestRoute redirects automatically once the user is set
    } catch (err) {
      setServerError(err.message);
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-surface-container-lowest border border-outline-variant p-space-lg shadow-[2px_2px_0px_#0b1c30]">
      <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Choose a new password</h1>
      <p className="font-body-md text-body-md text-on-surface-variant mt-space-xs mb-space-lg">
        Use at least 8 characters, including a letter and a number.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-space-md">
        <div>
          <label htmlFor="password" className="block font-label-md text-label-md text-on-surface mb-1">New password</label>
          <input
            id="password" type="password" autoComplete="new-password"
            className={`${inputClass} ${errors.password ? "border-error" : "border-outline"}`}
            {...register("password", {
              required: "Password is required",
              minLength: { value: 8, message: "Password must be at least 8 characters" },
              maxLength: { value: 72, message: "Password must be at most 72 characters" },
              validate: {
                letter: (v) => /[A-Za-z]/.test(v) || "Password must contain a letter",
                number: (v) => /\d/.test(v) || "Password must contain a number",
              },
            })}
          />
          <FieldError message={errors.password?.message} />
        </div>
        <div>
          <label htmlFor="confirm" className="block font-label-md text-label-md text-on-surface mb-1">Confirm password</label>
          <input
            id="confirm" type="password" autoComplete="new-password"
            className={`${inputClass} ${errors.confirm ? "border-error" : "border-outline"}`}
            {...register("confirm", {
              required: "Please confirm your password",
              validate: (v) => v === watch("password") || "Passwords do not match",
            })}
          />
          <FieldError message={errors.confirm?.message} />
        </div>

        {serverError && (
          <div role="alert" className="p-2 bg-error-container text-on-error-container font-code-sm text-code-sm border border-error">
            {serverError}{" "}
            <Link to="/forgot-password" className="underline font-bold">Request a new link</Link>
          </div>
        )}

        <button
          type="submit" disabled={isSubmitting}
          className="w-full py-3 bg-primary text-on-primary font-headline-sm text-headline-sm border border-primary hover:bg-primary-container shadow-[2px_2px_0px_#0b1c30] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-75"
        >
          {isSubmitting ? "Updating..." : "Update password"}
        </button>
      </form>
    </div>
  );
}