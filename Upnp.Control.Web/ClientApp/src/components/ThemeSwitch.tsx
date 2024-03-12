import { useMediaQuery } from "../hooks/MediaQuery";
import { MediaQueries } from "../services/MediaQueries";
import { ThemeContext } from "./ThemeContext";
import { HTMLAttributes, useCallback, useContext } from "react";

type ThemeSwitchProps = {
    mode?: "full" | "compact" | "icon" | "responsive",
    btnClassName?: string;
}

const themes: [name: UI.Theme, icon: string][] = [["light", "light_mode"], ["dark", "dark_mode"], ["auto", "contrast"]];
const sequence: { [K in UI.Theme]: number } = { "light": 1, "dark": 2, "auto": 0 };

export function ThemeSwitch({ mode = "compact", className, btnClassName }: HTMLAttributes<HTMLDivElement> & ThemeSwitchProps) {
    const [current, setTheme] = useContext(ThemeContext);
    const largeScreen = useMediaQuery(MediaQueries.largeScreen, mode === "responsive");
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const toggleTheme = useCallback((event: React.MouseEvent<HTMLButtonElement>) => setTheme(event.currentTarget.dataset["themeToggle"] as UI.Theme), []);
    const next = themes[sequence[current]];
    const renderMode: typeof mode = mode === "responsive"
        ? largeScreen ? "compact" : "icon"
        : mode;
    return <div className={`btn-group theme-switch${className ? ` ${className}` : ""}`}>
        {renderMode === "icon"
            ? <button data-theme-toggle={next[0]} title={`Switch to ${next[0]} theme.`} onClick={toggleTheme}
                className={`btn${btnClassName ? ` ${btnClassName}` : ""}`}>
                <svg><use href={`symbols.svg#${next[1]}`}></use></svg>
            </button>
            : themes.map(([name, icon]) =>
                <button data-theme-toggle={name} key={name} title={`Switch to ${name} theme.`} onClick={toggleTheme}
                    className={`btn${btnClassName ? ` ${btnClassName}` : ""}${current == name ? " active" : ""}`}>
                    <svg><use href={`symbols.svg#${icon}`}></use></svg>
                    {mode === "full" && <span className="text-capitalize ms-2">{name}</span>}
                </button>)
        }
    </div>
}