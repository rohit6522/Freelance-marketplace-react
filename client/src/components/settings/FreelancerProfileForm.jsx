import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import SectionCard from "../dashboard/SectionCard";
import FieldError from "../ui/FieldError";
import Icon from "../ui/Icon";
import ErrorBox from "../ui/ErrorBox";
import { ghostBtn, inputCls, labelCls, primaryBtn } from "../ui/formStyles";
import { useFetch } from "../../hooks/useFetch";
import { profileService } from "../../services/profileService";

const LEVELS = ["basic", "conversational", "fluent", "native"];

const toForm = (p = {}) => ({
  title: p.title || "",
  location: p.location || "",
  bio: p.bio || "",
  experienceYears: p.experienceYears ?? 0,
  hourlyRate: p.hourlyRate || "",
  skills: (p.skills || []).join(", "),
  languages: (p.languages || []).map((l) => ({ name: l.name, level: l.level })),
  workHistory: (p.workHistory || []).map((w) => ({
    title: w.title, company: w.company, location: w.location || "",
    startYear: w.startYear, endYear: w.endYear ?? "",
  })),
});

const toPayload = (v) => ({
  title: v.title.trim(),
  location: v.location.trim(),
  bio: v.bio.trim(),
  experienceYears: Number(v.experienceYears) || 0,
  hourlyRate: Number(v.hourlyRate) || 0,
  skills: [...new Set(v.skills.split(",").map((s) => s.trim()).filter(Boolean))],
  languages: v.languages.map((l) => ({ name: l.name.trim(), level: l.level })),
  workHistory: v.workHistory.map((w) => ({
    title: w.title.trim(), company: w.company.trim(), location: (w.location || "").trim(),
    startYear: Number(w.startYear),
    endYear: w.endYear === "" || w.endYear == null ? null : Number(w.endYear),
  })),
});

export default function FreelancerProfileForm() {
  const { data, error, reload } = useFetch(() => profileService.me(), []);
  const [serverError, setServerError] = useState("");
  const {
    register, control, handleSubmit, reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({ defaultValues: toForm() });
  const languages = useFieldArray({ control, name: "languages" });
  const work = useFieldArray({ control, name: "workHistory" });

  useEffect(() => {
    if (data) reset(toForm(data.profile));
  }, [data, reset]);

  const onSubmit = async (v) => {
    setServerError("");
    try {
      const profile = await profileService.updateFreelancer(toPayload(v));
      reset(toForm(profile));
      toast.success("Public profile updated");
    } catch (err) {
      setServerError(err.message);
    }
  };

  if (error) return <ErrorBox message={error} onRetry={reload} />;

  return (
    <SectionCard title="Public freelancer profile" description="This is what clients see on your profile page.">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-space-md">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
          <div>
            <label htmlFor="title" className={labelCls}>Professional title</label>
            <input id="title" placeholder="Senior UI/UX Designer" className={inputCls(errors.title)} {...register("title", { maxLength: { value: 100, message: "Maximum 100 characters" } })} />
            <FieldError message={errors.title?.message} />
          </div>
          <div>
            <label htmlFor="location" className={labelCls}>Location</label>
            <input id="location" placeholder="Berlin, Germany" className={inputCls(errors.location)} {...register("location", { maxLength: { value: 100, message: "Maximum 100 characters" } })} />
            <FieldError message={errors.location?.message} />
          </div>
          <div>
            <label htmlFor="experienceYears" className={labelCls}>Years of experience</label>
            <input id="experienceYears" type="number" min="0" max="60" className={inputCls(errors.experienceYears)} {...register("experienceYears", { min: { value: 0, message: "Must be 0 or more" }, max: { value: 60, message: "Maximum 60" } })} />
            <FieldError message={errors.experienceYears?.message} />
          </div>
          <div>
            <label htmlFor="hourlyRate" className={labelCls}>Hourly rate (USD, optional)</label>
            <input id="hourlyRate" type="number" min="0" max="10000" step="1" className={inputCls(errors.hourlyRate)} {...register("hourlyRate", { min: { value: 0, message: "Must be 0 or more" }, max: { value: 10000, message: "Maximum 10,000" } })} />
            <FieldError message={errors.hourlyRate?.message} />
          </div>
        </div>

        <div>
          <label htmlFor="bio" className={labelCls}>Biography</label>
          <textarea id="bio" rows={5} maxLength={2000} className={inputCls(errors.bio)} {...register("bio", { maxLength: { value: 2000, message: "Maximum 2000 characters" } })} />
          <FieldError message={errors.bio?.message} />
        </div>

        <div>
          <label htmlFor="skills" className={labelCls}>Skills (comma separated, up to 30)</label>
          <input
            id="skills" placeholder="Figma, Design Systems, React" className={inputCls(errors.skills)}
            {...register("skills", {
              validate: (val) => {
                const list = val.split(",").map((s) => s.trim()).filter(Boolean);
                if (list.length > 30) return "A maximum of 30 skills is allowed";
                if (list.some((s) => s.length > 40)) return "Each skill must be 40 characters or fewer";
                return true;
              },
            })}
          />
          <FieldError message={errors.skills?.message} />
        </div>

        <fieldset>
          <legend className={labelCls}>Languages</legend>
          <div className="space-y-space-xs">
            {languages.fields.map((f, i) => (
              <div key={f.id} className="flex gap-space-xs items-start">
                <div className="flex-1">
                  <input aria-label="Language" placeholder="English" className={inputCls(errors.languages?.[i]?.name)} {...register(`languages.${i}.name`, { required: "Language is required" })} />
                  <FieldError message={errors.languages?.[i]?.name?.message} />
                </div>
                <select aria-label="Level" className={`${inputCls(false)} w-40`} {...register(`languages.${i}.level`)}>
                  {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
                <button type="button" aria-label="Remove language" onClick={() => languages.remove(i)} className="p-2.5 hover:text-error"><Icon name="delete" /></button>
              </div>
            ))}
          </div>
          {languages.fields.length < 10 && (
            <button type="button" onClick={() => languages.append({ name: "", level: "conversational" })} className="mt-space-xs font-label-sm text-label-sm uppercase font-bold text-primary hover:underline">
              + Add language
            </button>
          )}
        </fieldset>

        <fieldset>
          <legend className={labelCls}>Work history</legend>
          <div className="space-y-space-sm">
            {work.fields.map((f, i) => (
              <div key={f.id} className="bg-surface-container-low p-space-sm space-y-space-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-xs">
                  <div>
                    <input aria-label="Job title" placeholder="Job title" className={inputCls(errors.workHistory?.[i]?.title)} {...register(`workHistory.${i}.title`, { required: "Title is required" })} />
                    <FieldError message={errors.workHistory?.[i]?.title?.message} />
                  </div>
                  <div>
                    <input aria-label="Company" placeholder="Company" className={inputCls(errors.workHistory?.[i]?.company)} {...register(`workHistory.${i}.company`, { required: "Company is required" })} />
                    <FieldError message={errors.workHistory?.[i]?.company?.message} />
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-xs items-start">
                  <input aria-label="Location" placeholder="Location" className={`${inputCls(false)} col-span-2`} {...register(`workHistory.${i}.location`)} />
                  <div>
                    <input aria-label="Start year" type="number" placeholder="Start year" className={inputCls(errors.workHistory?.[i]?.startYear)} {...register(`workHistory.${i}.startYear`, { required: "Required", min: { value: 1970, message: "1970+" }, max: { value: 2100, message: "Invalid" } })} />
                    <FieldError message={errors.workHistory?.[i]?.startYear?.message} />
                  </div>
                  <div>
                    <input aria-label="End year (blank = present)" type="number" placeholder="End (blank = now)" className={inputCls(errors.workHistory?.[i]?.endYear)} {...register(`workHistory.${i}.endYear`, { min: { value: 1970, message: "1970+" }, max: { value: 2100, message: "Invalid" } })} />
                    <FieldError message={errors.workHistory?.[i]?.endYear?.message} />
                  </div>
                </div>
                <button type="button" onClick={() => work.remove(i)} className="font-label-sm text-label-sm uppercase font-bold text-error hover:underline">Remove</button>
              </div>
            ))}
          </div>
          {work.fields.length < 20 && (
            <button type="button" onClick={() => work.append({ title: "", company: "", location: "", startYear: new Date().getFullYear(), endYear: "" })} className="mt-space-xs font-label-sm text-label-sm uppercase font-bold text-primary hover:underline">
              + Add position
            </button>
          )}
        </fieldset>

        {serverError && <p role="alert" className="p-2 bg-error-container text-on-error-container font-code-sm text-code-sm border border-error">{serverError}</p>}
        <div className="flex gap-space-sm">
          <button type="submit" disabled={isSubmitting || !isDirty} className={primaryBtn}>{isSubmitting ? "Saving..." : "Save profile"}</button>
          <button type="button" disabled={!isDirty} onClick={() => reset(toForm(data?.profile))} className={ghostBtn}>Discard</button>
        </div>
      </form>
    </SectionCard>
  );
}