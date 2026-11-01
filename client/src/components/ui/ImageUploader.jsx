import { useState } from "react";
import toast from "react-hot-toast";
import Icon from "./Icon";
import { uploadService } from "../../services/uploadService";

// images: [{ url, publicId }]. The first image is the cover.
export default function ImageUploader({ images, onChange, max, purpose }) {
  const [uploading, setUploading] = useState(false);

  const onFiles = async (e) => {
    const files = [...(e.target.files || [])];
    e.target.value = "";
    if (!files.length) return;
    const room = max - images.length;
    if (room <= 0) return toast.error(`Maximum ${max} images`);

    setUploading(true);
    let next = [...images];
    try {
      for (const file of files.slice(0, room)) {
        const img = await uploadService.image(file, purpose); // one request per image
        next = [...next, img];
        onChange(next);
      }
      if (files.length > room) toast(`Only ${max} images are allowed. Extra files were skipped.`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  const remove = (i) => onChange(images.filter((_, idx) => idx !== i));
  const makeCover = (i) => onChange([images[i], ...images.filter((_, idx) => idx !== i)]);

  return (
    <div>
      {images.length > 0 && (
        <ul className="grid grid-cols-2 sm:grid-cols-3 gap-space-sm mb-space-sm">
          {images.map((img, i) => (
            <li key={img.publicId || img.url} className="relative bg-surface-container-low border border-outline-variant">
              <img src={img.url} alt={`Upload ${i + 1}`} className="w-full h-28 object-cover" />
              {i === 0 && <span className="absolute top-1 left-1 bg-primary text-on-primary font-label-sm text-label-sm px-1.5 uppercase">Cover</span>}
              <div className="flex items-center justify-between p-1">
                {i > 0 ? (
                  <button type="button" onClick={() => makeCover(i)} className="font-label-sm text-label-sm uppercase font-bold text-primary hover:underline">Make cover</button>
                ) : <span />}
                <button type="button" onClick={() => remove(i)} aria-label={`Remove image ${i + 1}`} className="hover:text-error">
                  <Icon name="delete" className="text-body-md" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <div className="flex items-center gap-space-sm">
        <label className={`inline-flex items-center gap-1.5 px-space-md py-2 border border-on-surface font-label-sm text-label-sm uppercase font-bold ${images.length >= max || uploading ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-surface-container-high"}`}>
          <Icon name={uploading ? "sync" : "add_photo_alternate"} className={`text-base ${uploading ? "animate-spin" : ""}`} />
          {uploading ? "Uploading..." : "Add images"}
          <input type="file" multiple accept=".jpg,.jpeg,.png,.webp" className="sr-only" onChange={onFiles} disabled={uploading || images.length >= max} />
        </label>
        <span className="font-code-sm text-code-sm text-on-surface-variant">{images.length}/{max} // JPG, PNG, WebP up to 5 MB</span>
      </div>
    </div>
  );
}