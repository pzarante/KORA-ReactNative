import { canJoinProjects, contactError, profileCompletion } from "@/src/features/auth/domain/entities/UserProfile";
import { AuthContext, AuthContextType } from "@/src/features/auth/presentation/context/authContext";
import EditProfileScreen from "@/src/features/auth/presentation/screens/EditProfileScreen";
import OnboardingContactScreen from "@/src/features/auth/presentation/screens/OnboardingContactScreen";
import OnboardingIntroScreen from "@/src/features/auth/presentation/screens/OnboardingIntroScreen";
import OnboardingNameScreen from "@/src/features/auth/presentation/screens/OnboardingNameScreen";
import { act, fireEvent, render } from "@testing-library/react-native";
import React from "react";

// The header bell needs navigation and DI, which these screen tests do not provide.
jest.mock("@/src/features/projects/presentation/components/NotificationBell", () => () => null);

const emptyProfile = { nombreCompleto: "", rol: "", habilidades: [], infoAdicional: "", whatsapp: "", correoContacto: "", onboardingCompletado: false };

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

  it("counts each of the five sections and only needs name and role to join projects", () => {
    expect(profileCompletion(emptyProfile)).toBe(0);
    expect(profileCompletion({ ...emptyProfile, nombreCompleto: "Ana", habilidades: ["Diseño"] })).toBe(0.4);
    expect(profileCompletion({ ...emptyProfile, whatsapp: "+57 3001234567", correoContacto: "a@b.co" })).toBe(0.2);
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
    expect(getByText("20%")).toBeTruthy();
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
    fireEvent.changeText(getByTestId("contact-email-input"), "ana@");
    await act(async () => fireEvent.press(getByTestId("edit-profile-save")));
    expect(getByText("Ingresa un correo válido")).toBeTruthy();
    expect(auth.completeProfile).not.toHaveBeenCalled();

    fireEvent.changeText(getByTestId("contact-email-input"), " ana@uninorte.edu.co ");
    fireEvent.changeText(getByTestId("contact-whatsapp-input"), "3001234567");
    expect(getByText("100%")).toBeTruthy();
    await act(async () => fireEvent.press(getByTestId("edit-profile-save")));

    expect(auth.completeProfile).toHaveBeenCalledWith(expect.objectContaining({
      nombreCompleto: "Ana Pérez", rol: "Docente", habilidades: ["Diseño"], infoAdicional: "Me gusta la robótica",
      whatsapp: "+57 3001234567", correoContacto: "ana@uninorte.edu.co",
    }));
    expect(navigation.goBack).toHaveBeenCalled();
  });

  it("checks the contact fields", () => {
    expect(contactError({ whatsapp: "", correoContacto: "" })).toBeUndefined();
    expect(contactError({ whatsapp: "", correoContacto: "" }, true)).toBe("Debes agregar al menos un medio de contacto");
    expect(contactError({ whatsapp: "+57 300", correoContacto: "" })).toBe("Ingresa un número de WhatsApp válido");
    expect(contactError({ whatsapp: "", correoContacto: "ana@uninorte" })).toBe("Ingresa un correo válido");
    expect(contactError({ whatsapp: "+57 3001234567", correoContacto: "" }, true)).toBeUndefined();
  });

  it("goes from the name to 'Construyamos tu perfil', which can leave the rest for later", async () => {
    const auth = createAuth({ profile: { ...emptyProfile, nombreCompleto: "Ana" } });
    const name = renderWith(<OnboardingNameScreen navigation={navigation} />, auth);
    await act(async () => fireEvent.press(name.getByTestId("onboarding-continue")));
    expect(navigation.navigate).toHaveBeenCalledWith("OnboardingIntro");

    const intro = renderWith(<OnboardingIntroScreen navigation={navigation} />, auth);
    fireEvent.press(intro.getByTestId("onboarding-intro-continue"));
    expect(navigation.navigate).toHaveBeenCalledWith("OnboardingRole");
    await act(async () => fireEvent.press(intro.getByTestId("onboarding-intro-later")));
    expect(auth.completeProfile).toHaveBeenCalled();
    expect(navigation.popTo).toHaveBeenCalledWith("App");
  });

  it("asks for at least one contact before finishing the onboarding", async () => {
    const auth = createAuth({ profile: { ...emptyProfile, nombreCompleto: "Ana" } });
    const { getByTestId, getByText } = renderWith(<OnboardingContactScreen navigation={navigation} />, auth);

    await act(async () => fireEvent.press(getByTestId("onboarding-contact-continue")));
    expect(getByText("Debes agregar al menos un medio de contacto")).toBeTruthy();
    expect(navigation.navigate).not.toHaveBeenCalled();

    fireEvent.changeText(getByTestId("contact-code-input"), "+1");
    fireEvent.changeText(getByTestId("contact-whatsapp-input"), "5551234567");
    await act(async () => fireEvent.press(getByTestId("onboarding-contact-continue")));
    expect(auth.updateProfile).toHaveBeenCalledWith({ whatsapp: "+1 5551234567", correoContacto: "" });
    expect(navigation.navigate).toHaveBeenCalledWith("OnboardingSuccess");
  });
});
