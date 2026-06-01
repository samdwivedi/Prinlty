"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setLoading: (isLoading) => set({ isLoading }),
      login: (user, token) => set({ user, token }),
      logout: () => {
        set({ user: null, token: null });
        // Clear the cookie
        document.cookie = "auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      },
    }),
    {
      name: "printly-auth",
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);

// Upload state store
interface UploadState {
  isUploading: boolean;
  progress: number;
  fileName: string | null;
  setUploading: (uploading: boolean) => void;
  setProgress: (progress: number) => void;
  setFileName: (name: string | null) => void;
  reset: () => void;
}

export const useUploadStore = create<UploadState>()((set) => ({
  isUploading: false,
  progress: 0,
  fileName: null,
  setUploading: (isUploading) => set({ isUploading }),
  setProgress: (progress) => set({ progress }),
  setFileName: (fileName) => set({ fileName }),
  reset: () => set({ isUploading: false, progress: 0, fileName: null }),
}));
