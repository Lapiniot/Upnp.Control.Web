import { useMediaQuery } from "../hooks/MediaQuery";
import { MediaQueries } from "../services/MediaQueries";
import { ThemeContext } from "./ThemeContext";
import { HTMLAttributes, useCallback, useContext } from "react";

type ThemeSwitchProps = {
    mode?: "full" | "compact" | "icon" | "responsive"
}

const themes: [name: UI.Theme, icon: string][] = [["light", "light_mode"], ["dark", "dark_mode"], ["auto", "contrast"]];
const sequence: { [K in UI.Theme]: number } = { "light": 1, "dark": 2, "auto": 0 };

export function ThemeSwitch({ mode = "compact", className }: HTMLAttributes<HTMLDivElement> & ThemeSwitchProps) {
    const [current, setTheme] = useContext(ThemeContext);
    const mediumScreen = useMediaQuery(MediaQueries.mediumScreen, mode === "responsive");
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const toggleTheme = useCallback((event: React.MouseEvent<HTMLButtonElement>) => setTheme(event.currentTarget.dataset["themeToggle"] as UI.Theme), []);
    const next = themes[sequence[current]];
    const renderMode: typeof mode = mode === "responsive"
        ? mediumScreen ? "compact" : "icon"
        : mode;
    return <div className={`btn-group theme-switch${className ? ` ${className}` : ""}`}>
        {renderMode === "icon"
            ? <button data-theme-toggle={next[0]} title={`Switch to ${next[0]} theme.`} onClick={toggleTheme}
                className="btn btn-icon btn-outline">
                <svg><use href={`symbols.svg#${next[1]}`}></use></svg>
            </button>
            : themes.map(([name, icon]) =>
                <button data-theme-toggle={name} key={name} title={`Switch to ${name} theme.`} onClick={toggleTheme}
                    className={`btn btn-outline${current == name ? " active" : ""}${mode !== "full" ? " btn-icon" : ""}`}>
                    <svg><use href={`symbols.svg#${icon}`}></use></svg>
                    {mode === "full" && <span className="text-capitalize">{name}</span>}
                </button>)
        }
    </div>
}