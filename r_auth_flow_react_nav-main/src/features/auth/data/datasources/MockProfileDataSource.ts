import { UserProfile } from "../../domain/entities/UserProfile";
import { ProfileDataSource } from "./ProfileDataSource";

export class MockProfileDataSource implements ProfileDataSource {
  async saveProfile(_profile: Omit<UserProfile, "userId">): Promise<void> {}

  async getProfile(): Promise<UserProfile | null> {
    return null;
  }
}
