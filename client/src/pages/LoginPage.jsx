import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import Icon from "../components/ui/Icon";
import FieldError from "../components/ui/FieldError";
import { GithubIcon, GoogleIcon } from "../components/ui/BrandIcons";
import { useAuth } from "../hooks/useAuth";
import PlatformStatsPanel from "../components/auth/PlatformStatsPanel";

const EMAIL_RX = /^\S+@\S+\.\S+$/;

const inputBase =
  "w-full bg-surface-container-lowest border px-3.5 py-2.5 font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:border-on-surface focus:outline-none transition-colors";
const addon = "inline-flex items-center px-3.5 bg-surface-container-low border border-outline-variant text-on-surface-variant";

const trustCards = [
  { icon: "lock", title: "Secure sessions", text: "Passwords are hashed with bcrypt. Sign-in uses an httpOnly cookie that scripts can't read." },
  { icon: "account_balance_wallet", title: "Simulated escrow", text: "Order payments are held in a demo escrow and released when the client approves the delivery. No real money moves." },
  { icon: "reviews", title: "Reviews from real orders", text: "Only clients with a completed order can leave a review, one per order." },
];

export default function LoginPage() {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const [verified, setVerified] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { email: "", password: "", remember: true } });

  const onSubmit = async (values) => {
    setServerError("");
    setVerified(false);
    try {
      await login({ email: values.email.trim(), password: values.password, remember: values.remember });
      setVerified(true);
      toast.success("Signed in successfully");
    } catch (err) {
      setServerError(err.message);
    }
  };

  const oauthUnavailable = (name) =>
    toast(`${name} sign-in isn't available yet. Please use your email and password.`);

  return (
    <div>
      {/* Top system strip */}
      <div className="flex flex-wrap items-center justify-between border-b border-outline-variant pb-space-sm mb-space-lg gap-space-sm">
        <div className="flex items-center gap-space-sm">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-surface-container text-primary font-code-sm text-code-sm font-semibold border border-outline-variant">
            <span className="w-2 h-2 bg-primary" />
            SECURE SIGN-IN
          </span>
          <span className="font-code-sm text-code-sm text-on-surface-variant hidden sm:inline">
            HTTPS // HTTPONLY SESSION COOKIE
          </span>
        </div>
        <div className="flex items-center gap-space-md text-on-surface-variant font-code-sm text-code-sm">
          <span className="flex items-center gap-1">
            <Icon name="verified_user" className="text-base text-primary" /> BCRYPT PASSWORDS
          </span>
          <span className="hidden md:inline text-outline-variant">|</span>
          <span className="hidden md:flex items-center gap-1">
            <Icon name="lock" className="text-base text-primary" /> SIMULATED ESCROW
          </span>
        </div>
      </div>

      {/* Dual panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 border border-outline-variant bg-surface-container-lowest">
        {/* Left: form */}
        <div className="lg:col-span-7 p-space-md sm:p-space-lg lg:p-space-xl flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-outline-variant">
          <div>
            <div className="mb-space-lg">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-surface-container-low border border-outline-variant mb-space-sm">
                <Icon name="security" filled className="text-primary text-sm" />
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface font-semibold">
                  SECURE ESCROW AUTHENTICATION
                </span>
              </div>
              <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
                Sign in to GigCraft
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                Access your digital contracts, active sprints, and milestone disbursements.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm mb-space-lg">
              <button
                type="button"
                onClick={() => oauthUnavailable("GitHub")}
                className="flex items-center justify-center gap-space-sm px-4 py-3 bg-surface-container-lowest border border-on-surface hover:bg-surface-container-low transition-all text-on-surface font-label-md text-label-md"
              >
                <GithubIcon />
                <span>GitHub Workspace</span>
              </button>
              <button
                type="button"
                onClick={() => oauthUnavailable("Google")}
                className="flex items-center justify-center gap-space-sm px-4 py-3 bg-surface-container-lowest border border-on-surface hover:bg-surface-container-low transition-all text-on-surface font-label-md text-label-md"
              >
                <GoogleIcon />
                <span>Google Cloud Identity</span>
              </button>
            </div>

            <div className="relative flex items-center justify-center my-space-lg">
              <div className="w-full border-t border-outline-variant" />
              <span className="absolute px-3 bg-surface-container-lowest font-code-sm text-code-sm text-on-surface-variant uppercase tracking-wider">
                Or with Work Email
              </span>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-space-md">
              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="email"
                  className="flex items-center justify-between font-label-sm text-label-sm text-on-surface uppercase font-semibold"
                >
                  <span>Corporate Email</span>
                  <span className="text-on-surface-variant font-code-sm">REQUIRED</span>
                </label>
                <div className="flex">
                  <span className={`${addon} border-r-0`}>
                    <Icon name="alternate_email" className="text-lg" />
                  </span>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="developer@agency.io"
                    aria-invalid={Boolean(errors.email)}
                    className={`${inputBase} ${errors.email ? "border-error" : "border-outline-variant"}`}
                    {...register("email", {
                      required: "Email is required",
                      pattern: { value: EMAIL_RX, message: "Please enter a valid email" },
                    })}
                  />
                </div>
                <FieldError message={errors.email?.message} />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="font-label-sm text-label-sm text-on-surface uppercase font-semibold">
                    Access Key / Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="font-label-sm text-label-sm text-primary hover:text-primary-container font-semibold transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="flex">
                  <span className={`${addon} border-r-0`}>
                    <Icon name="key" className="text-lg" />
                  </span>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••••••••••"
                    aria-invalid={Boolean(errors.password)}
                    className={`${inputBase} border-r-0 ${errors.password ? "border-error" : "border-outline-variant"}`}
                    {...register("password", { required: "Password is required" })}
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword((s) => !s)}
                    className="px-3.5 bg-surface-container-low border border-outline-variant text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors flex items-center"
                  >
                    <Icon name={showPassword ? "visibility_off" : "visibility"} className="text-lg" />
                  </button>
                </div>
                <FieldError message={errors.password?.message} />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-space-sm pt-space-xs">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded-none accent-primary border border-on-surface cursor-pointer"
                    {...register("remember")}
                  />
                  <span className="font-body-sm text-body-sm text-on-surface">Keep me signed in on this hardware</span>
                </label>
                <span className="inline-flex items-center gap-1 font-code-sm text-code-sm text-primary px-2 py-0.5 bg-surface-container-low border border-outline-variant font-medium">
                  <Icon name="shield" className="text-xs" />
                  HTTPS session
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-primary text-on-primary font-headline-sm text-headline-sm tracking-tight border border-primary hover:bg-primary-container transition-colors disabled:opacity-75 disabled:cursor-not-allowed"
              >
                <Icon name="login" className="text-xl" />
                <span>Sign In to Workspace</span>
              </button>
            </form>

            {/* Status banner */}
            {(isSubmitting || verified || serverError) && (
              <div
                role={serverError ? "alert" : "status"}
                className={`mt-space-md p-space-sm border ${serverError
                  ? "bg-error-container border-error text-on-error-container"
                  : "bg-surface-container border-outline-variant"
                  }`}
              >
                <div className="flex items-center gap-2">
                  {serverError ? (
                    <>
                      <Icon name="error" className="text-lg" />
                      <span className="font-body-sm text-body-sm font-medium">{serverError}</span>
                    </>
                  ) : verified ? (
                    <>
                      <Icon name="check_circle" className="text-primary text-lg" />
                      <span className="font-body-sm text-body-sm text-primary font-semibold">
                        Authorization token verified. Loading dashboard modules...
                      </span>
                    </>
                  ) : (
                    <>
                      <Icon name="sync" className="text-primary text-lg animate-spin" />
                      <span className="font-body-sm text-body-sm text-on-surface font-medium">
                        Establishing encrypted handshakes with multi-sig vault...
                      </span>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="mt-space-xl pt-space-md border-t border-outline-variant flex flex-col sm:flex-row items-center justify-between gap-space-sm">
            <div className="font-body-sm text-body-sm text-on-surface-variant">Don't have an enterprise account?</div>
            <div className="flex items-center gap-space-sm">
              <Link
                to="/register"
                state={{ role: "client" }}
                className="px-3 py-1.5 bg-surface-container-low border border-outline-variant font-label-sm text-label-sm uppercase font-semibold text-primary hover:bg-primary hover:text-on-primary hover:border-primary transition-all"
              >
                Sign Up as Client
              </Link>
              <Link
                to="/register"
                state={{ role: "freelancer" }}
                className="px-3 py-1.5 bg-surface-container-low border border-outline-variant font-label-sm text-label-sm uppercase font-semibold text-on-surface hover:bg-on-surface hover:text-surface-container-lowest hover:border-on-surface transition-all"
              >
                Apply as Freelancer
              </Link>
            </div>
          </div>
        </div>

        {/* Right: live platform metrics */}
        <div className="lg:col-span-5 bg-surface-container-low p-space-md sm:p-space-lg lg:p-space-xl">
          <PlatformStatsPanel />
        </div>
      </div>

      {/* Trust rail */}
      <div className="mt-space-lg grid grid-cols-1 md:grid-cols-3 gap-space-md">
        {trustCards.map((c) => (
          <div key={c.title} className="flex items-start gap-space-sm p-space-md bg-surface-container-lowest border border-outline-variant">
            <Icon name={c.icon} className="text-primary text-2xl" />
            <div>
              <div className="font-label-md text-label-md text-on-surface font-semibold">{c.title}</div>
              <div className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">{c.text}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}