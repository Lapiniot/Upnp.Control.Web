import { PropsWithChildren, createContext, useLayoutEffect, useMemo, useState } from "react";
import { MediaQueries } from "../hooks/MediaQuery";

type ThemeContextValue = [UI.Theme, (theme: UI.Theme) => void];

export interface ThemeStorage {
    get theme(): UI.Theme;
    set theme(theme: UI.Theme);
}

export const ThemeContext = createContext<ThemeContextValue>(["auto", () => { }]);

export function ThemeProvider({ children, storage }: PropsWithChildren & { storage: ThemeStorage }) {
    const [theme, toggle] = useState<UI.Theme>(() => storage.theme);
    const value = useMemo<ThemeContextValue>(() => [theme, toggle], [theme]);
    useLayoutEffect(() => {
        storage.theme = theme;
        if (theme === "auto") {
            const query = MediaQueries.prefersDarkScheme;
            setColorMode(query.matches ? "dark" : "light");
            query.addEventListener("change", mediaQueryChangeListener);
            return () => query.removeEventListener("change", mediaQueryChangeListener);
        };

        setColorMode(theme);
    }, [theme, storage]);

    return <ThemeContext.Provider value={value}>
        {children}
    </ThemeContext.Provider>
}

function setColorMode(theme: Exclude<UI.Theme, "auto">) {
    document.documentElement.dataset["bsTheme"] = theme;
}

function mediaQueryChangeListener(event: MediaQueryListEvent) {
    setColorMode(event.matches ? "dark" : "light");
}