-- Datos del perfil según el rol (Figma p. 28–30) y proyectos guardados (Figma p. 35–38).
-- Pegar en la Consola SQL de Roble (proyecto kora_eb11b19cdd). Solo usa ADD COLUMN y CREATE TABLE,
-- que es lo que la consola permite. Se puede ejecutar más de una vez sin romper nada.

-- Estudiante: carrera + semestre · Docente: departamento + asignaturas · Egresado: carrera + año + cargo.
-- Todas opcionales (NULL): los perfiles que ya existen no tienen estos datos.
ALTER TABLE "Usuario" ADD COLUMN IF NOT EXISTS carrera text;
ALTER TABLE "Usuario" ADD COLUMN IF NOT EXISTS semestre text;
ALTER TABLE "Usuario" ADD COLUMN IF NOT EXISTS departamento text;
ALTER TABLE "Usuario" ADD COLUMN IF NOT EXISTS asignaturas text;
ALTER TABLE "Usuario" ADD COLUMN IF NOT EXISTS anio_egreso text;
ALTER TABLE "Usuario" ADD COLUMN IF NOT EXISTS cargo text;

-- Un proyecto guardado (bookmark) por persona. UNIQUE evita guardarlo dos veces.
-- Quitarlo de guardados pone activo = false en vez de borrar la fila: el rol user tiene
-- all:update pero no delete (y no conviene dárselo).
CREATE TABLE IF NOT EXISTS guardado (
  _id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id text NOT NULL,
  proyecto_id text NOT NULL,
  activo boolean NOT NULL DEFAULT true,
  created_at timestamptz,
  _owner text,
  UNIQUE (usuario_id, proyecto_id)
);
