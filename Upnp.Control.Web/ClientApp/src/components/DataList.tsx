import React, { ElementType, HTMLAttributes, MouseEventHandler, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PressHoldGestureRecognizer } from "../services/gestures/PressHoldGestureRecognizer";
import Toolbar from "./Toolbar";

export type DeleteRowHandler = (index: number, key?: string, tag?: string | number | object) => void;

type DataListProps = HTMLAttributes<HTMLDivElement> & {
    tag?: string | number | object;
    editable?: boolean;
    template?: ElementType;
    onDelete?: DeleteRowHandler;
    onDeleteAll?: (tag?: string | number | object) => void;
};

export function DataList({ children, className, editable, template, tag, onDelete, onDeleteAll, ...other }: DataListProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [editMode, setEditMode] = useState(false);
    const toggleHandler = useCallback(() => setEditMode(prev => !prev), []);
    const deleteHandler = useCallback<MouseEventHandler<HTMLButtonElement>>(
        ({ currentTarget: { dataset: { index, key } } }) =>
            onDelete?.(parseInt(index ?? ""), key, tag), [onDelete, tag]);
    const deleteAllHandler = useCallback(() => onDeleteAll?.(tag), [onDeleteAll, tag]);
    const recognizer = useMemo(() => new PressHoldGestureRecognizer<HTMLDivElement>(toggleHandler), []);
    useEffect(() => {
        recognizer.unbind();
        if (editable)
            recognizer.bind(ref.current as HTMLDivElement);
        else if (editMode)
            setEditMode(false);
        return () => recognizer.unbind();
    }, [editable]);

    const Container: ElementType = template ?? "div";

    return <div className="d-flex flex-nowrap align-items-center">
        <div role="list" {...other} className={`d-grid grid-auto-m15 flex-fill g-3 p-3${className ? ` ${className}` : ""}`} ref={ref}>
            {React.Children.map(children, (child, index) =>
                <Container role="listitem" className="d-flex align-items-center g-0 border rounded-1 shadow-sm overflow-hidden">
                    {child}
                    {editMode && <button type="button" className="btn btn-round btn-plain ms-auto mx-2" onClick={deleteHandler}
                        data-index={index} data-key={(child && typeof child === "object" && "key" in child) ? child.key : undefined}>
                        <svg><use href="symbols.svg#delete_forever" /></svg>
                    </button>}
                </Container>)}
        </div>
        {editMode && onDeleteAll &&
            <Toolbar.Button className="btn-danger btn-round btn-flat m-3 btn-sm-fab btn-fab-small btn-fab-start"
                glyph="symbols.svg#delete_forever" onClick={deleteAllHandler}
                title="Delete all bookmarks" />}
        {editable &&
            <Toolbar.Button className="btn-secondary btn-round btn-flat m-3 ms-0 btn-sm-fab"
                glyph={editMode ? "symbols.svg#edit_off" : "symbols.svg#edit"} onClick={toggleHandler}
                title="Toggle edit list mode" />}
    </div>;
}

DataList.defaultProps = {
    template: "div",
    editable: false
} as DataListProps;