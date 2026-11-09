import { AuthContext, AuthContextType } from "@/src/features/auth/presentation/context/authContext";
import SignupScreen from "@/src/features/auth/presentation/screens/SignupScreen";
import VerifyEmailScreen from "@/src/features/auth/presentation/screens/VerifyEmailScreen";
import { act, fireEvent, render } from "@testing-library/react-native";
import React from "react";
import { PaperProvider } from "react-native-paper";

const createMockAuthContext = (overrides: Partial<AuthContextType> = {}): AuthContextType => ({
  isLoggedIn: false,
  loading: false,
  error: null,
  loggedUser: null,
  clearError: jest.fn(),
  login: jest.fn(),
  signup: jest.fn(),
  logout: jest.fn(),
  forgotPassword: jest.fn(),
  validate: jest.fn().mockResolvedValue(null),
  resendCode: jest.fn().mockResolvedValue(null),
  getLoggedUser: jest.fn(),
  profile: { nombreCompleto: "", rol: "", habilidades: [], infoAdicional: "", onboardingCompletado: false },
  updateProfile: jest.fn(),
  completeProfile: jest.fn(),
  ...overrides,
});

const navigation = { navigate: jest.fn(), goBack: jest.fn() };

function renderWith(screen: React.ReactElement, auth: AuthContextType) {
  return render(
    <AuthContext.Provider value={auth}>
      <PaperProvider>{screen}</PaperProvider>
    </AuthContext.Provider>,
  );
}

describe("Email verification", () => {
  beforeEach(() => jest.clearAllMocks());

  it("sends the user to VerifyEmail when Roble asks for a code", async () => {
    const auth = createMockAuthContext({ signup: jest.fn().mockResolvedValue(true) });
    const { getByTestId } = renderWith(<SignupScreen navigation={navigation} />, auth);

    fireEvent.changeText(getByTestId("signup-email-input"), " ana@uninorte.edu.co ");
    fireEvent.changeText(getByTestId("signup-password-input"), "secret1");
    fireEvent.changeText(getByTestId("signup-confirm-password-input"), "secret1");
    await act(async () => fireEvent.press(getByTestId("signup-button")));

    expect(navigation.navigate).toHaveBeenCalledWith("VerifyEmail", { email: "ana@uninorte.edu.co" });
  });

  it("verifies the typed code and shows Roble's error when it is wrong", async () => {
    const validate = jest.fn().mockResolvedValue("Código inválido");
    const { getByTestId, getByText } = renderWith(
      <VerifyEmailScreen navigation={navigation} route={{ params: { email: "ana@uninorte.edu.co" } }} />,
      createMockAuthContext({ validate }),
    );

    await act(async () => fireEvent.press(getByTestId("verify-code-button")));
    expect(validate).not.toHaveBeenCalled();
    expect(getByText("Ingresa el código que te enviamos")).toBeTruthy();

    fireEvent.changeText(getByTestId("verify-code-input"), " 123456 ");
    await act(async () => fireEvent.press(getByTestId("verify-code-button")));
    expect(validate).toHaveBeenCalledWith("ana@uninorte.edu.co", "123456");
    expect(getByText("Código inválido")).toBeTruthy();
  });

  it("resends the code to the same e-mail", async () => {
    const auth = createMockAuthContext();
    const { getByTestId } = renderWith(
      <VerifyEmailScreen navigation={navigation} route={{ params: { email: "ana@uninorte.edu.co" } }} />,
      auth,
    );

    await act(async () => fireEvent.press(getByTestId("resend-code-button")));
    expect(auth.resendCode).toHaveBeenCalledWith("ana@uninorte.edu.co");
    expect(getByTestId("code-resent-status")).toBeTruthy();
  });
});
