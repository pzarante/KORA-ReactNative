-- KORA NODE: tablas que la app necesita en Roble (base de datos del proyecto kora_eb11b19cdd).
-- Mismo estilo que las tablas existentes: ids de referencia en text, listas en json, fechas timestamptz.
-- La consola SQL de Roble solo acepta SELECT, CREATE TABLE, INSERT, DELETE con WHERE y
-- ALTER TABLE ADD COLUMN, así que aquí no hay índices ni cambios de restricciones.

-- Un KORA NODE vinculado por proyecto. UNIQUE evita dos vínculos si dos integrantes sincronizan a la vez.
CREATE TABLE IF NOT EXISTS kora_node (
  _id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proyecto_id text NOT NULL UNIQUE,
  codigo text NOT NULL,
  sincronizado_por text,
  sincronizado_por_nombre text,
  created_at timestamptz,
  _owner text
);

-- Notas (resúmenes de IA) de cada reunión, compartidas por todos los integrantes del proyecto.
CREATE TABLE IF NOT EXISTS reunion (
  _id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proyecto_id text NOT NULL,
  titulo text NOT NULL,
  objetivo text,
  acuerdos json NOT NULL DEFAULT '[]',          -- ["Ajustar el cronograma.", ...]
  proximos_pasos json NOT NULL DEFAULT '[]',    -- [{"texto": "...", "hecho": false}, ...]
  inicio timestamptz NOT NULL,
  fin timestamptz NOT NULL,
  creador_id text,
  creador_nombre text,
  editado_por_nombre text,
  created_at timestamptz,
  updated_at timestamptz,
  _owner text
);
-- La app crea notificaciones con tipo = 'reunion'. notificacion.tipo no tiene restricción CHECK
-- (verificado el 2026-11-10 con la consulta de abajo, 0 filas), así que no hay que cambiar nada.
-- SELECT conname, pg_get_constraintdef(oid) FROM pg_constraint
-- WHERE conrelid = 'notificacion'::regclass AND contype = 'c';
