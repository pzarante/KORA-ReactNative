#!/usr/bin/env node
/**
 * Seeds Roble's "proyecto" table with the demo projects for the presentation and lists
 * (optionally archives) the junk test projects ("prueba", "hola", ...).
 *
 * Usage:
 *   KORA_SEED_EMAIL=... KORA_SEED_PASSWORD=... node scripts/seed-demo-projects.mjs [--apply] [--archive-junk] [--name "Nombre Apellido"]
 *
 *   (no flags)              dry run: shows what would be inserted and which projects look like junk. Writes nothing.
 *   --apply                 inserts the demo projects that don't exist yet (same nombre, not archived = skipped).
 *   --apply --archive-junk  also archives the junk projects (archivado: true). Roble only lets you update
 *                           rows you own, so others' rows come back 403 and are reported, not fatal.
 *   --name                  creador_nombre to use when the account has no "Usuario" profile row.
 *   --self-test             runs the built-in checks and exits.
 *
 * Reads EXPO_PUBLIC_ROBLE_API_URL / EXPO_PUBLIC_ROBLE_PROJECT_ID from .env; variables already set in the
 * environment win over .env.
 */
import assert from "node:assert/strict";

// ---- Demo data: edit freely. daysAgo staggers created_at so the feed looks natural. ----
// Rules the app applies: etapa in STAGES, icono in ICONS, descripcion <= 150 chars, enlaces match URL_PATTERN.
const DEMO_PROJECTS = [
  {
    daysAgo: 20,
    nombre: "RutaVerde Barranquilla",
    icono: "leaf",
    descripcion: "App que recomienda rutas a pie y en bici con más sombra y menos tráfico para moverse por Barranquilla sin morir de calor.",
    sobre: "Nació en la clase de Diseño de Interacción. Queremos cruzar datos de arborización del Distrito con reportes de los mismos usuarios para armar rutas frescas entre la universidad y los barrios cercanos.",
    etiquetas: ["Movilidad", "Sostenibilidad", "Mapas"],
    etapa: "Prototipo",
    problema: "Caminar o ir en bici al mediodía en Barranquilla es durísimo: las apps de mapas solo optimizan distancia y no tienen en cuenta la sombra, los andenes rotos ni los arroyos cuando llueve.",
    objetivo: "Lanzar un prototipo funcional con al menos 15 rutas validadas alrededor del corredor universitario de la Vía 40 y la Circunvalar, y probarlo con 30 estudiantes.",
    alcance: "Primer semestre: app móvil con mapa, rutas sugeridas y reporte de obstáculos. No incluye navegación paso a paso ni integración con Transmetro todavía.",
    roles: ["Desarrollador móvil", "Diseñador UX/UI", "Analista de datos"],
    enlaces: ["https://www.figma.com/community"],
  },
  {
    daysAgo: 16,
    nombre: "Tutorías Pares Uninorte",
    icono: "school-outline",
    descripcion: "Plataforma para conectar estudiantes que necesitan refuerzo en materias de primeros semestres con monitores de semestres superiores.",
    sobre: "Somos estudiantes de Ingeniería de Sistemas y Psicología. Vimos que muchos compañeros pierden Cálculo y Física por no encontrar quién les explique a tiempo, y que los grupos de WhatsApp no alcanzan.",
    etiquetas: ["Educación", "Comunidad", "Web"],
    etapa: "Formación de equipo",
    problema: "Los estudiantes de primer y segundo semestre no saben a quién acudir cuando se atrasan, y los horarios de monitoría oficiales chocan con sus clases.",
    objetivo: "Tener un piloto con 20 tutores y 100 estudiantes durante el próximo periodo, con agendamiento de sesiones y calificación de cada tutoría.",
    alcance: "Web responsive con perfiles, agenda y chat básico. Pagos y certificados de horas de monitoría quedan para una segunda fase.",
    roles: ["Desarrollador backend", "Diseñador UX/UI", "Psicólogo educativo", "Community manager"],
    enlaces: [],
  },
  {
    daysAgo: 12,
    nombre: "Sensor de calidad de agua del Caño",
    icono: "water-outline",
    descripcion: "Boya de bajo costo con sensores de pH, turbidez y temperatura para monitorear en tiempo real el agua de los caños de Barranquilla.",
    sobre: "Proyecto del semillero de Ingeniería Electrónica y Ambiental. Ya tenemos el primer circuito con ESP32 y queremos llevarlo al Caño de la Auyama con apoyo de líderes comunitarios.",
    etiquetas: ["IoT", "Medio ambiente", "Hardware"],
    etapa: "Investigación",
    problema: "Las comunidades cerca de los caños no tienen información clara sobre la contaminación del agua, y las mediciones oficiales son esporádicas y poco accesibles.",
    objetivo: "Diseñar y calibrar un prototipo que envíe mediciones cada 15 minutos a un tablero público, y validar los datos contra muestras de laboratorio.",
    alcance: "Un nodo instalado y funcionando durante un mes, con tablero web abierto. No contempla aún tratamiento del agua ni alertas sanitarias oficiales.",
    roles: ["Ingeniero electrónico", "Investigador", "Desarrollador web", "Ingeniero ambiental"],
    enlaces: ["https://github.com/espressif/arduino-esp32"],
  },
  {
    daysAgo: 9,
    nombre: "Sabor Caribe Market",
    icono: "storefront-outline",
    descripcion: "Marketplace para que emprendedores de comida típica de los barrios vendan por pedido a estudiantes y trabajadores de la zona norte.",
    sobre: "Somos de Administración, Negocios Internacionales y Sistemas. Muchas señoras que venden fritos, arepas de huevo y jugos dependen solo del voz a voz; queremos darles un canal digital sencillo.",
    etiquetas: ["Emprendimiento", "Comercio", "Impacto social"],
    etapa: "Idea",
    problema: "Los pequeños negocios de comida típica no llegan a clientes fuera de su cuadra y las apps de domicilios grandes les cobran comisiones que no pueden pagar.",
    objetivo: "Validar el modelo con 10 emprendedores y medir si los pedidos programados del día anterior funcionan para ellos y para los compradores.",
    alcance: "Encuestas, entrevistas y un prototipo navegable en Figma. La logística de domicilios y los pagos en línea no entran en esta etapa.",
    roles: ["Investigador de mercados", "Diseñador UX/UI", "Estratega de negocio"],
    enlaces: [],
  },
  {
    daysAgo: 5,
    nombre: "Caribe Quest",
    icono: "gamepad-variant-outline",
    descripcion: "Videojuego educativo 2D que enseña historia y cultura del Caribe colombiano a niños de primaria a través de misiones en el Carnaval.",
    sobre: "Iniciativa entre estudiantes de Diseño Gráfico, Licenciatura y Sistemas. Queremos que los colegios de Barranquilla tengan material digital propio sobre nuestra región.",
    etiquetas: ["Videojuegos", "Educación", "Cultura"],
    etapa: "Prototipo",
    problema: "Los niños conocen poco de la historia de su región y los contenidos escolares sobre el Caribe son escasos y poco atractivos.",
    objetivo: "Terminar un nivel jugable sobre el Carnaval de Barranquilla y probarlo con dos cursos de quinto grado en un colegio aliado.",
    alcance: "Un nivel completo para Android y web hecho en Godot. Más niveles, voces y versión iOS quedan para después de las pruebas.",
    roles: ["Desarrollador de videojuegos", "Ilustrador", "Diseñador de sonido", "Pedagogo"],
    enlaces: ["https://godotengine.org"],
  },
  {
    daysAgo: 2,
    nombre: "Salud Mental Campus",
    icono: "heart-outline",
    descripcion: "App de bienestar con check-ins diarios de ánimo y acceso rápido a los servicios de apoyo psicológico de la universidad.",
    sobre: "Grupo de Psicología, Medicina y Sistemas. Después de varias encuestas vimos que muchos estudiantes no usan el apoyo de Bienestar porque no saben cómo pedirlo o les da pena.",
    etiquetas: ["Salud", "Bienestar", "Móvil"],
    etapa: "Pruebas",
    problema: "En semanas de parciales el estrés se dispara y los estudiantes no identifican a tiempo cuándo necesitan ayuda ni cómo pedir una cita.",
    objetivo: "Probar la app con 50 estudiantes durante cuatro semanas y medir si aumenta el número de personas que buscan acompañamiento.",
    alcance: "Check-in de ánimo, ejercicios de respiración y botón para agendar con Bienestar. No hace diagnóstico ni reemplaza la atención profesional.",
    roles: ["Desarrollador móvil", "Psicólogo", "Tester QA"],
    enlaces: [],
  },
];

// Mirrors the app: PROJECT_STAGES (Project.ts), PROJECT_ICONS (projectIcons.ts), URL_PATTERN, MAX_DESCRIPTION.
const STAGES = ["Idea", "Formación de equipo", "Investigación", "Prototipo", "Pruebas"];
const ICONS = [
  "leaf", "web", "chip", "apple-keyboard-command", "gamepad-variant-outline", "book-open-variant", "cube-outline",
  "lightbulb-on-outline", "account-group-outline", "school-outline", "flask-outline", "laptop", "cellphone", "weather-cloudy",
  "white-balance-sunny", "water-outline", "recycle", "tree-outline", "sprout-outline", "heart-outline", "medical-bag",
  "wheelchair-accessibility", "briefcase-outline", "storefront-outline", "office-building-outline", "home-outline", "map-marker-outline", "compass-outline",
  "camera-outline", "music-note-outline", "palette-outline", "pencil-outline", "cog-outline", "rocket-launch-outline", "forum-outline",
  "chart-bar", "chart-pie", "presentation", "bullhorn-outline", "handshake-outline", "calendar-blank-outline", "clipboard-check-outline",
  "target", "trophy-outline", "flag-outline", "sitemap-outline", "trending-up", "layers-outline", "database-outline",
  "shield-check-outline", "lock-outline", "key-outline", "puzzle-outline", "server", "headphones", "movie-open-outline",
  "soccer", "microphone-outline", "hand-heart-outline", "paw-outline", "flower-outline", "waves", "image-filter-hdr",
  "tent", "campfire", "test-tube", "earth", "star-four-points-outline", "star-shooting-outline", "bank-outline",
];
const URL_PATTERN = /^https?:\/\/\S+\.\S+$/i;
const MAX_DESCRIPTION = 150;

const JUNK_WORDS = /\b(pruebas?|test\w*|hola|asd\w*|x{3,}|qwerty\w*|a{3,}|lorem|ejemplo|dummy|fake)\b/i;
// The name is checked fully; the description only when it is short, so "pruebas con usuarios" in a real one doesn't count.
function isJunk({ nombre = "", descripcion = "" }) {
  const name = String(nombre).trim();
  const desc = String(descripcion).trim();
  return name.length < 4 || JUNK_WORDS.test(name) || (desc.length < 25 && (desc.length < 4 || JUNK_WORDS.test(desc)));
}

function validateDemoData() {
  const names = new Set();
  for (const p of DEMO_PROJECTS) {
    const where = `demo "${p.nombre}"`;
    assert.ok(p.nombre?.trim() && p.descripcion?.trim(), `${where}: nombre y descripcion son obligatorios`);
    assert.ok(!names.has(p.nombre), `${where}: nombre repetido`);
    names.add(p.nombre);
    assert.ok(STAGES.includes(p.etapa), `${where}: etapa "${p.etapa}" no está en ${STAGES.join(", ")}`);
    assert.ok(ICONS.includes(p.icono), `${where}: icono "${p.icono}" no existe en PROJECT_ICONS`);
    assert.ok(p.descripcion.length <= MAX_DESCRIPTION, `${where}: descripcion pasa de ${MAX_DESCRIPTION} caracteres (${p.descripcion.length})`);
    for (const url of p.enlaces) assert.ok(URL_PATTERN.test(url), `${where}: enlace inválido ${url}`);
    assert.ok([p.etiquetas, p.roles, p.enlaces].every(Array.isArray), `${where}: etiquetas, roles y enlaces deben ser listas`);
    assert.ok(!isJunk(p), `${where}: el detector de basura lo marcaría`);
  }
}

function selfTest() {
  validateDemoData();
  for (const nombre of ["prueba", "Prueba 2", "hola", "HOLA mundo", "asdasd", "xxx", "qwerty", "aaaa", "Test app", "ab", "  q  "]) {
    assert.ok(isJunk({ nombre, descripcion: "algo" }), `debería ser basura: ${nombre}`);
  }
  assert.ok(isJunk({ nombre: "Mi proyecto", descripcion: "asd" }));
  assert.ok(!isJunk({ nombre: "Atlas", descripcion: "Plataforma para hacer pruebas con usuarios reales de la universidad." }));
  assert.ok(!isJunk({ nombre: "Contest Hub", descripcion: "Concursos de programación entre semilleros." }));
  console.log("self-test OK");
}

// ---- Roble ----
const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const option = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};

async function main() {
  if (flag("--self-test")) return selfTest();
  validateDemoData();

  // loadEnvFile never overrides variables already set, so env overrides .env.
  try {
    process.loadEnvFile(new URL("../.env", import.meta.url));
  } catch {
    // No .env: rely on the environment.
  }
  const api = (process.env.EXPO_PUBLIC_ROBLE_API_URL ?? "https://roble-api.test-openlab.uninorte.edu.co").replace(/\/$/, "");
  const projectId = process.env.EXPO_PUBLIC_ROBLE_PROJECT_ID;
  const { KORA_SEED_EMAIL: email, KORA_SEED_PASSWORD: password } = process.env;
  if (!projectId) return fail("Falta EXPO_PUBLIC_ROBLE_PROJECT_ID (en .env o en el entorno).");
  if (!email || !password) return fail("Faltan KORA_SEED_EMAIL y/o KORA_SEED_PASSWORD.");

  const apply = flag("--apply");
  const archiveJunk = flag("--archive-junk");
  console.log(apply ? "MODO APPLY: se escribirá en Roble." : "DRY RUN: no se escribe nada (usa --apply para escribir).");

  const login = await fetch(`${api}/auth/${projectId}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=UTF-8" },
    body: JSON.stringify({ email, password }),
  }).catch((err) => ({ ok: false, status: err.message }));
  const session = login.ok ? await login.json().catch(() => ({})) : {};
  if (!session.accessToken) return fail(`No se pudo iniciar sesión en Roble (${login.status}). Revisa el correo, la contraseña y que la cuenta esté verificada.`);
  const token = session.accessToken;
  const userId = userIdFromToken(token);

  const db = (path, init = {}) =>
    fetch(`${api}/database/${projectId}/${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    });
  const read = async (table, filter = {}) => {
    const res = await db(`read?${new URLSearchParams({ tableName: table, ...filter })}`);
    if (res.status === 404) return []; // Roble: no rows match.
    if (!res.ok) throw new Error(`No se pudo leer ${table}: ${await errorText(res)}`);
    const rows = await res.json();
    return Array.isArray(rows) ? rows : [];
  };

  const profile = (await read("Usuario", { user_id: userId }).catch(() => [])).find((row) => row.user_id === userId);
  const creadorNombre = profile?.nombre_completo?.trim() || option("--name")?.trim();
  if (!creadorNombre) return fail('La cuenta no tiene perfil con nombre_completo en "Usuario"; pasa --name "Nombre Apellido".');
  console.log(`Sesión iniciada. creador_nombre: ${creadorNombre}\n`);

  const active = (await read("proyecto")).filter((row) => !row.archivado);
  const summary = { inserted: 0, skipped: 0, archived: 0, failed: 0 };

  // Junk
  const junk = active.filter(isJunk);
  console.log(`Proyectos que parecen de prueba (${junk.length}):`);
  for (const row of junk) console.log(`  - ${row._id}  "${row.nombre}"  por ${row.creador_nombre || "?"}${row.creador_id === userId ? " (tuyo)" : ""}`);
  if (junk.length > 0 && !(apply && archiveJunk)) console.log("  (para archivarlos: --apply --archive-junk)");
  if (apply && archiveJunk) {
    for (const row of junk) {
      const res = await db("update", {
        method: "PUT",
        body: JSON.stringify({ tableName: "proyecto", idColumn: "_id", idValue: row._id, updates: { archivado: true } }),
      });
      if (res.ok) {
        summary.archived++;
        console.log(`  ARCHIVADO  "${row.nombre}"`);
      } else {
        summary.failed++;
        const why = res.status === 403 ? "403: Roble solo deja archivar filas propias; archívalo con la cuenta de su creador" : await errorText(res);
        console.log(`  FALLÓ      "${row.nombre}" (${why})`);
      }
    }
  }

  // Demo projects
  console.log(`\nProyectos demo (${DEMO_PROJECTS.length}):`);
  const existing = new Set(active.map((row) => String(row.nombre ?? "").trim().toLowerCase()));
  for (const { daysAgo, ...project } of DEMO_PROJECTS) {
    if (existing.has(project.nombre.trim().toLowerCase())) {
      summary.skipped++;
      console.log(`  OMITIDO    "${project.nombre}" (ya existe)`);
      continue;
    }
    // Same columns the app writes in ProjectRemoteDataSourceImp.toRecord; an unknown column makes Roble drop the row.
    const createdAt = new Date(Date.now() - daysAgo * 86_400_000 - (daysAgo % 5) * 3_600_000).toISOString();
    const record = { ...project, creador_id: userId, creador_nombre: creadorNombre, created_at: createdAt };
    if (!apply) {
      console.log(`  INSERTARÍA "${project.nombre}"  [${project.etapa}, ${project.icono}]  ${createdAt.slice(0, 10)}  roles: ${project.roles.join(", ")}`);
      continue;
    }
    const res = await db("insert", { method: "POST", body: JSON.stringify({ tableName: "proyecto", records: [record] }) });
    const body = res.ok ? await res.json().catch(() => ({})) : null;
    const skipped = Array.isArray(body?.skipped) ? body.skipped : [];
    if (res.ok && skipped.length === 0) {
      summary.inserted++;
      console.log(`  INSERTADO  "${project.nombre}"  ${body?.inserted?.[0]?._id ?? ""}`);
    } else {
      summary.failed++;
      console.log(`  FALLÓ      "${project.nombre}" (${res.ok ? `Roble lo descartó: ${skipped[0]?.reason ?? "sin motivo"}` : await errorText(res)})`);
    }
  }

  console.log(`\nResumen${apply ? "" : " (dry run)"}: insertados ${summary.inserted} · omitidos ${summary.skipped} · archivados ${summary.archived} · fallidos ${summary.failed}`);
  if (summary.failed > 0) process.exitCode = 1;
}

function userIdFromToken(token) {
  const payload = JSON.parse(Buffer.from(token.split(".")[1] ?? "", "base64url").toString());
  const id = payload.sub ?? payload.uid ?? payload.user_id ?? payload.userId ?? payload.id;
  if (typeof id !== "string" || !id) throw new Error("El token de Roble no trae el user_id (sub)");
  return id;
}

async function errorText(res) {
  const body = await res.json().catch(() => ({}));
  return `${res.status}${body.message ? `: ${body.message}` : ""}`;
}

function fail(message) {
  console.error(`Error: ${message}`);
  process.exitCode = 1;
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exitCode = 1;
});
