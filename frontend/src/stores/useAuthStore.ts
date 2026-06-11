import { create } from "zustand";
import { toast } from "sonner";
import { authService } from "@/services/authService";
import type { AuthState } from "@/types/store";

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  user: null,
  loading: false,

  setAccessToken: (accessToken) => {
    set({ accessToken });
  },

  updateUser: (user) => {
    set((state) => ({ user: state.user ? { ...state.user, ...user } : state.user }));
  },

  clearState: () => {
    set({ accessToken: null, user: null, loading: false });
  },

  signUp: async (payload) => {
    try {
      set({ loading: true });
      const { account, accessToken } = await authService.signUp(payload);
      set({ user: account, accessToken });
      toast.success("Đăng ký thành công");
    } catch (error) {
      console.error(error);
      toast.error("Đăng ký không thành công");
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  signIn: async (email, password) => {
    try {
      set({ loading: true });
      const { account, accessToken } = await authService.signIn(email, password);
      set({ user: account, accessToken });
      toast.success("Đăng nhập thành công");
      return account;
    } catch (error) {
      console.error(error);
      toast.error("Đăng nhập không thành công");
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  signOut: async () => {
    try {
      await authService.signOut();
      get().clearState();
      toast.success("Logout thành công");
    } catch (error) {
      console.error(error);
      get().clearState();
      toast.error("Lỗi xảy ra khi logout");
    }
  },

  fetchMe: async () => {
    try {
      set({ loading: true });
      const user = await authService.fetchMe();
      set({ user });
    } catch (error) {
      console.error(error);
      get().clearState();
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  refresh: async () => {
    try {
      set({ loading: true });
      const { account, accessToken } = await authService.refresh();
      set({ user: account, accessToken });
    } catch (error) {
      console.error(error);
      get().clearState();
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));
