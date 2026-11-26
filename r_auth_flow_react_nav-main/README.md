# React Native with Expo, React Navigation, and TypeScript with a clean architecture

This is a starter project for building React Native apps with [Expo](https://expo.dev/), [React Navigation](https://reactnavigation.org/), and [TypeScript](https://www.typescriptlang.org/) using a clean architecture.

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Create a `.env` file in the root directory (copy `.env.sample`) and add your Roble project ID

   ```
   EXPO_PUBLIC_ROBLE_PROJECT_ID=your_project_id_here
   EXPO_PUBLIC_ROBLE_API_URL=https://roble-api.test-openlab.uninorte.edu.co
   EXPO_PUBLIC_ROBLE_SIGNUP_ENDPOINT=signup-direct
   ```

   - `EXPO_PUBLIC_ROBLE_API_URL`: the test server is the one that supports guest sessions.
   - `EXPO_PUBLIC_ROBLE_SIGNUP_ENDPOINT` picks how accounts are created:
     - `signup-direct` (default): practice mode. No e-mail is sent; the account is ready right away.
     - `signup`: real e-mails. Roble sends a verification code and the app shows the
       "Verifica tu correo" screen; the account works only after entering the code.

   Restart with `npx expo start -c` after changing `.env`.

3. Start the app

   ```bash
   npx expo start
   ```

   To preview the authentication and onboarding screens without connecting to
   Roble, add this variable to `.env`:

   ```
   EXPO_PUBLIC_AUTH_MODE=mock
   ```

   Remove it or set it to `remote` when you want to use the real Roble API.

4. Test with Jest

   ```bash
   npm test
   ```

## Dependencies

- [Expo](https://expo.dev/) - A framework and platform for universal React applications.
- [React Navigation](https://reactnavigation.org/) - Routing and navigation for your React Native
- [Async Storage](https://react-native-async-storage.github.io/async-storage/) - An asynchronous, unencrypted, persistent, key-value storage system for React Native.

## Functions

- User authentication (login, logout, register) with Roble
- Product management (create, update, delete) with Roble

## Datos demo (presentación)

`scripts/seed-demo-projects.mjs` crea 6 proyectos demo en la tabla `proyecto` de Roble y lista los proyectos de prueba ("prueba", "hola", ...). Por defecto es un dry run: no escribe nada.

```bash
KORA_SEED_EMAIL=... KORA_SEED_PASSWORD=... npm run seed:demo                              # ver qué haría
KORA_SEED_EMAIL=... KORA_SEED_PASSWORD=... npm run seed:demo -- --apply                   # insertar los demo
KORA_SEED_EMAIL=... KORA_SEED_PASSWORD=... npm run seed:demo -- --apply --archive-junk    # además archivar la basura
```

Es idempotente (omite los demo que ya existen por nombre). Roble solo deja archivar filas propias: los proyectos de prueba de otras cuentas salen como 403 y hay que archivarlos con la cuenta de su creador. Los datos demo están al inicio del script para editarlos.
