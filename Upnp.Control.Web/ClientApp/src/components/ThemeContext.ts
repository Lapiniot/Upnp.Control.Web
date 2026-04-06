import { createContext } from "react";

type ThemeContextValue = [UI.Theme, (theme: UI.Theme) => void]

export const ThemeContext = createContext<ThemeContextValue>(["auto", () => { }])