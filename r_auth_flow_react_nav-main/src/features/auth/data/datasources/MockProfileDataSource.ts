import { UserProfile } from "../../domain/entities/UserProfile";
import { ProfileDataSource } from "./ProfileDataSource";

export class MockProfileDataSource implements ProfileDataSource {
  async saveProfile(_profile: Omit<UserProfile, "userId">): Promise<void> {}

  async getProfile(): Promise<UserProfile | null> {
    return null;
  }

  async listProfiles(): Promise<UserProfile[]> {
    return [
      { userId: "nancy", nombreCompleto: "Nancy", rol: "Estudiante", carrera: "Diseño Gráfico", semestre: "2", habilidades: ["Creatividad", "Diseño"], infoAdicional: "", whatsapp: "", correoContacto: "nancy@correo.com", onboardingCompletado: true },
    ];
  }
}
