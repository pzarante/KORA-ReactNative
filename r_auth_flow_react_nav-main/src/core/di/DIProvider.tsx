import React, { createContext, useContext, useMemo } from "react";

import { TOKENS } from "./tokens";

import { AuthRemoteDataSource } from "@/src/features/auth/data/datasources/AuthRemoteDataSource";
import { AuthRemoteDataSourceImpl } from "@/src/features/auth/data/datasources/AuthRemoteDataSourceImp";
import { MockAuthRemoteDataSource } from "@/src/features/auth/data/datasources/MockAuthRemoteDataSource";
import { MockProfileDataSource } from "@/src/features/auth/data/datasources/MockProfileDataSource";
import { ProfileDataSource } from "@/src/features/auth/data/datasources/ProfileDataSource";
import { ProfileRemoteDataSourceImp } from "@/src/features/auth/data/datasources/ProfileRemoteDataSourceImp";
import { AuthRepositoryImpl } from "@/src/features/auth/data/repositories/AuthRepositoryImpl";
import { ProfileRepositoryImpl } from "@/src/features/auth/data/repositories/ProfileRepositoryImpl";
import { AuthUseCases } from "@/src/features/auth/domain/use-cases/AuthUseCases";
import { ProfileUseCases } from "@/src/features/auth/domain/use-cases/ProfileUseCases";
import { LocalProductCacheSource } from "@/src/features/products/data/datasources/local/LocalProductCacheSource";
import { KoraNodeDataSource } from "@/src/features/koranode/data/datasources/KoraNodeDataSource";
import { KoraNodeRemoteDataSourceImp } from "@/src/features/koranode/data/datasources/KoraNodeRemoteDataSourceImp";
import { MockKoraNodeDataSource } from "@/src/features/koranode/data/datasources/MockKoraNodeDataSource";
import { KoraNodeRepositoryImpl } from "@/src/features/koranode/data/repositories/KoraNodeRepositoryImpl";
import { KoraNodeUseCases } from "@/src/features/koranode/domain/use-cases/KoraNodeUseCases";
import { MockProductDataSource } from "@/src/features/products/data/datasources/MockProductDataSource";
import { ProductRemoteDataSourceImp } from "@/src/features/products/data/datasources/ProductRemoteDataSourceImp";
import { ProductRepositoryImpl } from "@/src/features/products/data/repositories/ProductRepositoryImpl";
import { ProductUseCases } from "@/src/features/products/domain/use-cases/ProductUseCases";
import { MockProjectDataSource } from "@/src/features/projects/data/datasources/MockProjectDataSource";
import { ProjectDataSource } from "@/src/features/projects/data/datasources/ProjectDataSource";
import { ProjectRemoteDataSourceImp } from "@/src/features/projects/data/datasources/ProjectRemoteDataSourceImp";
import { ProjectRepositoryImpl } from "@/src/features/projects/data/repositories/ProjectRepositoryImpl";
import { ProjectUseCases } from "@/src/features/projects/domain/use-cases/ProjectUseCases";
import { Container } from "./container";

const DIContext = createContext<Container | null>(null);

/** Composition root: the only place that knows concrete data-source implementations. */
export function DIProvider({ children }: { children: React.ReactNode }) {
    // useMemo is a React Hook that lets you cache the result of a calculation between re-renders.
    const container = useMemo(() => {
        const c = new Container();
        const useMocks = process.env.EXPO_PUBLIC_AUTH_MODE === "mock";

        // ── Auth ──────────────────────────────────────────────
        const authDS: AuthRemoteDataSource = useMocks
            ? new MockAuthRemoteDataSource()
            : new AuthRemoteDataSourceImpl();
        const authRepo = new AuthRepositoryImpl(authDS);
        const authUseCases = new AuthUseCases(authRepo);
        c.register(TOKENS.AuthRemoteDS, authDS)
            .register(TOKENS.AuthRepo, authRepo)
            .register(TOKENS.AuthUseCases, authUseCases);

        // ── Profile ───────────────────────────────────────────
        const profileDS: ProfileDataSource = useMocks
            ? new MockProfileDataSource()
            : new ProfileRemoteDataSourceImp(undefined, authDS);
        const profileRepo = new ProfileRepositoryImpl(profileDS);
        const profileUseCases = new ProfileUseCases(profileRepo);
        c.register(TOKENS.ProfileDataSource, profileDS)
            .register(TOKENS.ProfileRepository, profileRepo)
            .register(TOKENS.ProfileUseCases, profileUseCases);

        // ── Products ──────────────────────────────────────────
        const localCacheDS = new LocalProductCacheSource();
        const productProjectId = process.env.EXPO_PUBLIC_ROBLE_PROJECT_ID;
        const productRemoteDS = useMocks
            ? new MockProductDataSource()
            : new ProductRemoteDataSourceImp(authDS, productProjectId);
        const productRepo = new ProductRepositoryImpl(productRemoteDS, localCacheDS);
        const productUseCases = new ProductUseCases(productRepo);
        c.register(TOKENS.ProductRemoteDS, productRemoteDS)
            .register(TOKENS.LocalProductCacheDS, localCacheDS)
            .register(TOKENS.ProductRepo, productRepo)
            .register(TOKENS.ProductUseCases, productUseCases);

        // ── Projects ──────────────────────────────────────────
        const projectDS: ProjectDataSource = useMocks
            ? new MockProjectDataSource()
            : new ProjectRemoteDataSourceImp(authDS);
        const projectRepo = new ProjectRepositoryImpl(projectDS);
        const projectUseCases = new ProjectUseCases(projectRepo);
        c.register(TOKENS.ProjectDataSource, projectDS)
            .register(TOKENS.ProjectRepository, projectRepo)
            .register(TOKENS.ProjectUseCases, projectUseCases);

        // ── KORA NODE ─────────────────────────────────────────
        const koraNodeDS: KoraNodeDataSource = useMocks
            ? new MockKoraNodeDataSource()
            : new KoraNodeRemoteDataSourceImp(authDS);
        const koraNodeRepo = new KoraNodeRepositoryImpl(koraNodeDS);
        c.register(TOKENS.KoraNodeDataSource, koraNodeDS)
            .register(TOKENS.KoraNodeRepository, koraNodeRepo)
            .register(TOKENS.KoraNodeUseCases, new KoraNodeUseCases(koraNodeRepo));

        return c;
    }, []);

    return <DIContext.Provider value={container}>{children}</DIContext.Provider>;
}

export function useDI() {
    const c = useContext(DIContext);
    if (!c) throw new Error("DIProvider missing");
    return c;
}
