import React, { createContext, useContext, useMemo, useState } from "react";

import { useDI } from "@/src/core/di/DIProvider";
import { TOKENS } from "@/src/core/di/tokens";
import { useAuth } from "@/src/features/auth/presentation/context/authContext";
import { NewProject, Project } from "../../domain/entities/Project";
import { ProjectUseCases } from "../../domain/use-cases/ProjectUseCases";

const emptyDraft: NewProject = {
  icono: "leaf",
  nombre: "",
  descripcion: "",
  etiquetas: [],
  etapa: "",
  problema: "",
  objetivo: "",
  alcance: "",
  roles: [],
  enlaces: [],
};

type CreateProjectContextType = {
  draft: NewProject;
  update: (patch: Partial<NewProject>) => void;
  create: () => Promise<Project | null>;
  saving: boolean;
  error: string | null;
};

const CreateProjectContext = createContext<CreateProjectContextType | undefined>(undefined);

export function CreateProjectProvider({ children }: { children: React.ReactNode }) {
  const di = useDI();
  const projectUseCases = useMemo(() => di.resolve<ProjectUseCases>(TOKENS.ProjectUseCases), [di]);
  const { profile } = useAuth();
  const [draft, setDraft] = useState<NewProject>(emptyDraft);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (patch: Partial<NewProject>) => setDraft((current) => ({ ...current, ...patch }));

  const create = async () => {
    setError(null);
    setSaving(true);
    try {
      return await projectUseCases.createProject(draft, profile.nombreCompleto);
    } catch (err: any) {
      setError(err?.message ?? "No se pudo crear el proyecto");
      return null;
    } finally {
      setSaving(false);
    }
  };

  return (
    <CreateProjectContext.Provider value={{ draft, update, create, saving, error }}>
      {children}
    </CreateProjectContext.Provider>
  );
}

export function useCreateProject() {
  const ctx = useContext(CreateProjectContext);
  if (!ctx) throw new Error("useCreateProject must be used inside CreateProjectProvider");
  return ctx;
}
