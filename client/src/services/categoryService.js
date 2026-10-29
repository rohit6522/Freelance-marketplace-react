import api from "./api";

export const categoryService = {
  async list() {
    const { data } = await api.get("/categories");
    return data.categories;
  },
};