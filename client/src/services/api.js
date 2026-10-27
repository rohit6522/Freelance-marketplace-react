import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true, // for httpOnly auth cookie
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const message = error.response?.data?.message || "Something went wrong";
    return Promise.reject(new Error(message));
  }
);

export default api;