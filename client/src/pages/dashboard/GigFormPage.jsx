import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import PageHeader from "../../components/dashboard/PageHeader";
import SectionCard from "../../components/dashboard/SectionCard";
import ImageUploader from "../../components/ui/ImageUploader";
import FieldError from "../../components/ui/FieldError";
import ErrorBox from "../../components/ui/ErrorBox";
import SkeletonBlocks from "../../components/ui/SkeletonBlocks";
import { ghostBtn, inputCls, labelCls, primaryBtn } from "../../components/ui/formStyles";
import { useAuth } from "../../hooks/useAuth";
import { useCategories } from "../../hooks/useCategories";
import { gigService } from "../../services/gigService";
import { TIERS, TIER_LABELS } from "../../utils/format";

const REVISION_OPTIONS = [...Array(11).keys()].map((n) => [String(n), n === 0 ? "No revisions" : `${n} revision${n > 1 ? "s" : ""}`]).concat([["-1", "Unlimited"]]);

const emptyForm = () => ({
  title: "", category: "", description: "", tags: "",
  packages: Object.fromEntries(TIERS.map((t) => [t, { title: "", description: "", price: "", deliveryDays: "", revisions: "1", featuresText: "" }])),
});

const toForm = (g) => ({
  title: g.title,
  category: g.category?._id || g.category || "",
  description: g.description,
  tags: (g.tags || []).join(", "),
  packages: Object.fromEntries(
    TIERS.map((t) => {
      const p = g.packages[t];
      return [t, { title: p.title, description: p.description, price: p.price, deliveryDays: p.deliveryDays, revisions: String(p.revisions), featuresText: (p.features || []).join("\n") }];
    })
  ),
});

const splitTags = (s) => [...new Set(s.split(",").map((x) => x.trim().toLowerCase()).filter(Boolean))];
const splitLines = (s) => s.split("\n").map((x) => x.trim()).filter(Boolean);

const toPayload = (v, images) => ({
  title: v.title.trim(),
  category: v.category,
  description: v.description.trim(),
  tags: splitTags(v.tags),
  images: images.map(({ url, publicId }) => ({ url, publicId })),
  packages: Object.fromEntries(
    TIERS.map((t) => {
      const p = v.packages[t];
      return [t, {
        title: p.title.trim(), description: p.description.trim(),
        price: Number(p.price), deliveryDays: Number(p.deliveryDays), revisions: Number(p.revisions),
        features: splitLines(p.featuresText),
      }];
    })
  ),
});

function PackageFields({ tier, register, errors }) {
  const e = errors.packages?.[tier] || {};
  const name = (f) => `packages.${tier}.${f}`;
  return (
    <div className="bg-surface-container-low p-space-md space-y-space-sm">
      <h3 className="font-headline-sm text-headline-sm uppercase text-primary font-bold">{TIER_LABELS[tier]}</h3>
      <div>
        <label htmlFor={name("title")} className={labelCls}>Package name</label>
        <input id={name("title")} className={inputCls(e.title)} {...register(name("title"), { required: "Required", minLength: { value: 2, message: "At least 2 characters" }, maxLength: { value: 80, message: "Maximum 80 characters" } })} />
        <FieldError message={e.title?.message} />
      </div>
      <div>
        <label htmlFor={name("description")} className={labelCls}>Short description</label>
        <textarea id={name("description")} rows={3} className={inputCls(e.description)} {...register(name("description"), { required: "Required", minLength: { value: 5, message: "At least 5 characters" }, maxLength: { value: 500, message: "Maximum 500 characters" } })} />
        <FieldError message={e.description?.message} />
      </div>
      <div className="grid grid-cols-2 gap-space-sm">
        <div>
          <label htmlFor={name("price")} className={labelCls}>Price (USD)</label>
          <input id={name("price")} type="number" step="1" min="5" className={inputCls(e.price)} {...register(name("price"), { required: "Required", min: { value: 5, message: "Minimum $5" }, max: { value: 100000, message: "Maximum $100,000" } })} />
          <FieldError message={e.price?.message} />
        </div>
        <div>
          <label htmlFor={name("deliveryDays")} className={labelCls}>Delivery (days)</label>
          <input id={name("deliveryDays")} type="number" step="1" min="1" className={inputCls(e.deliveryDays)} {...register(name("deliveryDays"), { required: "Required", min: { value: 1, message: "Minimum 1 day" }, max: { value: 180, message: "Maximum 180 days" }, validate: (v) => Number.isInteger(Number(v)) || "Whole days only" })} />
          <FieldError message={e.deliveryDays?.message} />
        </div>
      </div>
      <div>
        <label htmlFor={name("revisions")} className={labelCls}>Revisions included</label>
        <select id={name("revisions")} className={inputCls(false)} {...register(name("revisions"))}>
          {REVISION_OPTIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor={name("featuresText")} className={labelCls}>What's included (one per line, up to 10)</label>
        <textarea
          id={name("featuresText")} rows={5} className={inputCls(e.featuresText)}
          {...register(name("featuresText"), {
            validate: (v) => {
              const lines = splitLines(v);
              if (lines.length > 10) return "Maximum 10 items";
              if (lines.some((l) => l.length > 120)) return "Each item must be 120 characters or fewer";
              return true;
            },
          })}
        />
        <FieldError message={e.featuresText?.message} />
      </div>
    </div>
  );
}

export default function GigFormPage() {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();
  const { user } = useAuth();
  const categories = useCategories();

  const [images, setImages] = useState([]);
  const [loaded, setLoaded] = useState(null); // the gig being edited
  const [loadState, setLoadState] = useState({ loading: editing, error: "" });
  const [serverError, setServerError] = useState("");
  const [saving, setSaving] = useState(false);
  const {
    register, handleSubmit, reset,
    formState: { errors },
  } = useForm({ defaultValues: emptyForm() });

  // Load the gig when editing
  useEffect(() => {
    if (!editing) return;
    let active = true;
    setLoadState({ loading: true, error: "" });
    gigService
      .get(id)
      .then(({ gig }) => {
        if (!active) return;
        if (String(gig.freelancer) !== String(user._id)) throw new Error("You can only edit your own gigs");
        setLoaded(gig);
        setImages(gig.images || []);
        setLoadState({ loading: false, error: "" });
      })
      .catch((err) => active && setLoadState({ loading: false, error: err.message }));
    return () => {
      active = false;
    };
  }, [id, editing, user._id]);

  // Fill the form once both the gig and the category options exist (so the select shows the right value)
  useEffect(() => {
    if (loaded && categories.length) reset(toForm(loaded));
  }, [loaded, categories.length, reset]);

  const submitWith = (intent) =>
    handleSubmit(async (values) => {
      setServerError("");
      if (intent === "publish" && images.length === 0) {
        setServerError("Add at least one image before publishing.");
        return;
      }
      setSaving(true);
      try {
        const payload = toPayload(values, images);
        if (editing) {
          await gigService.update(id, payload);
          if (intent === "publish") await gigService.setStatus(id, "published");
          toast.success(intent === "publish" ? "Gig saved and published" : "Gig updated");
        } else {
          await gigService.create({ ...payload, status: intent === "publish" ? "published" : "draft" });
          toast.success(intent === "publish" ? "Gig published" : "Draft saved");
        }
        navigate("/dashboard/gigs");
      } catch (err) {
        setServerError(err.message);
      } finally {
        setSaving(false);
      }
    });

  if (loadState.error) return <ErrorBox message={loadState.error} />;
  if (loadState.loading || (editing && !categories.length)) return <SkeletonBlocks count={3} height="h-48" />;

  const isPublished = loaded?.status === "published";

  return (
    <form onSubmit={(e) => e.preventDefault()} noValidate className="space-y-space-lg">
      <PageHeader
        eyebrow={editing ? "SELLER // EDIT GIG" : "SELLER // NEW GIG"}
        title={editing ? "Edit Gig" : "Create Gig"}
        description="Describe your service and set up three packages. Save as a draft any time."
        actions={<Link to="/dashboard/gigs" className={ghostBtn}>Back to gigs</Link>}
      />

      <SectionCard title="Overview">
        <div className="space-y-space-md">
          <div>
            <label htmlFor="title" className={labelCls}>Gig title * <span className="font-normal text-on-surface-variant">(15-120 characters)</span></label>
            <input id="title" placeholder="I will design a conversion-focused landing page in Figma" className={inputCls(errors.title)}
              {...register("title", { required: "Title is required", minLength: { value: 15, message: "At least 15 characters" }, maxLength: { value: 120, message: "Maximum 120 characters" } })} />
            <FieldError message={errors.title?.message} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
            <div>
              <label htmlFor="category" className={labelCls}>Category *</label>
              <select id="category" className={inputCls(errors.category)} {...register("category", { required: "Choose a category" })}>
                <option value="">Select a category</option>
                {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
              <FieldError message={errors.category?.message} />
            </div>
            <div>
              <label htmlFor="tags" className={labelCls}>Tags (comma separated, up to 5)</label>
              <input id="tags" placeholder="figma, saas, ui" className={inputCls(errors.tags)}
                {...register("tags", {
                  validate: (v) => {
                    const list = splitTags(v);
                    if (list.length > 5) return "A maximum of 5 tags is allowed";
                    if (list.some((t) => t.length > 30)) return "Each tag must be 30 characters or fewer";
                    return true;
                  },
                })} />
              <FieldError message={errors.tags?.message} />
            </div>
          </div>
          <div>
            <label htmlFor="description" className={labelCls}>Description * <span className="font-normal text-on-surface-variant">(50-5000 characters)</span></label>
            <textarea id="description" rows={8} className={inputCls(errors.description)}
              {...register("description", { required: "Description is required", minLength: { value: 50, message: "At least 50 characters" }, maxLength: { value: 5000, message: "Maximum 5000 characters" } })} />
            <FieldError message={errors.description?.message} />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Gallery" description="The first image is the cover. At least one image is required to publish.">
        <ImageUploader images={images} onChange={setImages} max={5} purpose="gig" />
      </SectionCard>

      <SectionCard title="Packages" description="Clients pick one of three packages. The lowest price is shown as the gig's starting price.">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-space-md">
          {TIERS.map((t) => <PackageFields key={t} tier={t} register={register} errors={errors} />)}
        </div>
      </SectionCard>

      {serverError && <p role="alert" className="p-space-sm bg-error-container text-on-error-container font-body-sm border border-error">{serverError}</p>}

      <div className="flex flex-wrap gap-space-sm">
        <button type="button" disabled={saving} onClick={submitWith(editing ? "save" : "draft")} className={ghostBtn}>
          {saving ? "Saving..." : editing ? "Save changes" : "Save as draft"}
        </button>
        {!(editing && isPublished) && (
          <button type="button" disabled={saving} onClick={submitWith("publish")} className={primaryBtn}>
            {saving ? "Saving..." : editing ? "Save & publish" : "Publish gig"}
          </button>
        )}
      </div>
    </form>
  );
}