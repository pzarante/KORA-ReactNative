import { simulatedSummary } from "@/src/features/koranode/data/datasources/simulatedDevice";
import { KoraNodeRepository } from "@/src/features/koranode/domain/repositories/KoraNodeRepository";
import { KoraNodeUseCases } from "@/src/features/koranode/domain/use-cases/KoraNodeUseCases";

const repository = (): jest.Mocked<KoraNodeRepository> => ({
  getLink: jest.fn(),
  saveLink: jest.fn(async (link) => ({ ...link, createdAt: "now" })),
  listMeetings: jest.fn(),
  createMeeting: jest.fn(async (meeting) => ({ ...meeting, id: "m1", creadorId: "ana", editadoPorNombre: "", createdAt: "now" })),
  updateMeeting: jest.fn(),
  waitForDevice: jest.fn(async (_codigo: string) => undefined),
  generateSummary: jest.fn(async (context) => simulatedSummary(context)),
});

describe("KoraNodeUseCases", () => {
  it("gives every member of a project the same short sync code", () => {
    const useCases = new KoraNodeUseCases(repository());
    expect(useCases.syncCode("3f9c2a51-0b7e-4c1d-9e6f-1a2b3c4d5e6f")).toMatch(/^KORA-[0-9A-F]{4}$/);
    expect(useCases.syncCode("p1")).toBe(useCases.syncCode("p1"));
    expect(useCases.syncCode("p1")).not.toBe(useCases.syncCode("p2"));
  });

  it("links the project only after the device confirms that code", async () => {
    const repo = repository();
    const useCases = new KoraNodeUseCases(repo);
    await useCases.syncDevice("p1", "Ana");
    expect(repo.waitForDevice).toHaveBeenCalledWith(useCases.syncCode("p1"));
    expect(repo.saveLink).toHaveBeenCalledWith({ proyectoId: "p1", codigo: useCases.syncCode("p1"), sincronizadoPorNombre: "Ana" });
  });

  it("saves the AI summary as notes and assigns the next steps to the real members", async () => {
    const repo = repository();
    const meeting = await new KoraNodeUseCases(repo).finishMeeting({
      proyectoId: "p1",
      proyectoNombre: "EcoCampus",
      etapa: "Prototipo",
      integrantes: ["Ana", "Luis"],
      inicio: "2026-11-07T15:00:00.000Z",
      fin: "2026-11-07T15:47:00.000Z",
      creadorNombre: "Ana",
    });

    expect(repo.createMeeting).toHaveBeenCalledTimes(1);
    expect(meeting).toMatchObject({ proyectoId: "p1", titulo: "Seguimiento – EcoCampus", inicio: "2026-11-07T15:00:00.000Z", creadorNombre: "Ana" });
    expect(meeting.objetivo).toMatch(/prototipo/);
    expect(meeting.acuerdos).toHaveLength(3);
    expect(meeting.proximosPasos.map((s) => s.texto)).toEqual([
      expect.stringContaining("(Responsable: Ana)"),
      expect.stringContaining("(Responsable: Luis)"),
      expect.stringMatching(/^Reunión de seguimiento: /),
    ]);
    expect(meeting.proximosPasos.every((s) => !s.hecho)).toBe(true);
  });
});
