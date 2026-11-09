import RootNavigator from "@/src/navigation/RootNavigator";
import { DIProvider } from "@/src/core/di/DIProvider";
import { AuthProvider } from "@/src/features/auth/presentation/context/authContext";
import { NavigationContainer } from "@react-navigation/native";
import { act, fireEvent, render, waitFor, within } from "@testing-library/react-native";
import React from "react";
import { PaperProvider } from "react-native-paper";

jest.mock("@react-native-async-storage/async-storage", () =>
    require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

const accessToken = `x.${btoa(JSON.stringify({ sub: "user-1" })).replace(/=+$/, "")}.y`;

function mockFetchResponse(body: unknown, status = 200) {
    return Promise.resolve({
        status,
        json: () => Promise.resolve(body),
        ok: status >= 200 && status < 300,
    } as Response);
}

const mockFetch = jest.fn((url: string) => {
    if (url.includes("/verify-token")) return mockFetchResponse({}, 401);
    if (url.includes("/login")) return mockFetchResponse({ accessToken, refreshToken: "refresh" }, 201);
    if (url.includes("/read")) return mockFetchResponse([], 200);
    if (url.includes("/insert")) return mockFetchResponse({}, 201);
    return mockFetchResponse({ message: "not found" }, 404);
});

describe("Create project flow", () => {
    beforeEach(() => {
        globalThis.fetch = mockFetch as unknown as typeof fetch;
    });

    it("creates a project from the + tab and opens its detail", async () => {
        const { getAllByTestId, getByTestId, getByText } = render(
            <DIProvider>
                <AuthProvider>
                    <PaperProvider>
                        <NavigationContainer>
                            <RootNavigator />
                        </NavigationContainer>
                    </PaperProvider>
                </AuthProvider>
            </DIProvider>
        );

        await waitFor(() => expect(getByTestId("welcome-screen")).toBeTruthy());
        await act(async () => fireEvent.press(getByTestId("welcome-login-button")));
        fireEvent.changeText(getByTestId("email-input"), "a@a.com");
        fireEvent.changeText(getByTestId("password-input"), "ThePassword!1");
        await act(async () => fireEvent.press(getByTestId("login-button")));
        await waitFor(() => expect(getByTestId("home-screen")).toBeTruthy());

        await act(async () => fireEvent.press(getByTestId("create-project-tab")));
        await waitFor(() => expect(getByTestId("create-project-intro")).toBeTruthy());
        await act(async () => fireEvent.press(getByTestId("create-project-start")));

        // Earlier steps stay mounted in the stack; the focused one is rendered last.
        const next = async () => act(async () => fireEvent.press(getAllByTestId("project-next-button").at(-1)!));

        await waitFor(() => expect(getByText("Selecciona la etapa actual")).toBeTruthy());
        fireEvent.press(getByText("Idea"));
        await next();

        fireEvent.changeText(getByTestId("project-name-input"), "EcoCampus");
        fireEvent.changeText(getByTestId("project-description-input"), "Campus sostenible");
        await next();
        await next(); // Problema es opcional

        fireEvent.changeText(getByTestId("project-goal-input"), "Reducir residuos");
        await next();
        await next(); // Equipo y recursos son opcionales

        await waitFor(() => expect(getByText("Revisar proyecto")).toBeTruthy());
        await next();

        await waitFor(() => expect(getByTestId("project-created-screen")).toBeTruthy());
        const insertCall = mockFetch.mock.calls.find(([url]) => url.includes("/insert"));
        expect(JSON.parse((insertCall as any)[1].body).records[0]).toMatchObject({
            nombre: "EcoCampus",
            etapa: "Idea",
            objetivo: "Reducir residuos",
            creador_id: "user-1",
        });

        await act(async () => fireEvent.press(getByTestId("view-project-button")));
        await waitFor(() => expect(getByTestId("project-detail-screen")).toBeTruthy());
        expect(within(getByTestId("project-detail-screen")).getByText("EcoCampus")).toBeTruthy();
    });
});
