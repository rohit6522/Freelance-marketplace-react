import api from "./api";

export const orderService = {
  async create(payload) {
    const { data } = await api.post("/orders", payload);
    return data; // { order, payment, notice }
  },
};