import { getToken } from "@/lib/utils";
import axios from "axios";
import { AuthApiApi, EmailApiApi, TagApiApi, UserApiApi } from "./client";

export const baseURL = "http://localhost:8080";

const globalAxios = axios.create({
  baseURL: baseURL,
  headers: {
    "accept-language": "en",
  },
});

globalAxios.interceptors.request.use(
  async (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    // Do something with request error
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
globalAxios.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 403 && !originalRequest._retry) {
      // do something
    }
    return Promise.reject(error);
  }
);

export const AuthAPI = new AuthApiApi(undefined, baseURL, globalAxios);
export const UserAPI = new UserApiApi(undefined, baseURL, globalAxios);
export const EmailAPI = new EmailApiApi(undefined, baseURL, globalAxios);
export const TagsAPI = new TagApiApi(undefined, baseURL, globalAxios);
