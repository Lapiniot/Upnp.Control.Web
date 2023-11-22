import { ChangeEventHandler, InputHTMLAttributes, useCallback, useEffect, useState } from "react";

export type FlagEditorProps = InputHTMLAttributes<HTMLInputElement> & {
    callback: (value: boolean, state: any) => void | boolean,
    state?: any
};

export function FlagEditor({ className, callback, state, checked: checkedProp, ...other }: FlagEditorProps) {
    const [checked, setChecked] = useState(checkedProp);

    const changedHandler = useCallback<ChangeEventHandler<HTMLInputElement>>(({ target: { checked } }) => {
        if (callback(checked, state) !== false)
            setChecked(checked);
    }, [callback, state]);

    useEffect(() => setChecked(checkedProp), [checkedProp]);

    return <div className={`form-check form-switch px-0${className ? ` ${className}` : ""}`}>
        <input {...other} className="form-check-input m-0" type="checkbox" checked={checked} onChange={changedHandler} />
    </div>;
}