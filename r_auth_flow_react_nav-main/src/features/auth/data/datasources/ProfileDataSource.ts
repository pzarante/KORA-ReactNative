import { UserProfile } from "../../domain/entities/UserProfile";

export interface ProfileDataSource {
  saveProfile(profile: Omit<UserProfile, "userId">): Promise<void>;
}