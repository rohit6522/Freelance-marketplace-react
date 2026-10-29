import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import Icon from "../components/ui/Icon";
import FieldError from "../components/ui/FieldError";
import { authService } from "../services/authService";

export default function ForgotPasswordPage() {
  const [message, setMessage] = useState("");
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { email: "" } });

  const onSubmit = async ({ email }) => {
    setServerError("");
    try {
      setMessage(await authService.forgotPassword(email.trim()));
    } catch (err) {
      setServerError(err.message);
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-surface-container-lowest border border-outline-variant p-space-lg shadow-[2px_2px_0px_#0b1c30]">
      <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Reset your password</h1>
      <p className="font-body-md text-body-md text-on-surface-variant mt-space-xs mb-space-lg">
        Enter your account email and we'll send you a link to choose a new password.
      </p>

      {message ? (
        <div role="status" className="p-space-md bg-surface-container border border-outline-variant">
          <div className="flex items-start gap-2">
            <Icon name="mark_email_read" className="text-primary" />
            <p className="font-body-sm text-body-sm text-on-surface">{message}</p>
          </div>
          {import.meta.env.DEV && (
            <p className="mt-space-sm font-code-sm text-code-sm text-on-surface-variant">
              Dev mode: no email service is connected, so the reset link is printed in the server terminal.
            </p>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-space-md">
          <div>
            <label htmlFor="email" className="block font-label-md text-label-md text-on-surface mb-1">
              Email <span className="text-primary font-bold">*</span>
            </label>
            <input
              id="email" type="email" autoComplete="email" placeholder="you@company.com"
              className={`w-full px-space-md py-2.5 bg-surface-container-lowest border font-body-md text-body-md focus:border-2 focus:border-on-surface focus:outline-none ${errors.email ? "border-error" : "border-outline"}`}
              {...register("email", {
                required: "Email is required",
                pattern: { value: /^\S+@\S+\.\S+$/, message: "Please enter a valid email" },
              })}
            />
            <FieldError message={errors.email?.message} />
          </div>
          {serverError && (
            <p role="alert" className="p-2 bg-error-container text-on-error-container font-code-sm text-code-sm border border-error">
              {serverError}
            </p>
          )}
          <button
            type="submit" disabled={isSubmitting}
            className="w-full py-3 bg-primary text-on-primary font-headline-sm text-headline-sm border border-primary hover:bg-primary-container shadow-[2px_2px_0px_#0b1c30] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-75"
          >
            {isSubmitting ? "Sending..." : "Send reset link"}
          </button>
        </form>
      )}

      <div className="mt-space-lg pt-space-md border-t border-outline-variant">
        <Link to="/login" className="font-label-md text-label-md text-primary font-bold hover:underline">
          ← Back to sign in
        </Link>
      </div>
    </div>
  );
}