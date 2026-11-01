import api from "./api";

export const uploadService = {
  async file(file) {
    const form = new FormData();
    form.append("file", file);
    const { data } = await api.post("/uploads/file", form);
    return data.file; // { url, publicId, name, size }
  },

    async image(file, purpose) {
    const form = new FormData();
    form.append("image", file);
    const { data } = await api.post(`/uploads/image?purpose=${purpose}`, form);
    return data.image; // { url, publicId }
  },
};