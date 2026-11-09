export interface AuthRemoteDataSource {
  login(email: string, password: string): Promise<void>;
  /** true when Roble e-mailed a code: the account must be verified before logging in. */
  signUp(email: string, password: string): Promise<boolean>;
  resendCode(email: string): Promise<void>;
  logOut(): Promise<void>;
  validate(email: string, validationCode: string): Promise<void>;
  refreshToken(): Promise<boolean>;
  forgotPassword(email: string): Promise<void>;
  resetPassword(
    email: string,
    newPassword: string,
    validationCode: string,
  ): Promise<boolean>;
  verifyToken(): Promise<boolean>;
}
