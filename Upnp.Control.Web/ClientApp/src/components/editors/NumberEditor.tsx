import { ChangeEventHandler, InputHTMLAttributes, useCallback, useState } from "react";

type NumberEditorProps = InputHTMLAttributes<HTMLInputElement> & {
    callback: (value: number) => void | boolean;
};

export function NumberEditor({ className, callback, value: valueProp, ...other }: NumberEditorProps) {
    const [value, setValue] = useState(valueProp);
    const changedHandler = useCallback<ChangeEventHandler<HTMLInputElement>>(
        ({ target: { value } }) => {
            if (callback(parseInt(value)) !== false) setValue(value);
        }, [callback]);
    return <input {...other} type="number" value={value} onChange={changedHandler}
        className={`form-control${className ? ` ${className}` : ""}`} />;
}