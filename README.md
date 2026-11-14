# KORA

KORA es una app móvil desarrollada en React Native con Expo para conectar estudiantes, docentes, egresados y equipos de proyecto dentro de la comunidad universitaria. La plataforma busca facilitar la creación de proyectos, la búsqueda de talento, la formación de equipos y la organización de trabajo colaborativo alrededor de ideas concretas con impacto.

## Video comparativo

Comparativa entre KORA y la versión anterior del proyecto:
https://youtu.be/z87WjU_A7q0

## ¿Qué es KORA?

KORA nace como una solución para ayudar a las personas a:

- crear proyectos y validarlos desde una idea inicial;
- encontrar colaboradores con perfiles y habilidades complementarias;
- explorar oportunidades de participación dentro de la comunidad;
- gestionar la organización del equipo y la comunicación del proyecto;
- conectar personas con intereses académicos, profesionales y de innovación.

La experiencia está pensada para ser cercana, clara y visual, con un estilo basado en una identidad de marca moderna, colaborativa y enérgica.

## Funcionalidades principales

- Registro y autenticación de usuarios
- Onboarding con perfil, habilidades y datos académicos/profesionales
- Creación de proyectos con flujo guiado por pasos
- Explorar proyectos y personas
- Solicitudes de participación y aprobación de miembros
- Detalle de proyecto, comentarios y equipo
- KORA NODE para reuniones y seguimiento del trabajo colaborativo
- KORA TAG para interacción y validación dentro del ecosistema
- Diseño visual consistente con sistema de diseño propio

## Stack tecnológico

- React Native
- Expo
- TypeScript
- React Navigation
- Async Storage
- React Native Paper
- Expo Vector Icons
- React Native SVG
- Expo Camera / QR / utilidades de flujo móvil

## Estructura del proyecto

```text
KORA-ReactNative/
├── README.md
├── DESIGN_SYSTEM.md
├── docs/
├── package.json
├── r_auth_flow_react_nav-main/
│   ├── package.json
│   ├── app.json
│   ├── src/
│   ├── assets/
│   └── ...
└── ...
```

La lógica principal de la aplicación se encuentra dentro de:

- `r_auth_flow_react_nav-main/src/features/` → módulos funcionales y pantallas
- `r_auth_flow_react_nav-main/src/navigation/` → navegación y tabs
- `r_auth_flow_react_nav-main/src/shared/` → componentes reutilizables, tokens y estilos
- `r_auth_flow_react_nav-main/src/theme/` → tema visual de la app

## Requisitos

- Node.js 18+
- npm o yarn
- Android Studio / Xcode para emulación nativa
- Expo Go o emulador compatible

## Instalación

1. Clona el repositorio:

```bash
git clone https://github.com/pzarante/KORA-ReactNative.git
cd KORA-ReactNative
```

2. Instala dependencias de la app:

```bash
cd r_auth_flow_react_nav-main
npm install
```

3. Inicia el proyecto:

```bash
npm start
```

## Scripts disponibles

Dentro de `r_auth_flow_react_nav-main` puedes ejecutar:

```bash
npm start
npm run android
npm run ios
npm run web
npm run lint
npm run test:ci
```

También existen scripts en la raíz para ejecutar la app principal desde el workspace:

```bash
npm start
npm run android
npm run ios
npm run web
```

## Diseño y sistema visual

El proyecto incluye una guía de diseño detallada en [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md), donde se documentan:

- tokens de color;
- tipografía;
- layout y espaciado;
- componentes reutilizables;
- pantallas y flujo de la experiencia.

Esto ayuda a mantener coherencia visual y a facilitar futuras iteraciones del producto.

## Objetivo del proyecto

KORA busca convertir la colaboración universitaria en una experiencia fluida, visualmente clara y orientada a la acción. Su enfoque está en conectar ideas con personas, reducir la fricción para formar equipos y apoyar la ejecución de proyectos con impacto real.

## Estado del proyecto

Este repositorio representa una versión funcional y visualmente estructurada de la app, con foco en experiencia de usuario, navegación y flujo de creación colaborativa.

## Créditos

Proyecto desarrollado como parte del trabajo final de pregrado / proyecto formativo en React Native.

## Enlaces útiles

- Comparativa KORA vs versión anterior: https://youtu.be/z87WjU_A7q0
- Guía de diseño: [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md)
