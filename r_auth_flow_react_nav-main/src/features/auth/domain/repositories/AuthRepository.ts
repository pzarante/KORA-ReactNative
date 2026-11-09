import { AuthUser } from "../entities/AuthUser";

export interface AuthRepository {
  login(email: string, password: string): Promise<void>;
  /** true when the account must be verified with an e-mailed code before logging in. */
  signup(email: string, password: string): Promise<boolean>;
  resendCode(email: string): Promise<void>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<AuthUser | null>;
  forgotPassword(email: string): Promise<void>;
  validate(email: string, validationCode: string): Promise<void>;
}
