import { UserProfile } from "../entities/UserProfile";
import { ProfileDraft, ProfileRepository } from "../repositories/ProfileRepository";

/** Profile operations used by the auth/profile presentation layer. */
export class ProfileUseCases {
  constructor(private readonly repository: ProfileRepository) {}

  getProfile(userId?: string): Promise<UserProfile | null> {
    return this.repository.getProfile(userId);
  }

  saveProfile(profile: ProfileDraft): Promise<void> {
    return this.repository.saveProfile(profile);
  }

  listProfiles(): Promise<UserProfile[]> {
    return this.repository.listProfiles();
  }
}
