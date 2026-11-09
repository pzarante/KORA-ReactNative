export const TOKENS = {
  // Auth
  AuthRemoteDS: Symbol("AuthRemoteDS"),
  AuthRepo: Symbol("AuthRepo"),
  AuthUseCases: Symbol("AuthUseCases"),
  // Profile
  ProfileDataSource: Symbol("ProfileDataSource"),
  ProfileRepository: Symbol("ProfileRepository"),
  ProfileUseCases: Symbol("ProfileUseCases"),
  // Products
  LocalProductCacheDS: Symbol("LocalProductCacheDS"),
  ProductRemoteDS: Symbol("ProductRemoteDS"),
  ProductRepo: Symbol("ProductRepo"),
  ProductUseCases: Symbol("ProductUseCases"),
  // Projects
  ProjectDataSource: Symbol("ProjectDataSource"),
  ProjectRepository: Symbol("ProjectRepository"),
  ProjectUseCases: Symbol("ProjectUseCases"),
} as const;
