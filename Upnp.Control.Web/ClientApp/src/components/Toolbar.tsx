import { type ButtonHTMLAttributes, type HTMLAttributes, type MouseEvent, useCallback, useState } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { icon?: string; visible?: boolean }

function Button({ className, icon, children, visible, ...other }: ButtonProps) {
    return <button type="button" className={`btn${className ? ` ${className}` : ""}${visible === false ? " d-none" : ""}`} {...other}>
        {icon && <svg><use href={icon} /></svg>}{children}
    </button>
}

function ToggleButton({ active: initialState = false, onClick, className, ...props }: ButtonProps & { active?: boolean }) {
    const [state, setState] = useState(initialState);
    const onClickHandler = useCallback((event: MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (!event.defaultPrevented)
            setState(state => !state);
    }, [onClick]);

    return <Toolbar.Button className={`${className}${state ? `${className ? " " : ""}active` : ""}`}
        onClick={onClickHandler} value={state.toString()} {...props} />
}

function Group({ className, children, visible, ...other }: HTMLAttributes<HTMLDivElement> & { visible?: boolean }) {
    return <div className={`d-inline-flex align-items-center${className ? ` ${className}` : ""} ${visible === false ? " d-none" : ""}`} role="group" {...other}>
        {children}
    </div>
}

const Toolbar = Object.assign(
    function ({ className, children, ...other }: HTMLAttributes<HTMLDivElement>) {
        return <div className={`toolbar${className ? ` ${className}` : ""}`} role="toolbar" {...other}>
            {children}
        </div>;
    },
    {
        Button,
        ToggleButton,
        Group
    });

export default Toolbar;