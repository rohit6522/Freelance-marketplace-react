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
};