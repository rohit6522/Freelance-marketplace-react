import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true, // httpOnly auth cookie
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const data = error.response?.data;
    const message =
      data?.message ||
      (error.request ? "Cannot reach the server. Check your connection." : "Something went wrong");
    const err = new Error(message);
    err.status = error.response?.status;
    err.details = data?.details;
    return Promise.reject(err);
  }
);

export default api;