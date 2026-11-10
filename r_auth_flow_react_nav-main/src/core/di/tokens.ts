export const TOKENS = {
  // Auth
  AuthRemoteDS: Symbol("AuthRemoteDS"),
  AuthRepo: Symbol("AuthRepo"),
  AuthUseCases: Symbol("AuthUseCases"),
  // Profile
  ProfileDataSource: Symbol("ProfileDataSource"),
  ProfileRepository: Symbol("ProfileRepository"),
  ProfileUseCases: Symbol("ProfileUseCases"),
  // Projects
  ProjectDataSource: Symbol("ProjectDataSource"),
  ProjectRepository: Symbol("ProjectRepository"),
  ProjectUseCases: Symbol("ProjectUseCases"),
  // KORA NODE
  KoraNodeDataSource: Symbol("KoraNodeDataSource"),
  KoraNodeRepository: Symbol("KoraNodeRepository"),
  KoraNodeUseCases: Symbol("KoraNodeUseCases"),
} as const;
