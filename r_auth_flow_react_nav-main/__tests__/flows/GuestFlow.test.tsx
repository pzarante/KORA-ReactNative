import AuthFlow from "@/src/AuthFlow";
import { DIProvider } from "@/src/core/di/DIProvider";
import { AuthProvider } from "@/src/features/auth/presentation/context/authContext";
import { NavigationContainer } from "@react-navigation/native";
import { act, fireEvent, render, waitFor } from "@testing-library/react-native";
import React from "react";
import { PaperProvider } from "react-native-paper";

jest.mock("@react-native-async-storage/async-storage", () =>
    require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

describe("Guest mode", () => {
    beforeEach(() => {
        globalThis.fetch = jest.fn(() => Promise.resolve({ status: 401, ok: false, json: async () => ({}) } as Response));
    });

    it("lets a guest browse the tabs and asks for an account to create a project", async () => {
        const { getByTestId, getByLabelText, queryByTestId } = render(
            <DIProvider>
                <AuthProvider>
                    <PaperProvider>
                        <NavigationContainer>
                            <AuthFlow />
                        </NavigationContainer>
                    </PaperProvider>
                </AuthProvider>
            </DIProvider>
        );

        await waitFor(() => expect(getByTestId("welcome-screen")).toBeTruthy());
        await act(async () => fireEvent.press(getByTestId("welcome-guest-button")));
        await waitFor(() => expect(getByTestId("home-screen")).toBeTruthy());

        // Guests never get notifications, only the reminder to log in or sign up.
        await act(async () => fireEvent.press(getByTestId("notifications-button")));
        expect(getByTestId("notifications-guest")).toBeTruthy();
        expect(queryByTestId("notifications-mark-all")).toBeNull();
        await act(async () => fireEvent.press(getByLabelText("Cerrar")));

        await act(async () => fireEvent.press(getByTestId("create-project-tab")));
        await waitFor(() => expect(getByTestId("account-required-screen")).toBeTruthy());
        await act(async () => fireEvent.press(getByTestId("account-prompt-primary")));
        await waitFor(() => expect(getByTestId("signup-screen")).toBeTruthy());
    });
});
