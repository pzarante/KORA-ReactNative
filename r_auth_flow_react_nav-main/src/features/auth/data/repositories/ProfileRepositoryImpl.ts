import { UserProfile } from "../../domain/entities/UserProfile";
import { ProfileDraft, ProfileRepository } from "../../domain/repositories/ProfileRepository";
import { ProfileDataSource } from "../datasources/ProfileDataSource";

/** Adapts the profile data source to the domain repository contract. */
export class ProfileRepositoryImpl implements ProfileRepository {
  constructor(private readonly dataSource: ProfileDataSource) {}

  saveProfile(profile: ProfileDraft): Promise<void> {
    return this.dataSource.saveProfile(profile);
  }

  getProfile(userId?: string): Promise<UserProfile | null> {
    return this.dataSource.getProfile(userId);
  }

  listProfiles(): Promise<UserProfile[]> {
    return this.dataSource.listProfiles();
  }
}
