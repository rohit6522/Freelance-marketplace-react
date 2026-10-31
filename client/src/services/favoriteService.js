import api from "./api";

export const favoriteService = {
  async ids() {
    const { data } = await api.get("/favorites/ids");
    return data.ids;
  },
  async add(gigId) {
    await api.post("/favorites", { gigId });
  },
  async remove(gigId) {
    await api.delete(`/favorites/${gigId}`);
  },
    async list(params) {
    const { data } = await api.get("/favorites", { params });
    return data; // { gigs, pagination }
  },
};