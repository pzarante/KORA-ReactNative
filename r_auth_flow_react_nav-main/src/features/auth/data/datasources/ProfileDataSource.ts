import { UserProfile } from "../../domain/entities/UserProfile";

export interface ProfileDataSource {
  saveProfile(profile: Omit<UserProfile, "userId">): Promise<void>;
  /** The given user's profile, or the logged user's when omitted; null if they never saved one. */
  getProfile(userId?: string): Promise<UserProfile | null>;
}
