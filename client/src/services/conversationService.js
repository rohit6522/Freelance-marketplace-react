import api from "./api";

export const conversationService = {
  async unreadCount() {
    const { data } = await api.get("/conversations/unread-count");
    return data.unread;
  },
};