# React Native with Expo, React Navigation, and TypeScript with a clean architecture

This is a starter project for building React Native apps with [Expo](https://expo.dev/), [React Navigation](https://reactnavigation.org/), and [TypeScript](https://www.typescriptlang.org/) using a clean architecture.

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Create a `.env` file in the root directory and add your Roble project ID

   ```
   EXPO_PUBLIC_ROBLE_PROJECT_ID=your_project_id_here
   ```

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
