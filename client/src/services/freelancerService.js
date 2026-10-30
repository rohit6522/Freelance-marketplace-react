import api from "./api";

export const freelancerService = {
  async get(id) {
    const { data } = await api.get(`/freelancers/${id}`);
    return data; // { freelancer, gigs, portfolio }
  },
};