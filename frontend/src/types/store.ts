import type { AuthAccount, SignUpPayload } from "./user";

export interface AuthState {
  accessToken: string | null;
  user: AuthAccount | null;
  loading: boolean;

  setAccessToken: (accessToken: string) => void;
  updateUser: (user: Partial<AuthAccount>) => void;
  clearState: () => void;
  signUp: (payload: SignUpPayload) => Promise<void>;
  signIn: (email: string, password: string) => Promise<AuthAccount>;
  signOut: () => Promise<void>;
  fetchMe: () => Promise<void>;
  refresh: () => Promise<void>;
}
