import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import Icon from "../components/ui/Icon";
import FieldError from "../components/ui/FieldError";
import { GithubIcon, GoogleIcon } from "../components/ui/BrandIcons";
import { useAuth } from "../hooks/useAuth";
import { DOMAINS } from "../constants/domains";
import { assessPassword } from "../utils/passwordStrength";

const EMAIL_RX = /^\S+@\S+\.\S+$/;
const FORM_FIELDS = ["firstName", "lastName", "email", "password", "acceptTerms"];

const inputBase =
  "w-full px-space-md py-2.5 bg-surface-container-lowest border text-on-surface font-body-md text-body-md focus:border-2 focus:border-on-surface focus:outline-none";
const hardShadowBtn =
  "flex items-center justify-center gap-space-sm px-space-md py-3 bg-surface-container-lowest border border-on-surface text-on-surface hover:bg-surface-container-low transition-none shadow-[2px_2px_0px_#0b1c30] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none font-label-md text-label-md";

const ROLES = {
  client: {
    icon: "business_center",
    tag: "Hire Talent",
    title: "Client / Engineering Lead",
    text: "Post technical gigs, escrow milestone contracts, and hire vetted engineers & architects with automated deliverables verification.",
    footLeft: "Buyer Escrow Mode",
    footRight: "0% Upfront Post",
    cta: "Create Client Account & Hire Engineers",
  },
  freelancer: {
    icon: "terminal",
    tag: "Work & Sell",
    title: "Freelancer / Specialist",
    text: "Publish pre-scoped technical services, pass verified code audits, and unlock immediate milestone settlement upon PR approvals.",
    footLeft: "Builder Workspace",
    footRight: "Direct Settlement",
    cta: "Create Developer Profile & Get Booked",
  },
};

function RoleCard({ id, active, onSelect }) {
  const r = ROLES[id];
  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      aria-pressed={active}
      className={`text-left p-space-md relative flex flex-col justify-between transition-none ${
        active
          ? "bg-surface-container-low border-2 border-primary"
          : "bg-surface-container-lowest border border-outline-variant hover:border-on-surface"
      }`}
    >
      <div>
        <div className="flex items-center justify-between mb-space-sm">
          <div className="flex items-center gap-space-xs">
            <Icon name={r.icon} className={`text-xl ${active ? "text-primary" : "text-on-surface-variant"}`} />
            <span className="font-label-md text-label-md text-on-surface uppercase">{r.tag}</span>
          </div>
          <span
            className={`w-4 h-4 flex items-center justify-center ${
              active ? "bg-primary text-on-primary" : "border border-outline-variant text-transparent"
            }`}
          >
            <Icon name="check" className="text-xs" />
          </span>
        </div>
        <h3 className="font-headline-sm text-headline-sm text-on-surface">{r.title}</h3>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-xs">{r.text}</p>
      </div>
      <div className="mt-space-md pt-space-xs border-t border-outline-variant flex items-center justify-between">
        <span className={`font-label-sm text-label-sm font-bold uppercase ${active ? "text-primary" : "text-on-surface-variant"}`}>
          {r.footLeft}
        </span>
        <span className="font-code-sm text-code-sm text-on-surface-variant">{r.footRight}</span>
      </div>
    </button>
  );
}

function CustomCheckbox({ checked, error, children, registration, id }) {
  return (
    <div>
      <label className="flex items-start gap-space-sm cursor-pointer select-none">
        <input id={id} type="checkbox" className="peer sr-only" {...registration} />
        <div
          className={`w-4 h-4 mt-0.5 border flex items-center justify-center flex-shrink-0 peer-focus-visible:ring-2 peer-focus-visible:ring-primary ${
            checked ? "bg-primary border-primary text-on-primary" : "bg-surface-container-lowest border-on-surface text-transparent"
          }`}
        >
          <Icon name="check" className="text-xs" />
        </div>
        <span className="font-body-sm text-body-sm text-on-surface-variant">{children}</span>
      </label>
      <FieldError message={error} />
    </div>
  );
}

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const location = useLocation();
  const [role, setRole] = useState(location.state?.role === "freelancer" ? "freelancer" : "client");
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      firstName: "", lastName: "", email: "", password: "",
      domain: "fullstack", acceptTerms: false, marketingOptIn: false,
    },
  });

  const password = watch("password");
  const acceptTerms = watch("acceptTerms");
  const marketingOptIn = watch("marketingOptIn");
  const strength = assessPassword(password);

  const segColor = (i) => {
    if (strength.score < i) return "bg-outline-variant";
    if (strength.score === 1) return "bg-error";
    if (strength.score === 2) return "bg-primary-container";
    return "bg-primary";
  };
  const strengthColor = strength.score === 0 ? "text-on-surface-variant" : strength.score === 1 ? "text-error" : "text-primary";

  const onSubmit = async (v) => {
    setServerError("");
    try {
      await registerUser({
        firstName: v.firstName.trim(),
        lastName: v.lastName.trim(),
        email: v.email.trim(),
        password: v.password,
        role,
        domainFocus: DOMAINS.find((d) => d.value === v.domain)?.label,
        marketingOptIn: v.marketingOptIn,
        acceptTerms: true,
      });
      toast.success("Account created. Welcome to GigCraft!");
      // GuestRoute redirects automatically once the user is set
    } catch (err) {
      err.details?.forEach((d) => {
        if (FORM_FIELDS.includes(d.field)) setError(d.field, { message: d.message });
      });
      if (err.status === 409) setError("email", { message: err.message });
      setServerError(err.message);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-space-sm mb-space-md">
        <span className="inline-flex items-center gap-space-xs px-2.5 py-1 bg-surface-container text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider border border-outline-variant">
          <span className="w-2 h-2 bg-primary" />
          JOIN THE TECHNICAL MARKETPLACE
        </span>
        <span className="font-code-sm text-code-sm text-on-surface-variant">/ PROTOCOL REGISTRATION v2.4</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
        {/* Main form pane */}
        <div className="lg:col-span-8 bg-surface-container-lowest border border-outline-variant p-space-md sm:p-space-lg lg:p-space-xl shadow-[2px_2px_0px_#0b1c30]">
          <div className="mb-space-lg border-b border-outline-variant pb-space-lg">
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Create your GigCraft account</h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-space-xs">
              Join thousands of engineering teams and top-tier technical freelancers contracting under deterministic milestones.
            </p>
          </div>

          <div className="mb-space-lg">
            <span className="block font-label-md text-label-md text-on-surface uppercase tracking-wide mb-space-sm">
              Select Account Archetype
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
              <RoleCard id="client" active={role === "client"} onSelect={setRole} />
              <RoleCard id="freelancer" active={role === "freelancer"} onSelect={setRole} />
            </div>
          </div>

          <div className="space-y-space-sm mb-space-lg">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
              <button type="button" className={hardShadowBtn} onClick={() => toast("GitHub sign-up isn't available yet. Please register with email.")}>
                <GithubIcon />
                <span>Sign up with GitHub</span>
              </button>
              <button type="button" className={hardShadowBtn} onClick={() => toast("Google sign-up isn't available yet. Please register with email.")}>
                <GoogleIcon />
                <span>Sign up with Google</span>
              </button>
            </div>
          </div>

          <div className="relative flex items-center justify-center my-space-lg">
            <div className="w-full border-t border-outline-variant" />
            <span className="absolute bg-surface-container-lowest px-space-md font-code-sm text-code-sm uppercase tracking-widest text-on-surface-variant">
              OR COMPLETE REGISTRATION
            </span>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-space-md">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
              <div>
                <label htmlFor="firstName" className="block font-label-md text-label-md text-on-surface mb-1">
                  First Name <span className="text-primary font-bold">*</span>
                </label>
                <input
                  id="firstName" type="text" autoComplete="given-name" placeholder="Linus"
                  aria-invalid={Boolean(errors.firstName)}
                  className={`${inputBase} ${errors.firstName ? "border-error" : "border-outline"}`}
                  {...register("firstName", {
                    required: "First name is required",
                    maxLength: { value: 50, message: "Maximum 50 characters" },
                    validate: (v) => v.trim().length > 0 || "First name is required",
                  })}
                />
                <FieldError message={errors.firstName?.message} />
              </div>
              <div>
                <label htmlFor="lastName" className="block font-label-md text-label-md text-on-surface mb-1">
                  Last Name <span className="text-primary font-bold">*</span>
                </label>
                <input
                  id="lastName" type="text" autoComplete="family-name" placeholder="Torvalds"
                  aria-invalid={Boolean(errors.lastName)}
                  className={`${inputBase} ${errors.lastName ? "border-error" : "border-outline"}`}
                  {...register("lastName", {
                    required: "Last name is required",
                    maxLength: { value: 50, message: "Maximum 50 characters" },
                    validate: (v) => v.trim().length > 0 || "Last name is required",
                  })}
                />
                <FieldError message={errors.lastName?.message} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="email" className="block font-label-md text-label-md text-on-surface">
                  Work Email <span className="text-primary font-bold">*</span>
                </label>
                <span className="font-code-sm text-code-sm text-on-surface-variant">Used for escrow confirmations</span>
              </div>
              <div className="relative">
                <input
                  id="email" type="email" autoComplete="email" placeholder="engineer@enterprise.io"
                  aria-invalid={Boolean(errors.email)}
                  className={`${inputBase} ${errors.email ? "border-error" : "border-outline"}`}
                  {...register("email", {
                    required: "Email is required",
                    pattern: { value: EMAIL_RX, message: "Please enter a valid email" },
                  })}
                />
                <div className="absolute right-3 top-3 text-on-surface-variant pointer-events-none">
                  <Icon name="alternate_email" className="text-sm" />
                </div>
              </div>
              <FieldError message={errors.email?.message} />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="block font-label-md text-label-md text-on-surface">
                  Password <span className="text-primary font-bold">*</span>
                </label>
                <span className={`font-code-sm text-code-sm font-bold uppercase ${strengthColor}`} aria-live="polite">
                  Strength: {strength.label}
                </span>
              </div>
              <div className="relative mb-2">
                <input
                  id="password" type={showPassword ? "text" : "password"} autoComplete="new-password"
                  placeholder="••••••••••••••••"
                  aria-invalid={Boolean(errors.password)}
                  className={`${inputBase} tracking-wider pr-10 ${errors.password ? "border-error" : "border-outline"}`}
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
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-2.5 text-on-surface-variant hover:text-on-surface focus:outline-none"
                >
                  <Icon name={showPassword ? "visibility_off" : "visibility"} className="text-base" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-1.5 h-1.5 w-full bg-surface-container">
                {[1, 2, 3].map((i) => (
                  <div key={i} className={`${segColor(i)} h-full`} />
                ))}
              </div>
              <div className="flex justify-between text-[11px] font-code-sm uppercase tracking-wide text-on-surface-variant mt-1.5">
                <span>Fair (&gt;8 chars)</span>
                <span className="text-center">Strong (mixed chars)</span>
                <span className="text-right">Enterprise Grade (symbols)</span>
              </div>
              <FieldError message={errors.password?.message} />
            </div>

            <div>
              <label htmlFor="domain" className="block font-label-md text-label-md text-on-surface mb-1">
                Primary Domain Focus
              </label>
              <div className="relative mb-2">
                <select
                  id="domain"
                  className={`${inputBase} border-outline appearance-none`}
                  {...register("domain")}
                >
                  {DOMAINS.map((d) => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-3 top-3 text-on-surface">
                  <Icon name="unfold_more" className="text-sm" />
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  ["ui-ux", "#Figma UI/UX"],
                  ["fullstack", "#Next.js & Edge"],
                  ["smart-contracts", "#Smart Contracts"],
                  ["ai-ml", "#LLM Architectures"],
                ].map(([value, label]) => (
                  <button
                    key={value} type="button"
                    onClick={() => setValue("domain", value, { shouldDirty: true })}
                    className="px-2 py-1 bg-surface-container-low border border-outline-variant text-on-surface font-label-sm text-label-sm hover:border-on-surface"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-space-sm pt-space-xs">
              <CustomCheckbox
                id="acceptTerms"
                checked={acceptTerms}
                error={errors.acceptTerms?.message}
                registration={register("acceptTerms", { required: "You must accept the Terms of Service" })}
              >
                I agree to the{" "}
                <a href="#" className="text-on-surface font-bold underline hover:text-primary">GigCraft Escrow Terms of Service</a>,{" "}
                <a href="#" className="text-on-surface font-bold underline hover:text-primary">Deterministic Dispute Policy</a>, and{" "}
                <a href="#" className="text-on-surface font-bold underline hover:text-primary">Code Review Standards</a>.
              </CustomCheckbox>
              <CustomCheckbox id="marketingOptIn" checked={marketingOptIn} registration={register("marketingOptIn")}>
                Send me weekly curated technical gig digests, benchmark contract rate indexes, and core engineering telemetry updates.
              </CustomCheckbox>
            </div>

            <div className="pt-space-sm">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-space-lg bg-primary-container text-on-primary font-headline-sm text-headline-sm uppercase tracking-wide border border-primary-container hover:bg-primary transition-none shadow-[2px_2px_0px_#0b1c30] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none flex items-center justify-center gap-space-sm disabled:opacity-75 disabled:cursor-not-allowed"
              >
                <span>{isSubmitting ? "Creating account..." : ROLES[role].cta}</span>
                <Icon name={isSubmitting ? "sync" : "arrow_forward"} className={`text-lg ${isSubmitting ? "animate-spin" : ""}`} />
              </button>
              {serverError && (
                <p role="alert" className="mt-2 p-2 bg-error-container text-on-error-container font-code-sm text-code-sm border border-error text-center">
                  {serverError}
                </p>
              )}
            </div>
          </form>

          <div className="mt-space-lg pt-space-md border-t border-outline-variant flex items-center justify-between">
            <span className="font-body-sm text-body-sm text-on-surface-variant">Already verified on the GigCraft node network?</span>
            <Link to="/login" className="font-label-md text-label-md text-primary font-bold hover:underline flex items-center gap-1">
              <span>Log In</span>
              <Icon name="login" className="text-sm" />
            </Link>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-space-md">
          <div className="bg-surface-container-lowest border border-outline-variant p-space-md shadow-[2px_2px_0px_#0b1c30]">
            <div className="flex items-center justify-between pb-space-xs border-b border-outline-variant mb-space-sm">
              <span className="font-label-sm text-label-sm uppercase text-on-surface font-bold tracking-wider">Protocol Guarantee</span>
              <span className="font-code-sm text-code-sm bg-primary-fixed text-on-primary-fixed px-1.5 py-0.5 border border-primary">ACTIVE</span>
            </div>
            <div className="space-y-space-sm">
              {[
                ["verified_user", "100% Escrow Milestone Vault", "Contract funds locked in neutral cryptographic escrow before any coding commences."],
                ["sync_saved_locally", "Instant GitHub Portfolio Sync", "Auto-benchmark PR merge rates, commit volume, and test coverage to auto-tier your profile."],
                ["payments", "Zero Upfront Hiring Fee", "Browse, interview, and initiate technical tests without retainer requirements or subscription gating."],
              ].map(([icon, title, text]) => (
                <div key={title} className="flex items-start gap-space-sm">
                  <div className="w-7 h-7 bg-surface-container flex items-center justify-center flex-shrink-0 border border-outline-variant">
                    <Icon name={icon} className="text-base text-primary" />
                  </div>
                  <div>
                    <h4 className="font-label-md text-label-md text-on-surface">{title}</h4>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface-container-low border border-outline-variant p-space-md">
            <div className="flex items-center justify-between mb-space-sm">
              <span className="font-label-sm text-label-sm uppercase text-on-surface-variant">Current Network Telemetry</span>
              <span className="font-code-sm text-[10px] bg-primary text-on-primary px-1.5 py-0.5">DEMO DATA</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-surface-container-lowest border border-outline-variant p-2.5">
                <span className="font-code-sm text-code-sm text-on-surface-variant block">AVG FILL TIME</span>
                <span className="font-headline-sm text-headline-sm text-on-surface font-bold block mt-0.5">3.8 hrs</span>
                <span className="font-code-sm text-[10px] text-primary block mt-0.5">▲ 14% FASTER</span>
              </div>
              <div className="bg-surface-container-lowest border border-outline-variant p-2.5">
                <span className="font-code-sm text-code-sm text-on-surface-variant block">ESCROW VOLUME</span>
                <span className="font-headline-sm text-headline-sm text-on-surface font-bold block mt-0.5">$24.2M</span>
                <span className="font-code-sm text-[10px] text-on-surface-variant block mt-0.5">Q1 VERIFIED</span>
              </div>
            </div>
            <div className="mt-space-sm bg-surface-container-lowest border border-outline-variant p-2.5">
              <div className="flex justify-between items-center mb-1">
                <span className="font-label-sm text-label-sm text-on-surface">Milestone Dispute Rate</span>
                <span className="font-code-sm text-code-sm text-primary font-bold">0.08%</span>
              </div>
              <div className="w-full h-10 flex items-end">
                <svg className="w-full h-8 overflow-visible" fill="none" viewBox="0 0 160 30" aria-hidden="true">
                  <polyline points="0,25 25,22 50,26 75,18 100,19 125,12 150,8 160,6" stroke="#005d42" strokeLinecap="square" strokeWidth="2" />
                  <circle cx="160" cy="6" fill="#047857" r="2.5" />
                  <line stroke="#bdc9c1" strokeDasharray="2 2" strokeWidth="1" x1="0" x2="160" y1="28" y2="28" />
                </svg>
              </div>
              <div className="flex justify-between font-code-sm text-[9px] text-on-surface-variant mt-1 border-t border-outline-variant pt-1">
                <span>OCT</span><span>NOV</span><span>DEC</span><span>JAN</span><span>LIVE</span>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant p-space-md">
            <div className="flex items-center gap-space-sm">
              <div className="w-12 h-12 bg-surface-container-high border border-outline flex items-center justify-center font-headline-sm text-on-surface font-bold">AK</div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-label-md text-label-md text-on-surface truncate">Alex K.</span>
                  <span className="px-1.5 bg-primary-fixed text-on-primary-fixed font-code-sm text-[10px] border border-primary">STAFF ARCHITECT</span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant truncate">Distributed Systems &amp; Rust</p>
              </div>
            </div>
            <div className="mt-space-sm pt-space-xs border-t border-outline-variant">
              <p className="font-body-sm text-body-sm text-on-surface-variant italic">
                “GigCraft’s escrow code milestone checks removed invoice chasing entirely. First gig landed within 24 hours of GitHub verification.”
              </p>
              <div className="mt-2 flex items-center justify-between text-on-surface-variant font-code-sm text-code-sm">
                <span>38 COMPLETED CONTRACTS</span>
                <span className="text-primary font-bold">★ 5.0 RATING</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trust ribbon */}
      <div className="mt-space-xl bg-surface-container-low border border-outline-variant p-space-md lg:p-space-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
          {[
            ["gavel", "Deterministic Escrow", "Zero upfront platform commission until milestone delivery passes static code analysis and buyer verification."],
            ["security", "SOC-2 Type II Custody", "Enterprise payroll, tax compliance (1099/W8-BEN), and bank disbursements across 140+ countries."],
            ["verified", "Pre-Screened Talent", "Only the top 3% of technical applicants pass algorithmic repo evaluations and live architecture screens."],
          ].map(([icon, title, text]) => (
            <div key={title} className="flex items-start gap-space-sm">
              <div className="p-2 bg-surface-container-lowest border border-outline-variant text-primary flex-shrink-0">
                <Icon name={icon} className="text-xl" />
              </div>
              <div>
                <h5 className="font-label-md text-label-md text-on-surface uppercase tracking-wide">{title}</h5>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}