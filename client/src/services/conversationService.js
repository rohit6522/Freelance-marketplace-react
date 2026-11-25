import api from "./api";

export const conversationService = {
  async unreadCount() {
    const { data } = await api.get("/conversations/unread-count");
    return data.unread;
  },
  async start(payload) {
    const { data } = await api.post("/conversations", payload);
    return data.conversation;
  },
  async list(params) {
    const { data } = await api.get("/conversations", { params });
    return data; // { conversations, unreadTotal, pagination }
  },
  async messages(id, params) {
    const { data } = await api.get(`/conversations/${id}/messages`, { params });
    return data; // { conversation, messages, hasMore }
  },
  async send(id, payload) {
    const { data } = await api.post(`/conversations/${id}/messages`, payload);
    return data.message;
  },
  async read(id) {
    await api.post(`/conversations/${id}/read`);
  },
  async sendCustomOffer(id, payload) {
    const { data } = await api.post(`/conversations/${id}/custom-offer`, payload);
    return data.message;
  },
  async acceptCustomOffer(id, messageId) {
    const { data } = await api.post(`/conversations/${id}/messages/${messageId}/accept-offer`);
    return data; // { order, message }
  },
  async declineCustomOffer(id, messageId) {
    const { data } = await api.post(`/conversations/${id}/messages/${messageId}/decline-offer`);
    return data.message;
  },
};