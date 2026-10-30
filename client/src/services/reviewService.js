import api from "./api";

export const reviewService = {
  async list(params) {
    const { data } = await api.get("/reviews", { params });
    return data; // { summary, reviews, pagination }
  },
};