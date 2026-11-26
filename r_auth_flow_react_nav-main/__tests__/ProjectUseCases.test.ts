import { JoinRequest, Project } from "@/src/features/projects/domain/entities/Project";
import { ProjectRepository } from "@/src/features/projects/domain/repositories/ProjectRepository";
import { ProjectUseCases } from "@/src/features/projects/domain/use-cases/ProjectUseCases";

const project = { id: "p1", creadorId: "creator", creadorNombre: "María" } as Project;
const req = (id: string, estado: JoinRequest["estado"]) => ({ id: `r-${id}`, proyectoId: "p1", usuarioId: id, usuarioNombre: id.toUpperCase(), estado }) as JoinRequest;
const team = [req("ana", "aceptada"), req("luis", "aceptada"), req("sol", "aceptada"), req("pau", "pendiente")];

const setup = (me: string) => {
  const repo = { currentUserId: jest.fn(async () => me), setRequestStatus: jest.fn(async () => undefined), notify: jest.fn(async () => undefined) };
  return { repo, useCases: new ProjectUseCases(repo as unknown as ProjectRepository) };
};

describe("ProjectUseCases leave/kick", () => {
  it("lets a member leave and tells the creator and the other accepted members", async () => {
    const { repo, useCases } = setup("ana");
    await useCases.leaveProject(project, team);
    expect(repo.setRequestStatus).toHaveBeenCalledWith("r-ana", "retirada");
    expect(repo.notify).toHaveBeenCalledWith({ para: ["creator", "luis", "sol"], tipo: "salida", proyectoId: "p1", actorNombre: "ANA" });
  });

  it("refuses to leave when the user is not an accepted member, without writing", async () => {
    const { repo, useCases } = setup("pau");
    await expect(useCases.leaveProject(project, team)).rejects.toThrow("No formas parte de este proyecto");
    expect(repo.setRequestStatus).not.toHaveBeenCalled();
    expect(repo.notify).not.toHaveBeenCalled();
  });

  it("removes a member, telling them and the rest of the team", async () => {
    const { repo, useCases } = setup("creator");
    await useCases.removeMember(project, team[1], team);
    expect(repo.setRequestStatus).toHaveBeenCalledWith("r-luis", "expulsada");
    expect(repo.notify).toHaveBeenCalledWith({ para: ["luis"], tipo: "expulsion", proyectoId: "p1", actorNombre: "María" });
    expect(repo.notify).toHaveBeenCalledWith({ para: ["ana", "sol"], tipo: "salida", proyectoId: "p1", actorNombre: "LUIS" });
  });
});
