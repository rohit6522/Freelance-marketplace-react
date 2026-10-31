import api from "./api";

export const orderService = {
  async create(payload) {
    const { data } = await api.post("/orders", payload);
    return data;
  },
  async list(params) {
    const { data } = await api.get("/orders", { params });
    return data; // { orders, counts, pagination }
  },
  async get(id) {
    const { data } = await api.get(`/orders/${id}`);
    return data; // { order, payment, review, role, permissions }
  },
  async accept(id) {
    const { data } = await api.post(`/orders/${id}/accept`);
    return data.order;
  },
  async deliver(id, payload) {
    const { data } = await api.post(`/orders/${id}/deliver`, payload);
    return data.order;
  },
  async requestRevision(id, message) {
    const { data } = await api.post(`/orders/${id}/revision`, { message });
    return data.order;
  },
  async complete(id) {
    const { data } = await api.post(`/orders/${id}/complete`);
    return data.order;
  },
  async cancel(id, reason) {
    const { data } = await api.post(`/orders/${id}/cancel`, { reason });
    return data.order;
  },
};