/** The bottom tabs, shared by the tab navigator and the copy shown on screens stacked over it. */
export const APP_TABS = [
  { name: "Home", label: "Inicio", icon: "home" },
  { name: "Explore", label: "Explorar", icon: "compass" },
  { name: "Create", label: "Crear", icon: "plus-circle" },
  { name: "MyProjects", label: "Mis Proyectos", icon: "bookmark" },
  { name: "Profile", label: "Mi Perfil", icon: "user" },
] as const;

export type AppTabName = (typeof APP_TABS)[number]["name"];

/** "Crear" never shows a tab: it opens the create-project flow, or asks guests for an account. */
export const openCreate = (navigation: any, isLoggedIn: boolean) =>
  navigation.navigate(isLoggedIn ? "CreateProject" : "AccountRequired");
