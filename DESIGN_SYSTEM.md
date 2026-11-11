# KORA — Sistema de diseño

Fuentes, en orden de prioridad:
1. Capturas de Figma en `RN/FIGMA/` (35 pantallas, 856×1852 px = iPhone @2x, viewport ≈ 428×926 pt). Colores y medidas muestreados de los píxeles.
2. Guía de marca "Electric Connection": solo se tomó lo que coincide con las capturas (ver §9).
3. Código en `r_auth_flow_react_nav-main/src/`.

El archivo de Figma ("PARCIAL-INTERACCION-KORA-PRIMER-CLUSTER") no se pudo leer directamente (sin permisos).

**Producto:** comunidad universitaria (Uninorte) para crear proyectos, formar equipos y conectar personas por habilidades. Tono cercano, en español, tuteo.

**Marca:** innovadora, colaborativa y enérgica — "conecta ideas, crea impacto". Superficies blancas y limpias, anclas en violeta eléctrico, acentos naranja en los puntos clave y manchas de color difusas en las esquinas. Formas redondeadas y generosas.

---

## 1. Color

### 1.1 Tokens

Los tokens de la app viven en `src/shared/ui/tokens.ts` → `colors` (estilos de formulario y botones en `src/shared/ui/styles.ts` → `ui`). Ninguna pantalla debe escribir estos colores a mano. La columna Figma es la referencia; donde el código difiere, manda Figma.

| Token | Figma (muestreado) | Código actual | Uso |
|---|---|---|---|
| `primary` | `#3C00A0` | `#3C00A0` | Botones, links, tab activo, barra de progreso, filtro activo, hero del Home, círculo de éxito |
| `primaryGradient` | `#4E11BD → #5F22D9` (horizontal) | `#4E11BD → #5F22D9` (`ButtonGradient`) | Relleno de los botones primarios grandes |
| `text` | `#1E1630` | `#1E1630` | Títulos y texto principal |
| `muted` | `#6B6282` | `#6B6282` | Texto secundario, placeholders, íconos y labels inactivos |
| `border` | lavanda claro | `#E9DCFA` | Bordes de inputs, cards, tab bar, divisores |
| `soft` | `#F0EBFF` | `#F0EBFF` | Fondo de chips morados, contenedor de ícono, opción seleccionada |
| `cardHeader` | `#F0E7FC` | — | Cabecera de las cards del grid de Explorar |
| `filterChip` | `#E3DAEF` | — | Chips de filtro no activos (Explorar) |
| `card` | `#FBFBFB` – `#FEFCFF` | `#FEFCFF` | Fondo de cards (casi blanco) |
| `orange` | `#FF6B00` (texto de chip) | `#FF6B00` | Acento de marca, asterisco de requerido, chips de etapa, ícono "salir" |
| `orangeSoft` | `#FFEBDF` | `#FFEBDF` | Fondo de chips naranja |
| `error` | — | `#C62828` | Errores de formulario |
| `progressTrack` | `#E8D9FA` | `#E8D9FA` | Pista de la barra de pasos |
| `disabled` | `#E5E0E8` | `#E5E0E8` / texto `disabledText` `#A49DB0` | Botón "Siguiente" sin completar |
| `scrim` | ≈ `rgba(33,24,50,0.53)` | `rgba(33,24,50,0.53)` | Fondo detrás de popups y sheets |
| `background` | `#FFFFFF` | `#FFFFFF` | Fondo de todas las pantallas |

**Logo "K"** (`src/shared/ui/BrandLogo.tsx`, imagen `assets/images/kora-k.png`): trazo vertical `#5700C9`, brazo superior `#7217F1`, brazo inferior `#FF5A00`.

**Manchas de fondo** (`src/shared/ui/ScreenSurface.tsx`; `BrandBlob.tsx` para manchas difusas sueltas): círculos difusos detrás del contenido. Morado `#E5CEFF` arriba a la derecha (opacidad .72), `#E9D6FF` a media altura, durazno `#FFD4C8` abajo a la izquierda (.7). Aparecen en casi todas las pantallas de Figma, también encima de los modales y sheets.

### 1.2 Tema de react-native-paper

`src/theme/theme.ts` → `brandTheme`: un solo tema claro armado con los tokens de §1.1 (se borró el tema MD3 ámbar). Figma no tiene modo oscuro, así que la app queda en claro aunque el teléfono esté en modo oscuro (`app.json` → `userInterfaceStyle: "light"`).

### 1.3 Semántica de chips

- **Morado suave** (`soft` + texto `primary`): categoría/tag del proyecto (Tecnología, Agua), roles, habilidades.
- **Naranja suave** (`orangeSoft` + texto `orange`): etapa del proyecto (Idea, Prototipo) o segunda etiqueta (Campus, Sostenibilidad).
- **Morado sólido** (`primary` + texto blanco): filtro activo ("Todos"), rol seleccionado, badge "Nuevo".
- **Contorno morado** (borde `primary`, fondo blanco): rol seleccionable no elegido (Solicitar unirme).
- **Relleno lavanda** (`filterChip` + texto `text`): filtro no activo.

---

## 2. Tipografía

**Plus Jakarta Sans** (identificada por la forma de las letras en las capturas: `a` de dos pisos, `g` de un piso, `y` de cola recta). Pesos usados: 400, 600, 700, 800.

Se carga en `App.tsx` (`useFonts(brandFonts)`) y `src/shared/ui/fonts.ts` → `installBrandFont()` la aplica a todo `Text` y `TextInput`: elige la familia según el `fontWeight` del estilo (`800` → `PlusJakartaSans_800ExtraBold`, etc.), porque con fuentes cargadas cada peso es una familia distinta. Las pantallas siguen escribiendo solo `fontWeight`. Un estilo con `fontFamily` propio se respeta (Sora en Bienvenida, fuentes de íconos).

| Estilo | Tamaño / interlineado (pt) | Peso | Tracking | Ejemplo |
|---|---|---|---|---|
| `display` | 32 / 40 | 800 | -0.02em | "¡Proyecto Creado!", "Crea una cuenta para unirte", "Comentarios" |
| `headline-lg` | 26 / 34 | 800 | -0.02em | Título de pantalla: "Información básica", "Explorar", "Mi perfil" |
| `headline-md` | 22 / 28 | 800 | -0.01em | Título de sección: "Proyectos Recientes", "Habilidades", "6 integrantes"; título de sheet |
| `headline-sm` | 18 / 24 | 700 | 0 | Título de card: "Sobre el proyecto", "EcoCampus" en la card |
| `label-lg` | 16 / 22 | 800 | 0 | Botones, label de campo ("Nombre del proyecto *") |
| `body-lg` | 15–16 / 22–24 | 400 | 0 | Descripciones, inputs |
| `body-md` | 14 / 20 | 400 | 0 | Texto en cards, comentarios |
| `body-sm` | 13 / 18 | 400–700 | 0 | Helper text, "PASO 2 DE 5", fechas ("Hace 2 días") |
| `label-md` | 12–14 / 16 | 700 | 0 | Chips, labels de la tab bar |
| `overline` | 13 / 16 | 800, MAYÚSCULAS | +0.06em | "COMUNIDAD DE INNOVACIÓN", "PASO 1 DE 5" |

Los chips **no** van en mayúsculas (excepción: badge de etapa "IDEA" en Revisar proyecto).

---

## 3. Espaciado, radios y elevación

- **Base:** múltiplos de 4 pt.
- **Margen lateral:** 24 pt en todas las pantallas.
- **Separación entre bloques:** 24 pt; dentro de un bloque 8–12 pt; entre chips 8 pt; padding interno de cards 16–24 pt.
- **Radios** (todo es pill o muy redondeado):
  - Botones e inputs de una línea: pill completo (alto 52–57).
  - Chips y badges: pill completo.
  - Textareas: 24.
  - Cards: 20–24.
  - Hero del Home, modales y bottom sheets: 32 (sheet solo arriba).
  - Botón "atrás" e íconos de header: círculo 48.
  - Barra de progreso: alto 6 (wizard) o 10 (perfil), radio = alto/2.
- **Elevación:**
  - Cards: fondo casi blanco + borde 1 pt lavanda (`border`). Sin sombra visible.
  - Botón primario grande: sombra tintada en morado (offset y 8, opacidad .25, radio 10, `elevation: 5`).
  - Modales y sheets: sobre el `scrim`; sin desenfoque de fondo.
- **Área táctil mínima:** 44 pt.

---

## 4. Iconografía e ilustraciones

- **Íconos de línea**, trazo fino, color `primary` (o `muted` si están inactivos). En el código: `Feather` (tab bar) y `MaterialCommunityIcons` (resto).
- **Ícono de proyecto:** el usuario elige 1 de 70 (`PROJECT_ICONS`). Va en un cuadrado redondeado `soft` de 48–120 pt; en la card destacada de Explorar el fondo es `primary` y el ícono blanco.
- **Contenedor de ícono en cards:** cuadrado redondeado `soft` de 40–48 pt a la izquierda del título.
- **Ilustraciones de estado** (Crear proyecto, Crear cuenta, Completa tu perfil, KORA TAG, Abandonar): objeto de línea gruesa morada, relleno lavanda, blob lavanda detrás, badge circular `primary` con ícono blanco y 3 rayitas naranjas de "chispa" arriba a la derecha.
- **Avatares:** círculo `soft` con la inicial en `primary` (800). En el perfil, 100 pt con borde fino morado.

---

## 5. Componentes

| Componente | Dónde vive | Especificación |
|---|---|---|
| Botón primario | `ui.primaryButton`, `AuthPrimaryButton` | Alto 52–57, pill, degradado `primaryGradient` (o `primary` sólido), texto blanco `label-lg`. Variante con flecha "→" para avanzar (Comenzar, Registrarse). Deshabilitado: `disabled` + texto `#A49DB0`. |
| Botón contorno | `ui.outlineButton` | Mismo alto, borde 1.5 `primary`, fondo blanco, texto `primary`. Para "Atrás", "Cancelar", "Seguir creando", "Ver solicitudes". |
| Link de texto | — | Texto `primary` 700, a veces subrayado ("Volver al inicio", "Ver todas", "Cancelar" en sheets). |
| Botón atrás | `ProjectStepLayout` | Círculo 48, borde `border`, flecha `primary`. |
| Input | `ui.input`, `AuthField` | Alto 54–56, pill, fondo blanco, borde `border`, ícono opcional a la izquierda en `muted`. Error: borde y texto `error`. |
| Textarea | `ui.textArea` | Alto ≥ 120, radio 24, fondo blanco, contador "0 / 150" a la derecha del label. |
| Label requerido | `ui.label` + `ui.required` | Asterisco naranja. |
| Radio | Etapa del proyecto | Pill de 54 con un círculo de 20 pt a la izquierda; seleccionado: punto interior `primary`, borde y texto `primary`, fondo `soft`. |
| Chip | `ui.chip` | Pill, ver §1.3. Con "×" para quitar (roles agregados) y "+N" para overflow. |
| Barra de pasos | `ProjectStepLayout` | "PASO N DE 5" (`overline`, `muted`) + "X% Completado" a la derecha, barra de alto 6. |
| Indicador de etapa | Detalle del proyecto | 5 puntos conectados; los alcanzados rellenos `primary`, el resto en contorno. |
| Segmented control | Explorar | Contenedor lavanda, segmento activo blanco con texto `primary`. |
| Card de proyecto (grid) | Explorar | 2 columnas; cabecera `cardHeader` con ícono; chips tag + etapa; nombre `headline-sm`; "👤 N Integrantes" y "💬 N". |
| Card de proyecto (lista) | Home | Ícono a la izquierda, título de 1 línea con ellipsis, creador en `muted`, 2 chips, contador de miembros a la derecha. |
| Card de sección | Detalle, Revisar | Fondo `card`, borde `border`, radio 20–24, ícono en cuadrado `soft`, título + texto. En Revisar: divisor vertical y lápiz de editar a la derecha. |
| Stat card | Perfil | Dos cards lado a lado con fondo `soft`: ícono + número 24/800 + label ("Creados", "Participando"). |
| Info row | Perfil | Card con 3 columnas separadas por divisores: rol, carrera/departamento, semestre/año. |
| Comentario | Comentarios | Avatar + nombre 700 + tiempo relativo a la derecha + texto + "↳ Responder". La respuesta va indentada, con línea vertical `primary` a la izquierda y fondo `soft`. Badge "👑 Creador". |
| Miembro de equipo | Equipo | Avatar 48, nombre, badge "Creador", "Rol:" + chip, email y WhatsApp con íconos. Divisores entre filas. |
| Solicitud | Solicitudes | Card con avatar, nombre, tiempo, "Ver perfil →", chips de habilidades y mensaje entre comillas. |
| Pila de avatares | Detalle | Círculos solapados con iniciales + "+N". |
| Bottom sheet | `AddRolesSheet`, Nuevo/Responder comentario | Radio superior 32, título `headline-md` + "×" en círculo, contenido, botón primario a todo el ancho (o a la derecha con ícono de enviar), "Cancelar" como link. |
| Modal centrado | `ProjectStepLayout`, `IconPickerModal` | Radio 32, ilustración arriba, título centrado, texto `muted`, botón primario + contorno apilados. |
| Pantalla de éxito | Proyecto creado, Solicitud enviada, Miembro unido | Círculo `primary` de 120 con ✓ blanco, título `display`, texto `muted`, CTA primario + link o contorno. |
| Tab bar | `src/navigation/AppTabsNavigator.tsx` + copia `src/navigation/AppTabBar.tsx` | Fondo blanco sólido, borde superior `border`. 5 tabs (Inicio, Explorar, Crear, Mis Proyectos, Mi Perfil), ícono 24 + label 12/700, activo `primary`, inactivo `muted`, sin pill de fondo. "Crear" abre el flujo, no es un tab. |
| Hero | Home | Card `primary`, radio 32, overline blanco + titular blanco 24/800. |
| Header de detalle | Detalle, Comentarios, Equipo | Atrás a la izquierda, logo K al centro, "Inicio" (casa) a la derecha; botones circulares. |

---

## 6. Mapa de pantallas (Figma → código)

Todas en `src/features/*/presentation/screens/`.

| Figma | Pantalla en código |
|---|---|
| `HOME.png` | `projects/HomeFeedScreen` |
| `Explorar Proyectos.png`, `Explorar Personas y KOra TAG.png` | `projects/ExploreScreen` |
| `Crear un proyecto.png` | `projects/CreateProjectIntroScreen` |
| `CReaciondeproyecto/EtapaProyectoPaso1` | `projects/ProjectStageScreen` (paso 1/5) |
| `CReaciondeproyecto/InformacionBasicaPASO2`, `masiconospopup` | `projects/ProjectBasicInfoScreen` + `IconPickerModal` |
| `CReaciondeproyecto/ProblemasPASO3` | `projects/ProjectProblemScreen` |
| `CReaciondeproyecto/ObjeticoYAlcancePASO4` | `projects/ProjectGoalScreen` |
| `CReaciondeproyecto/EquipoPASO5`, `agregarROL` | `projects/ProjectTeamScreen` + `AddRolesSheet` |
| `CReaciondeproyecto/Revisarproyecto` | `projects/ProjectReviewScreen` |
| `CReaciondeproyecto/pROYECTOcreado` | `projects/ProjectCreatedScreen` |
| `CReaciondeproyecto/ABANDONAR creacion POP UP` | Modal dentro de `ProjectStepLayout` |
| `*/DetalledelProyecto`, `objetivoyrecursos…`, `detalledelproyecto`, `objetivodelproyecto` | `projects/ProjectDetailScreen` (vista de dueño vs. ajeno) |
| `*/comentarios`, `respondercomentarios`, `comentarnuevocomentarios` | `projects/CommentsScreen` |
| `*/equipodelproyecto` | `projects/TeamMembersScreen` |
| `solicituddeunirsealproyecto` (lista) | `projects/RequestsScreen` |
| `Feed como participante/miperfil` (Aceptar/Rechazar) | `projects/ApplicantProfileScreen` |
| `personahasidoaceptadaparaunirse` | `projects/MemberJoinedScreen` |
| `feedcomopersonaajena/solicitarunirse` | `projects/JoinRequestScreen` |
| `feedcomopersonaajena/solicitudenviada` | `projects/RequestSentScreen` |
| `comousuarioinvitado`, `comousuarioqueomitio` | `auth/AccountRequiredScreen` (sin cuenta / perfil incompleto) |
| `miperfil-invitado` | `auth/GuestProfileScreen` |
| PDF p. 28–30 (*Conozcamos tu formación / perfil docente / trayectoria*) | `auth/OnboardingRoleDetailsScreen` (paso 3/6) + `RoleDetailsFields`, también en `EditProfileScreen`; columnas en `docs/roble/perfil_y_guardados.sql` |
| PDF p. 21 (*Conecta ideas, crea impacto · Cargando…*) | `shared/ui/SplashScreen` (mientras carga la fuente y se restaura la sesión) |
| PDF p. 16–18 (error de login) | `shared/ui/ErrorCard` en `auth/LoginScreen` |
| PDF p. 35–38 (*Proyectos*: Mis proyectos · Participando · Guardados · Solicitudes) | `projects/MyProjectsScreen`; guardar con el marcador del detalle (tabla `guardado`) |
| PDF p. 43–47 (KORA TAG) | `koratag/KoraTagScanScreen` (escaneo simulado) → `KoraTagProfileScreen` → `KoraTagSelectProjectScreen` → `KoraTagJoinedScreen` |
| `construyamostuperfil.png` | `auth/OnboardingIntroScreen` (tras el nombre; "Hacerlo más tarde" guarda y va al Home) |
| `medios de contacti.png` | `auth/OnboardingContactScreen` (paso 5/5) + `ContactFields`, también en `EditProfileScreen` |
| `miperfil-estudiante`, `-docente`, `-egresado` | `auth/MyProfileScreen` + `ProfileView` (fila con rol + 2 columnas según el rol) |
| `Editar proyecto/editarinformacion…`, `editarproyectorecursos`, `salirsinguardar` | `projects/EditProjectScreen` (solo integrantes; "Eliminar" solo el creador) |
| `notificaciones-sinnotificaciones` | `projects/components/NotificationBell` (panel lateral; tipos en `notificationTypes.ts`) |
| `koranode/KORANODE-sincronizarproyecto` | `koranode/KoraNodeScreen` sin aparato vinculado (código `KORA-XXXX`; el aparato se simula y confirma solo) |
| `koranode/KORANODE-sincronizacionexitosa` | `koranode/KoraNodeSyncedScreen` |
| `koranode/KORANODE-SIncronizado`, `KORANODE-Iniciarreunion` | `koranode/KoraNodeScreen` con aparato (panel). Las dos vistas de Figma se fusionaron: tenían los mismos pasos y botón |
| `koranode/KORANODE-Reunionencurso` | `koranode/MeetingInProgressScreen` (cronómetro, pausa, confirmación al salir) |
| `koranode/KORANODE-Reunionfinalizada` | `koranode/MeetingNoteScreen` con `justFinished`; desde el historial es el detalle de la nota |
| — (no existe en Figma) | `koranode/EditMeetingScreen`: editar título, objetivo, acuerdos y próximos pasos |
| `koranode/KORANODE-HIstorialdereuniones` | `koranode/MeetingHistoryScreen` (búsqueda + filtros Todas / Con pendientes / Este mes) |

### Variantes de perfil por rol

| Rol | Sección | Columnas de la info row |
|---|---|---|
| Estudiante | Información académica | Estudiante · Carrera · Semestre |
| Docente | Información profesional | Docente · Departamento · Asignaturas |
| Egresado | Información profesional | Egresado · Carrera · Año de egreso |

Siempre siguen: Habilidades (chips), Contacto (WhatsApp + email) e Información adicional.

---

## 7. Patrones de flujo

- **Wizard de creación (5 pasos):** header fijo con atrás + título, barra de progreso, contenido con scroll y footer fijo con "Atrás" (contorno) + "Siguiente" (primario, deshabilitado hasta completar los requeridos). El atrás del header abre el popup "¿Abandonar…?". Desde "Revisar proyecto", el lápiz vuelve al paso y "Siguiente" regresa a Revisar.
- **Invitado / perfil incompleto:** cualquier acción que requiere cuenta (Crear, Solicitar unirme) lleva a una pantalla con ilustración, CTA principal y "Volver al proyecto".
- **Dueño vs. ajeno en el detalle:** el dueño ve "Ver solicitudes", "KORA NODE" y "Editar proyecto"; un integrante aceptado ve "KORA NODE" y "Editar proyecto"; el ajeno ve guardar (bookmark) + "Solicitar unirme".
- **KORA NODE:** un aparato por proyecto. Cualquier integrante lo vincula, inicia reuniones y edita las notas. Cada reunión termina en una nota (resumen de IA simulado) compartida con todo el equipo; los próximos pasos se marcan como hechos desde la nota y se avisa al equipo al guardar una reunión.
- **Confirmaciones:** pantalla completa de éxito (no toast).

---

## 8. Diferencias pendientes entre Figma y código

Resuelto: degradado de botones primarios (`ButtonGradient`), Plus Jakarta Sans, `soft`/`orange`/`orangeSoft` y demás tokens de §1.1, morado suelto `#A04BFF` de los eyebrows (ahora `primary`), tema de Paper ámbar, plantilla de productos y `SettingsScreen` borradas.

1. **Copy de Figma con errores** (el código ya los tiene corregidos): "Objetico" (nombre de archivo), "¿En que puedes aportar?" → "¿En qué…?", "Cuentale" → "Cuéntale", "te gustaria" → "gustaría", "Escribe aqui" → "aquí", "Datos y analisis" → "análisis", "solictud" → "solicitud", "Tu proyecto () ha sido publicado" (falta el nombre).
2. **Colores sueltos que no son token** (decorativos, sin equivalente en §1.1): rojos de error `#B42318`, blobs de `ProjectDetailScreen`, grises de `ForgotPasswordScreen`.

---

## 9. Qué se tomó de "Electric Connection" y qué no

**Se tomó** (coincide con las capturas): la fuente Plus Jakarta Sans, la escala tipográfica (ajustada a los tamaños medidos), el tracking negativo en títulos y positivo en overlines, la descripción de marca, las manchas de color en esquinas, las cards con borde lavanda, el radio de 20 pt y la base de 4 pt.

**Se descartó** (las capturas muestran otra cosa):

| Electric Connection | Figma |
|---|---|
| Primario `#370097` (tokens) / `#4F17C5` (texto) | `#3C00A0` sólido; degradado `#4E11BD → #5F22D9` |
| Naranja `#F97316` | `#FF6B00` |
| Texto `#1E1B4B` | `#1E1630` |
| Inputs con radio 12–16 y fondo `#FAF8FF` | Pill, fondo blanco |
| Chips con radio 8 y en MAYÚSCULAS | Pill, en minúscula normal |
| Chips de filtro solo con borde | Con relleno lavanda; activo en morado sólido |
| Margen lateral 20 px | 24 pt |
| Botón de 48 px | 52–57 pt |
| Sombra tintada en cards | Sin sombra visible |
| Tab bar translúcida con desenfoque y pill activo | Blanca sólida con borde superior, sin pill |
| Scrim `rgba(30,27,75,0.4)` con blur | ≈ `rgba(33,24,50,0.53)`, sin blur |
| Display 40 px | ≈ 32 pt |
