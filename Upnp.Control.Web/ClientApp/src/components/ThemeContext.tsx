import { PropsWithChildren, createContext, useLayoutEffect, useMemo, useState } from "react";
import { MediaQueries } from "../hooks/MediaQuery";
import settings from "../routes/common/Settings";

type ThemeContextValue = [UI.Theme, (theme: UI.Theme) => void];

export const ThemeContext = createContext<ThemeContextValue>(["auto", () => { }]);

export function ThemeProvider({ children }: PropsWithChildren) {
    const [theme, toggle] = useState<UI.Theme>(() => settings.get("theme"));
    const value = useMemo<ThemeContextValue>(() => [theme, toggle], [theme]);
    useLayoutEffect(() => {
        settings.set("theme", theme);
        if (theme === "auto") {
            const query = MediaQueries.prefersDarkScheme;
            setColorMode(query.matches ? "dark" : "light");
            query.addEventListener("change", mediaQueryChangeListener);
            return () => query.removeEventListener("change", mediaQueryChangeListener);
        };

        setColorMode(theme);
    }, [theme]);

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