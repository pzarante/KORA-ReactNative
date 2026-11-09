/** Names of the bottom tabs (see tabs.ts). */
export type AppTabName = "Home" | "Explore" | "Create" | "MyProjects" | "Profile";

/**
 * Route names used across the app. Kept as documentation for navigation calls;
 * screens currently receive an untyped `navigation` prop, so this is not enforced yet.
 */
export type RootRouteName =
  | "Welcome"
  | "Login"
  | "Signup"
  | "VerifyEmail"
  | "ForgotPassword"
  | "App"
  | "Authenticated"
  | "AccountRequired"
  | "OnboardingName"
  | "OnboardingRole"
  | "OnboardingSkills"
  | "OnboardingBio"
  | "OnboardingSuccess"
  | "CreateProject"
  | "ProjectDetail"
  | "TeamMembers"
  | "Comments"
  | "JoinRequest"
  | "RequestSent"
  | "Requests"
  | "ApplicantProfile"
  | "MemberJoined"
  | "CompleteProfile"
  | "EditProfile"
  | "AddProductScreen"
  | "UpdateProductScreen";
