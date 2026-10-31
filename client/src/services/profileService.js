import api from "./api";

export const profileService = {
  async me() {
    const { data } = await api.get("/profile/me");
    return data; // { user, profile }
  },
  async updateAccount(payload) {
    const { data } = await api.put("/profile/account", payload);
    return data.user;
  },
  async updateFreelancer(payload) {
    const { data } = await api.put("/profile/freelancer", payload);
    return data.profile;
  },
  async uploadAvatar(file) {
    const form = new FormData();
    form.append("image", file);
    const { data } = await api.post("/profile/avatar", form);
    return data.user;
  },
};