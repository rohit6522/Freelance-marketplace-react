import api from "./api";

export const uploadService = {
  async file(file) {
    const form = new FormData();
    form.append("file", file);
    const { data } = await api.post("/uploads/file", form);
    return data.file; // { url, publicId, name, size }
  },
};