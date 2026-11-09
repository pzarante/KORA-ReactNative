import { UserProfile } from "../entities/UserProfile";

/** A profile before it is persisted: the user id comes from the session/token. */
export type ProfileDraft = Omit<UserProfile, "userId">;

export interface ProfileRepository {
  saveProfile(profile: ProfileDraft): Promise<void>;
  /** The given user's profile, or the logged user's when omitted; null if they never saved one. */
  getProfile(userId?: string): Promise<UserProfile | null>;
}
