import { act, fireEvent, render, waitFor } from "@testing-library/react-native";
import React from "react";

import ForgotPasswordScreen from "../src/features/auth/presentation/screens/ForgotPasswordScreen";
import {
  AuthContext,
  AuthContextType,
} from "../src/features/auth/presentation/context/authContext";

function renderScreen(
  navigation = { navigate: jest.fn() },
  forgotPassword = jest.fn().mockResolvedValue(true),
) {
  const authValue: AuthContextType = {
    loggedUser: null,
    isLoggedIn: false,
    loading: false,
    error: null,
    clearError: jest.fn(),
    login: jest.fn().mockResolvedValue(undefined),
    signup: jest.fn().mockResolvedValue(undefined),
    logout: jest.fn().mockResolvedValue(undefined),
    forgotPassword,
    validate: jest.fn().mockResolvedValue(null),
    resendCode: jest.fn(),
    getLoggedUser: jest.fn().mockResolvedValue(null),
    profile: {
      nombreCompleto: "",
      rol: "",
      habilidades: [],
      infoAdicional: "",
      whatsapp: "",
      correoContacto: "",
      onboardingCompletado: false,
    },
    updateProfile: jest.fn(),
    completeProfile: jest.fn().mockResolvedValue(undefined),
  };
  const result = render(
    <AuthContext.Provider value={authValue}>
      <ForgotPasswordScreen navigation={navigation} />
    </AuthContext.Provider>,
  );
  return { ...result, navigation, forgotPassword };
}

describe("ForgotPasswordScreen", () => {
  it("sends a valid email and announces the generic success message", async () => {
    const { getByText, getByTestId, forgotPassword } = renderScreen();

    expect(getByText("Recuperar Contraseña")).toBeTruthy();
    expect(getByText("¿OLVIDASTE TU CONTRASEÑA?")).toBeTruthy();
    expect(getByTestId("forgot-password-email-input")).toBeTruthy();

    fireEvent.changeText(
      getByTestId("forgot-password-email-input"),
      " user@example.com ",
    );
    await act(async () => {
      fireEvent.press(getByTestId("send-reset-link-button"));
    });

    expect(forgotPassword).toHaveBeenCalledWith("user@example.com");
    await waitFor(() => {
      expect(getByTestId("reset-submission-status")).toBeTruthy();
    });
  });

  it("does not submit an invalid email", () => {
    const { getByTestId, getByText, forgotPassword } = renderScreen();

    fireEvent.changeText(getByTestId("forgot-password-email-input"), "invalid");
    fireEvent.press(getByTestId("send-reset-link-button"));

    expect(getByText("Ingresa un correo electrónico válido.")).toBeTruthy();
    expect(forgotPassword).not.toHaveBeenCalled();
  });

  it("returns to the login screen", () => {
    const { getByTestId, navigation } = renderScreen();

    fireEvent.press(getByTestId("back-to-login-button"));

    expect(navigation.navigate).toHaveBeenCalledWith("Login");
  });

  it("does not show a success message if the request fails", async () => {
    const forgotPassword = jest.fn().mockResolvedValue(false);
    const { getByTestId, queryByTestId, getByText } = renderScreen(
      { navigate: jest.fn() },
      forgotPassword,
    );

    fireEvent.changeText(
      getByTestId("forgot-password-email-input"),
      "user@example.com",
    );
    await act(async () => {
      fireEvent.press(getByTestId("send-reset-link-button"));
    });

    expect(queryByTestId("reset-submission-status")).toBeNull();
    expect(
      getByText("No pudimos enviar el enlace. Intenta de nuevo más tarde."),
    ).toBeTruthy();
  });
});
