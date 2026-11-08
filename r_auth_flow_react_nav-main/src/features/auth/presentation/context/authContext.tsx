import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

import { useDI } from "@/src/core/di/DIProvider";
import { TOKENS } from "@/src/core/di/tokens";
import { LocalPreferencesAsyncStorage } from "@/src/core/LocalPreferencesAsyncStorage";
import { AuthUser } from "../../domain/entities/AuthUser";
import { AuthRepository } from "../../domain/repositories/AuthRepository";
import { UserProfile } from "../../domain/entities/UserProfile";
import { ProfileDataSource } from "../../data/datasources/ProfileDataSource";

export type ProfileDraft = Omit<UserProfile, "userId">;

const emptyProfile: ProfileDraft = {
  nombreCompleto: "",
  rol: "",
  habilidades: [],
  infoAdicional: "",
  fotoUrl: null,
  onboardingCompletado: false,
};

export type AuthContextType = {
  loggedUser: AuthUser | null;
  isLoggedIn: boolean;
  needsOnboarding?: boolean;
  loading: boolean;
  error: string | null;
  clearError: () => void;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<boolean>;
  validate: (email: string, validationCode: string) => Promise<string | null>;
  getLoggedUser: () => Promise<any | null>;
  profile: ProfileDraft;
  updateProfile: (patch: Partial<ProfileDraft>) => void;
  completeProfile: () => Promise<boolean>;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const di = useDI();

  const authRepo = useMemo(() => di.resolve<AuthRepository>(TOKENS.AuthRepo), [di]);
  const profileDS = useMemo(() => di.resolve<ProfileDataSource>(TOKENS.ProfileDataSource), [di]);
  const prefs = LocalPreferencesAsyncStorage.getInstance();

  const [loggedUser, setLoggedUser] = useState<AuthUser | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileDraft>(emptyProfile);

  const clearError = () => setError(null);

  useEffect(() => {
    authRepo.getCurrentUser()
      .then((user) => {
        setLoggedUser(user);
        setIsLoggedIn(!!user);
      })
      .catch(() => setIsLoggedIn(false))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    prefs.retrieveData<ProfileDraft>("profile_draft").then((saved) => {
      if (saved) setProfile({ ...emptyProfile, ...saved });
    });
  }, []);

  const updateProfile = (patch: Partial<ProfileDraft>) => {
    setProfile((current) => {
      const next = { ...current, ...patch };
      void prefs.storeData("profile_draft", next);
      return next;
    });
  };

  const completeProfile = async () => {
    clearError();
    const completed = { ...profile, onboardingCompletado: true };
    try {
      await profileDS.saveProfile(completed);
      setProfile(completed);
      await prefs.storeData("profile_draft", completed);
      return true;
    } catch (err: any) {
      setError(err?.message ?? "No se pudo guardar el perfil");
      return false;
    }
  };

  const login = async (email: string, password: string) => {
    clearError();
    try {
      setLoading(true);
      await authRepo.login(email, password);
      setNeedsOnboarding(false);
      setIsLoggedIn(true);
    } catch (err: any) {
      setError(err?.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string) => {
    clearError();
    try {
      setLoading(true);
      await authRepo.signup(email, password);
      // Set before isLoggedIn: without batching, AuthenticatedStack mounts with the stale value.
      setNeedsOnboarding(true);
      setIsLoggedIn(true);
    } catch (err: any) {
      setError(err?.message ?? "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    clearError();
    try {
      setLoading(true);
      await authRepo.logout();
      setIsLoggedIn(false);
      setNeedsOnboarding(false);
    } catch (err: any) {
      setError(err?.message ?? "Logout failed");
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (email: string) => {
    clearError();
    try {
      setLoading(true);
      await authRepo.forgotPassword(email);
      return true;
    } catch (err: any) {
      setError(err?.message ?? "No pudimos enviar el enlace. Intenta de nuevo más tarde.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const validate = async (email: string, validationCode: string) => {
    clearError();
    try {
      await authRepo.validate(email, validationCode);
    } catch (err: any) {
      return err?.message ?? "Validation failed";
    }
    return null;
  }

  const getLoggedUser = async () => {
    try {
      return await authRepo.getCurrentUser();
    } catch (err) {
      return null;
    }
  }

  return (
    <AuthContext.Provider value={{ loggedUser, isLoggedIn, needsOnboarding, loading, error, clearError, login, signup, logout, forgotPassword, validate, getLoggedUser, profile, updateProfile, completeProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
