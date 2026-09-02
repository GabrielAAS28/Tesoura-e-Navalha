import { create } from "zustand";
import type { Session } from "@supabase/supabase-js";
import type { Profile } from "../lib/types";

type AuthState = {
  session: Session | null;
  profile: Profile | null;
  isInitializing: boolean;
  setSession: (session: Session | null) => void;
  setProfile: (profile: Profile | null) => void;
  setInitializing: (value: boolean) => void;
  reset: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  profile: null,
  isInitializing: true,
  setSession: (session) => set({ session }),
  setProfile: (profile) => set({ profile }),
  setInitializing: (value) => set({ isInitializing: value }),
  reset: () => set({ session: null, profile: null }),
}));
