import React, { createContext, useContext, useMemo } from "react";

import { TOKENS } from "./tokens";

import { AuthRemoteDataSourceImpl } from "@/src/features/auth/data/datasources/AuthRemoteDataSourceImp";
import { MockAuthRemoteDataSource } from "@/src/features/auth/data/datasources/MockAuthRemoteDataSource";
import { AuthRemoteDataSource } from "@/src/features/auth/data/datasources/AuthRemoteDataSource";
import { AuthRepositoryImpl } from "@/src/features/auth/data/repositories/AuthRepositoryImpl";
import { LocalProductCacheSource } from "@/src/features/products/data/datasources/local/LocalProductCacheSource";
import { ProductRemoteDataSourceImp } from "@/src/features/products/data/datasources/ProductRemoteDataSourceImp";
import { ProductRepositoryImpl } from "@/src/features/products/data/repositories/ProductRepositoryImpl";
import { MockProductDataSource } from "@/src/features/products/data/datasources/MockProductDataSource";
import { ProfileDataSource } from "@/src/features/auth/data/datasources/ProfileDataSource";
import { ProfileRemoteDataSourceImp } from "@/src/features/auth/data/datasources/ProfileRemoteDataSourceImp";
import { MockProfileDataSource } from "@/src/features/auth/data/datasources/MockProfileDataSource";
import { Container } from "./container";
const DIContext = createContext<Container | null>(null);

export function DIProvider({ children }: { children: React.ReactNode }) {
    //useMemo is a React Hook that lets you cache the result of a calculation between re-renders.
    const container = useMemo(() => {
        const c = new Container();

        const authDS: AuthRemoteDataSource =
            process.env.EXPO_PUBLIC_AUTH_MODE === "mock"
                ? new MockAuthRemoteDataSource()
                : new AuthRemoteDataSourceImpl();
        const authRepo = new AuthRepositoryImpl(authDS);

        c.register(TOKENS.AuthRemoteDS, authDS)
            .register(TOKENS.AuthRepo, authRepo);

        const localCacheDS = new LocalProductCacheSource();
        const productProjectId = process.env.EXPO_PUBLIC_ROBLE_PROJECT_ID;
        const remoteDS = process.env.EXPO_PUBLIC_AUTH_MODE === "mock"
            ? new MockProductDataSource()
            : new ProductRemoteDataSourceImp(authDS, productProjectId);
        const productRepo = new ProductRepositoryImpl(remoteDS, localCacheDS);

        c.register(TOKENS.ProductRemoteDS, remoteDS).
            register(TOKENS.LocalProductCacheDS, localCacheDS).
            register(TOKENS.ProductRepo, productRepo);

        const profileDS: ProfileDataSource =
            process.env.EXPO_PUBLIC_AUTH_MODE === "mock"
                ? new MockProfileDataSource()
                : new ProfileRemoteDataSourceImp();
        c.register(TOKENS.ProfileDataSource, profileDS);



        return c;
    }, []);

    return <DIContext.Provider value={container}>{children}</DIContext.Provider>;
}

export function useDI() {
    const c = useContext(DIContext);
    if (!c) throw new Error("DIProvider missing");
    return c;
}
