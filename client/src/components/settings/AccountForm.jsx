import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import SectionCard from "../dashboard/SectionCard";
import FieldError from "../ui/FieldError";
import { inputCls, labelCls, primaryBtn } from "../ui/formStyles";
import { useAuth } from "../../hooks/useAuth";
import { profileService } from "../../services/profileService";
import { monthYear } from "../../utils/format";

export default function AccountForm() {
  const { user, setUser } = useAuth();
  const [serverError, setServerError] = useState("");
  const {
    register, handleSubmit, reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({
    defaultValues: {
      firstName: user.firstName, lastName: user.lastName,
      companyName: user.companyName || "", domainFocus: user.domainFocus || "",
    },
  });

  const onSubmit = async (v) => {
    setServerError("");
    try {
      const updated = await profileService.updateAccount({
        firstName: v.firstName.trim(),
        lastName: v.lastName.trim(),
        companyName: v.companyName.trim(),
        domainFocus: v.domainFocus.trim(),
      });
      setUser(updated);
      reset({ ...v });
      toast.success("Account updated");
    } catch (err) {
      setServerError(err.message);
    }
  };

  const nameRules = (label) => ({
    required: `${label} is required`,
    maxLength: { value: 50, message: "Maximum 50 characters" },
    validate: (val) => val.trim().length > 0 || `${label} is required`,
  });

  return (
    <SectionCard title="Account" description={`Member since ${monthYear(user.createdAt)}`}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-space-md">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
          <div>
            <label htmlFor="firstName" className={labelCls}>First name</label>
            <input id="firstName" className={inputCls(errors.firstName)} {...register("firstName", nameRules("First name"))} />
            <FieldError message={errors.firstName?.message} />
          </div>
          <div>
            <label htmlFor="lastName" className={labelCls}>Last name</label>
            <input id="lastName" className={inputCls(errors.lastName)} {...register("lastName", nameRules("Last name"))} />
            <FieldError message={errors.lastName?.message} />
          </div>
        </div>
        <div>
          <label htmlFor="email" className={labelCls}>Email</label>
          <input id="email" value={user.email} readOnly disabled className={`${inputCls(false)} bg-surface-container-low text-on-surface-variant`} />
          <p className="font-code-sm text-code-sm text-on-surface-variant mt-1">Email can't be changed in this version.</p>
        </div>
        {user.role === "client" && (
          <div>
            <label htmlFor="companyName" className={labelCls}>Company (shown to sellers)</label>
            <input id="companyName" className={inputCls(errors.companyName)} {...register("companyName", { maxLength: { value: 100, message: "Maximum 100 characters" } })} />
            <FieldError message={errors.companyName?.message} />
          </div>
        )}
        <div>
          <label htmlFor="domainFocus" className={labelCls}>Primary focus</label>
          <input id="domainFocus" className={inputCls(errors.domainFocus)} {...register("domainFocus", { maxLength: { value: 100, message: "Maximum 100 characters" } })} />
          <FieldError message={errors.domainFocus?.message} />
        </div>
        {serverError && <p role="alert" className="p-2 bg-error-container text-on-error-container font-code-sm text-code-sm border border-error">{serverError}</p>}
        <button type="submit" disabled={isSubmitting || !isDirty} className={primaryBtn}>
          {isSubmitting ? "Saving..." : "Save changes"}
        </button>
      </form>
    </SectionCard>
  );
}