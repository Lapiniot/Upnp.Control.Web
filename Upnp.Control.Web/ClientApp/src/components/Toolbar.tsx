import { ButtonHTMLAttributes, Component, HTMLAttributes, MouseEvent, useCallback, useEffect, useState } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { icon?: string; visible?: boolean }

export default class Toolbar extends Component<HTMLAttributes<HTMLDivElement>> {

    displayName = Toolbar.name;

    static Button = ({ className, icon, children, visible, ...other }: ButtonProps) =>
        <button type="button" className={`btn${className ? ` ${className}` : ""}${visible === false ? " d-none" : ""}`} {...other}>
            {icon && <svg><use href={icon} /></svg>}{children}
        </button>

    static ToggleButton = ({ active = false, onClick, className, ...props }: ButtonProps & { active?: boolean }) => {
        const [state, setState] = useState(active);
        useEffect(() => setState(active), [active]);

        const onClickHandler = useCallback((event: MouseEvent<HTMLButtonElement>) => {
            onClick?.(event);
            if (!event.defaultPrevented)
                setState(state => !state);
        }, [onClick]);

        return <Toolbar.Button className={`${className}${state ? `${className ? " " : ""}active` : ""}`}
            onClick={onClickHandler} value={state.toString()} {...props} />
    }

    static Group = ({ className, children, visible, ...other }: HTMLAttributes<HTMLDivElement> & { visible?: boolean }) =>
        <div className={`d-inline-flex align-items-center${className ? ` ${className}` : ""} ${visible === false ? " d-none" : ""}`} role="group" {...other}>
            {children}
        </div>

    render() {
        const { className, children, ...other } = this.props;
        return <div className={`toolbar${className ? ` ${className}` : ""}`} role="toolbar" {...other}>
            {children}
        </div>
    }
}