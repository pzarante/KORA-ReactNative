import { AuthUser } from "../entities/AuthUser";
import { AuthRepository } from "../repositories/AuthRepository";

/** Authentication operations used by the auth presentation layer. */
export class AuthUseCases {
  constructor(private readonly repository: AuthRepository) {}

  login(email: string, password: string): Promise<void> {
    return this.repository.login(email, password);
  }

  /** true when the account must be verified with an e-mailed code before logging in. */
  signup(email: string, password: string): Promise<boolean> {
    return this.repository.signup(email, password);
  }

  resendCode(email: string): Promise<void> {
    return this.repository.resendCode(email);
  }

  logout(): Promise<void> {
    return this.repository.logout();
  }

  getCurrentUser(): Promise<AuthUser | null> {
    return this.repository.getCurrentUser();
  }

  forgotPassword(email: string): Promise<void> {
    return this.repository.forgotPassword(email);
  }

  validate(email: string, validationCode: string): Promise<void> {
    return this.repository.validate(email, validationCode);
  }
}
