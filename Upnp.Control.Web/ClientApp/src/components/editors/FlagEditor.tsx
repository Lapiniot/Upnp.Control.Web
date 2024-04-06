import { ChangeEventHandler, InputHTMLAttributes, useCallback, useEffect, useId, useState } from "react";

export type FlagEditorProps<TContext> = InputHTMLAttributes<HTMLInputElement> & {
    callback: (value: boolean, context: TContext) => void | boolean,
    context: TContext,
    caption: string
}

export function FlagEditor<TContext>({ className, callback, context, caption, checked: checkedProp, ...other }: FlagEditorProps<TContext>) {
    const [checked, setChecked] = useState(checkedProp);
    const id = useId();

    const changedHandler = useCallback<ChangeEventHandler<HTMLInputElement>>(({ target: { checked } }) => {
        if (callback(checked, context) !== false)
            setChecked(checked);
    }, [callback, context]);

    useEffect(() => setChecked(checkedProp), [checkedProp]);

    return <div className={`form-check-reverse form-switch justify-content-between px-0${className ? ` ${className}` : ""}`}>
        <input role="switch" id={id} {...other} className="form-check-input m-0" type="checkbox" checked={checked} onChange={changedHandler} />
        <label htmlFor={id} className="form-check-label">{caption}</label>
    </div>;
}