import { ChangeEventHandler, InputHTMLAttributes, useCallback, useEffect, useState } from "react";

export type FlagEditorProps<TContext> = InputHTMLAttributes<HTMLInputElement> & {
    callback: (value: boolean, context: TContext) => void | boolean,
    context: TContext
}

export function FlagEditor<TContext>({ className, callback, context, checked: checkedProp, ...other }: FlagEditorProps<TContext>) {
    const [checked, setChecked] = useState(checkedProp);

    const changedHandler = useCallback<ChangeEventHandler<HTMLInputElement>>(({ target: { checked } }) => {
        if (callback(checked, context) !== false)
            setChecked(checked);
    }, [callback, context]);

    useEffect(() => setChecked(checkedProp), [checkedProp]);

    return <div className={`form-check form-switch px-0${className ? ` ${className}` : ""}`}>
        <input role="switch" {...other} className="form-check-input m-0" type="checkbox" checked={checked} onChange={changedHandler} />
    </div>;
}