import { AuthRemoteDataSource } from "./AuthRemoteDataSource";

export class MockAuthRemoteDataSource implements AuthRemoteDataSource {
  async login(): Promise<void> {}

  async signUp(): Promise<boolean> {
    return false;
  }

  async resendCode(): Promise<void> {}

  async logOut(): Promise<void> {}

  async validate(): Promise<void> {}

  async refreshToken(): Promise<boolean> {
    return true;
  }

  async forgotPassword(): Promise<void> {}

  async resetPassword(): Promise<boolean> {
    return true;
  }

  async verifyToken(): Promise<boolean> {
    return false;
  }
}
