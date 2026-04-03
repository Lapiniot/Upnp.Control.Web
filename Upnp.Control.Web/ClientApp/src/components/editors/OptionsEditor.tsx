import { type ChangeEventHandler, type SelectHTMLAttributes, useCallback, useState } from "react";

type OptionsEditor = SelectHTMLAttributes<HTMLSelectElement> & {
    options: (string | number | undefined)[];
    callback(value: string): void | boolean
};

export function OptionsEditor({ className, options, value: initialState, callback, ...other }: OptionsEditor) {
    const [value, setValue] = useState(initialState);

    const changedHandler = useCallback<ChangeEventHandler<HTMLSelectElement>>(({ target: { value } }) => {
        if (callback(value) !== false)
            setValue(value);
    }, [callback]);

    return <select className={`form-select form-select-sm${className ? ` ${className}` : ""}`}
        aria-label="Items per page" {...other} value={value} onChange={changedHandler}>
        {options.map(s => <option key={s} value={s}>{s}</option>)}
    </select>
}