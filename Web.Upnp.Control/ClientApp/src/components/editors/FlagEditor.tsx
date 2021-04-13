import { InputHTMLAttributes, useCallback, useEffect, useState } from "react";

export type FlagEditorProps = InputHTMLAttributes<HTMLInputElement> & {
    callback: (value: boolean) => void | boolean | Promise<boolean>
};

export function FlagEditor({ className, callback, checked: checkedProp, disabled: disabledProp, ...other }: FlagEditorProps) {
    const [checked, setChecked] = useState(checkedProp);
    const [disabled, setDisabled] = useState(disabledProp);

    const changedHandler = useCallback(async ({ target: { checked } }) => {
        setDisabled(true);
        try {
            const value = callback(checked);
            if (typeof value === "boolean")
                setChecked(value);
            else if (value instanceof Promise)
                setChecked(await value);
            else
                setChecked(checked);
        }
        finally {
            setDisabled(disabledProp);
        }
    }, [callback]);

    useEffect(() => setChecked(checkedProp), [checkedProp]);
    useEffect(() => setDisabled(disabledProp), [disabledProp]);

    return <div className={`form-check form-switch px-0${className ? ` ${className}` : ""}`}>
        <input {...other} className="form-check-input m-0" type="checkbox" checked={checked} disabled={disabled} onChange={changedHandler} />
    </div>;
}