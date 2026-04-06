import { type PropsWithChildren, createContext, useLayoutEffect, useMemo, useSyncExternalStore } from "react";
import { MediaQueries } from "../hooks/MediaQuery";

type ThemeContextValue = [UI.Theme, (theme: UI.Theme) => void];

export interface ThemeStorage {
    get(): UI.Theme;
    set(theme: UI.Theme): void;
}

export const ThemeContext = createContext<ThemeContextValue>(["auto", () => { }]);

export function ThemeProvider({ children, storage }: PropsWithChildren & { storage: ThemeStorage & ExternalStore<UI.Theme> }) {
    const theme = useSyncExternalStore(storage.subscribe, storage.getSnapshot);
    const value = useMemo<ThemeContextValue>(() => [theme, storage.set], [theme, storage.set]);

    useLayoutEffect(() => {
        if (theme === "auto") {
            const query = MediaQueries.prefersDarkScheme;
            setColorMode(query.matches ? "dark" : "light");
            query.addEventListener("change", mediaQueryChangeListener);
            return () => query.removeEventListener("change", mediaQueryChangeListener);
        }

        setColorMode(theme);
    }, [theme]);

    return <ThemeContext value={value}>{children}</ThemeContext>
}

function setColorMode(theme: Exclude<UI.Theme, "auto">) {
    document.documentElement.dataset["bsTheme"] = theme;
}

function mediaQueryChangeListener(event: MediaQueryListEvent) {
    setColorMode(event.matches ? "dark" : "light");
}