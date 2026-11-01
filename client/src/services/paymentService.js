import api from "./api";

export const paymentService = {
  async mine(params) {
    const { data } = await api.get("/payments/mine", { params });
    return data; // { summary, payments, pagination }
  },
};