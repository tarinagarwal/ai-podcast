import axios from "axios";
import { Podcast, CreatePodcastRequest } from "../types/podcast";

const API_BASE = "http://localhost:3001/api";

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Don't redirect here as it might interfere with auth flow
    }
    return Promise.reject(error);
  }
);

export const podcastService = {
  async getAllPodcasts(page = 1, limit = 10): Promise<Podcast[]> {
    const response = await api.get(`/podcasts?page=${page}&limit=${limit}`);
    return response.data.data;
  },

  async getPodcast(id: number): Promise<Podcast> {
    const response = await api.get(`/podcasts/${id}`);
    return response.data.data;
  },

  async createPodcast(data: CreatePodcastRequest): Promise<Podcast> {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("length", data.length);

    if (data.description) {
      formData.append("description", data.description);
    }

    if (data.knowledgeText) {
      formData.append("knowledgeText", data.knowledgeText);
    }

    if (data.knowledgeFile) {
      formData.append("knowledgeFile", data.knowledgeFile);
    }

    const response = await api.post("/podcasts", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data.data;
  },

  async deletePodcast(id: number): Promise<void> {
    await api.delete(`/podcasts/${id}`);
  },

  async checkHealth(): Promise<boolean> {
    try {
      await api.get("/health");
      return true;
    } catch {
      return false;
    }
  },
};
