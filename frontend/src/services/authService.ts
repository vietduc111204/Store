import api from "@/libs/axios";
import type { AuthResponse, SignUpPayload } from "@/types/user";

export const authService = {
  signUp: async (payload: SignUpPayload): Promise<AuthResponse> => {
    const res = await api.post("/auth/signup", payload);
    return res.data;
  },

  signIn: async (email: string, password: string): Promise<AuthResponse> => {
    const res = await api.post("/auth/signin", { email, password });
    return res.data;
  },

  signOut: async () => {
    return api.post("/auth/logout");
  },

  fetchMe: async () => {
    const res = await api.get("/auth/me");
    return res.data.account;
  },

  refresh: async (): Promise<AuthResponse> => {
    const res = await api.post("/auth/refresh");
    return res.data;
  },
};
