import { canJoinProjects, profileCompletion } from "@/src/features/auth/domain/entities/UserProfile";
import { AuthContext, AuthContextType } from "@/src/features/auth/presentation/context/authContext";
import EditProfileScreen from "@/src/features/auth/presentation/screens/EditProfileScreen";
import OnboardingNameScreen from "@/src/features/auth/presentation/screens/OnboardingNameScreen";
import { act, fireEvent, render } from "@testing-library/react-native";
import React from "react";

const emptyProfile = { nombreCompleto: "", rol: "", habilidades: [], infoAdicional: "", onboardingCompletado: false };

const createAuth = (overrides: Partial<AuthContextType> = {}): AuthContextType => ({
  isLoggedIn: true,
  loading: false,
  error: null,
  loggedUser: null,
  clearError: jest.fn(),
  login: jest.fn(),
  signup: jest.fn(),
  logout: jest.fn(),
  forgotPassword: jest.fn(),
  validate: jest.fn(),
  resendCode: jest.fn(),
  getLoggedUser: jest.fn(),
  profile: emptyProfile,
  updateProfile: jest.fn(),
  completeProfile: jest.fn().mockResolvedValue(true),
  ...overrides,
});

const navigation = { navigate: jest.fn(), goBack: jest.fn(), popTo: jest.fn() };
const renderWith = (screen: React.ReactElement, auth: AuthContextType) =>
  render(<AuthContext.Provider value={auth}>{screen}</AuthContext.Provider>);

describe("profile completion", () => {
  beforeEach(() => jest.clearAllMocks());

  it("counts each of the four sections and only needs name and role to join projects", () => {
    expect(profileCompletion(emptyProfile)).toBe(0);
    expect(profileCompletion({ ...emptyProfile, nombreCompleto: "Ana", habilidades: ["Diseño"] })).toBe(0.5);
    expect(canJoinProjects({ ...emptyProfile, nombreCompleto: "Ana" })).toBe(false);
    expect(canJoinProjects({ ...emptyProfile, nombreCompleto: "Ana", rol: "Docente" })).toBe(true);
  });

  it("lets the user skip the rest of the onboarding once the name is written", async () => {
    const auth = createAuth();
    const { getByTestId, getByText } = renderWith(<OnboardingNameScreen navigation={navigation} />, auth);

    expect(getByText("0%")).toBeTruthy();
    await act(async () => fireEvent.press(getByTestId("onboarding-skip")));
    expect(auth.completeProfile).not.toHaveBeenCalled();

    fireEvent.changeText(getByTestId("onboarding-name-input"), " Ana Pérez ");
    expect(getByText("25%")).toBeTruthy();
    await act(async () => fireEvent.press(getByTestId("onboarding-skip")));

    expect(auth.completeProfile).toHaveBeenCalledWith({ nombreCompleto: "Ana Pérez" });
    expect(navigation.popTo).toHaveBeenCalledWith("App");
  });

  it("requires the name to continue the onboarding", async () => {
    const { getByTestId, getByText } = renderWith(<OnboardingNameScreen navigation={navigation} />, createAuth());

    await act(async () => fireEvent.press(getByTestId("onboarding-continue")));
    expect(getByText("Tu nombre es obligatorio")).toBeTruthy();
    expect(navigation.navigate).not.toHaveBeenCalled();
  });

  it("edits every section on one screen and saves it", async () => {
    const auth = createAuth({ profile: { ...emptyProfile, nombreCompleto: "Ana" } });
    const { getByTestId, getByText } = renderWith(<EditProfileScreen navigation={navigation} />, auth);

    fireEvent.changeText(getByTestId("edit-name-input"), "  ");
    await act(async () => fireEvent.press(getByTestId("edit-profile-save")));
    expect(getByText("Tu nombre es obligatorio")).toBeTruthy();
    expect(auth.completeProfile).not.toHaveBeenCalled();

    fireEvent.changeText(getByTestId("edit-name-input"), "Ana Pérez");
    fireEvent.press(getByText("Docente"));
    fireEvent.press(getByText("Diseño"));
    fireEvent.changeText(getByTestId("edit-bio-input"), " Me gusta la robótica ");
    expect(getByText("100%")).toBeTruthy();
    await act(async () => fireEvent.press(getByTestId("edit-profile-save")));

    expect(auth.completeProfile).toHaveBeenCalledWith(expect.objectContaining({
      nombreCompleto: "Ana Pérez", rol: "Docente", habilidades: ["Diseño"], infoAdicional: "Me gusta la robótica",
    }));
    expect(navigation.goBack).toHaveBeenCalled();
  });
});
