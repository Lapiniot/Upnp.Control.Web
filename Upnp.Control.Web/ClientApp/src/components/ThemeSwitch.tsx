import { ThemeContext } from "./ThemeContext";
import { HTMLAttributes, useCallback, useContext } from "react";

type ThemeSwitchProps = {
    mode?: "full" | "compact" | "icon" | "responsive"
}

const themes: [name: UI.Theme, icon: string][] = [["light", "light_mode"], ["dark", "dark_mode"], ["auto", "contrast"]];
const sequence: { [K in UI.Theme]: number } = { "light": 1, "dark": 2, "auto": 0 };

export function ThemeSwitch({ mode = "compact", className }: HTMLAttributes<HTMLDivElement> & ThemeSwitchProps) {
    const [current, setTheme] = useContext(ThemeContext);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const toggleTheme = useCallback((event: React.MouseEvent<HTMLButtonElement>) => setTheme(event.currentTarget.dataset["themeToggle"] as UI.Theme), []);
    const next = themes[sequence[current]];
    return <div className={`${mode === "responsive" ? "theme-switch-responsive" : ""}${className ? ` ${className}` : ""}`}>
        {(mode === "icon" || mode === "responsive") &&
            <button data-theme-toggle={next[0]} title={`Switch to ${next[0]} theme.`} onClick={toggleTheme}
                className="btn btn-icon btn-outline">
                <svg><use href={`symbols.svg#${next[1]}`}></use></svg>
            </button>}
        {mode !== "icon" && <div className="btn-group w-100">{themes.map(([name, icon]) =>
            <button data-theme-toggle={name} key={name} title={`Switch to ${name} theme.`} onClick={toggleTheme}
                className={`btn btn-outline${current == name ? " active" : ""}${mode === "compact" ? " btn-icon" : ""}`}>
                <svg><use href={`symbols.svg#${icon}`}></use></svg>
                {(mode === "full" || mode === "responsive") && <span className="text-capitalize">{name}</span>}
            </button>)}
        </div>}
    </div>
}