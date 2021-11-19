import { SelectHTMLAttributes, useCallback, useEffect, useState } from "react";

type OptionsEditor = SelectHTMLAttributes<HTMLSelectElement> & {
    options: any[];
    callback(value: string): void | boolean
};

export function OptionsEditor({ className, options, value: valueProp, callback, ...other }: OptionsEditor) {
    const [value, setValue] = useState(valueProp);

    const changedHandler = useCallback(({ target: { value } }) => {
        if (callback(value) !== false) setValue(value);
    }, [callback]);

    useEffect(() => setValue(valueProp), [valueProp]);

    return <select className={`form-select form-select-sm${className ? ` ${className}` : ""}`}
        aria-label="Items per page" {...other} value={value} onChange={changedHandler}>
        {options.map(s => <option key={s} value={s}>{s}</option>)}
    </select>;
}