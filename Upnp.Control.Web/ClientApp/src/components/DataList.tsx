import React, { ElementType, HTMLAttributes, MouseEventHandler, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PressHoldGestureRecognizer } from "../services/gestures/PressHoldGestureRecognizer";
import Toolbar from "./Toolbar";

type DataListProps<T> = HTMLAttributes<HTMLDivElement> & {
    context?: T;
    editable?: boolean;
    template?: ElementType;
    onDelete?: (index: number, key?: string, context?: T) => void;
    onDeleteAll?: (context?: T) => void;
}

export function DataList<T extends string | number | object>({ children, className, editable, template, context, onDelete, onDeleteAll, ...other }: DataListProps<T>) {
    const ref = useRef<HTMLDivElement>(null);
    const [editMode, setEditMode] = useState(false);
    const toggleHandler = useCallback(() => setEditMode(mode => !mode), []);
    const deleteHandler = useCallback<MouseEventHandler<HTMLButtonElement>>(
        ({ currentTarget: { dataset: { index, key } } }) =>
            onDelete?.(parseInt(index ?? ""), key, context), [onDelete, context]);
    const deleteAllHandler = useCallback(() => onDeleteAll?.(context), [onDeleteAll, context]);
    const recognizer = useMemo(() => new PressHoldGestureRecognizer<HTMLDivElement>(() => setEditMode(mode => !mode)), []);

    /* eslint-disable react-hooks/exhaustive-deps */
    useEffect(() => {
        recognizer.unbind();
        if (editable)
            recognizer.bind(ref.current as HTMLDivElement);
        else if (editMode)
            setEditMode(false);
        return () => recognizer.unbind();
    }, [editable, editMode]);

    const Container: ElementType = template ?? "div";

    return <div className="d-flex flex-nowrap align-items-center">
        <div role="list" {...other} className={`d-grid grid-list flex-1 g-3 p-3${className ? ` ${className}` : ""}`} ref={ref}>
            {React.Children.map(children, (child, index) =>
                <Container role="listitem" className="d-flex align-items-center">
                    {child}
                    {editMode && <button type="button" className="btn btn-icon ms-auto mx-2" onClick={deleteHandler}
                        data-index={index} data-key={(child && typeof child === "object" && "key" in child) ? child.key : undefined}>
                        <svg><use href="symbols.svg#delete_forever" /></svg>
                    </button>}
                </Container>)}
        </div>
        {editMode && onDeleteAll &&
            <Toolbar.Button className="btn btn-icon m-3 d-none d-md-block"
                glyph="symbols.svg#delete_forever" onClick={deleteAllHandler}
                title="Delete all bookmarks" />}
        {editable &&
            <Toolbar.Button className="btn btn-icon btn-outline m-3 ms-0 d-none d-md-block"
                glyph={editMode ? "symbols.svg#edit_off" : "symbols.svg#edit"} onClick={toggleHandler}
                title="Toggle edit list mode" />}
    </div>
}

DataList.defaultProps = {
    template: "div",
    editable: false
}