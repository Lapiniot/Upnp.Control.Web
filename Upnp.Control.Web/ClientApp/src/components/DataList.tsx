import React, { ElementType, HTMLAttributes, MouseEventHandler, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PressHoldGestureRecognizer } from "./gestures/PressHoldGestureRecognizer";

export type DeleteRowHandler = (index: number, key?: string, tag?: string | number | object) => void;

type DataListProps = HTMLAttributes<HTMLDivElement> & {
    tag?: string | number | object;
    editable?: boolean;
    template?: ElementType;
    onDelete?: DeleteRowHandler;
};

export function DataList({ children, className, editable, template, tag, onDelete, ...other }: DataListProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [editMode, setEditMode] = useState(false);
    const gestureHandler = useCallback(() => setEditMode(prev => !prev), []);
    const deleteHandler = useCallback<MouseEventHandler<HTMLButtonElement>>(
        ({ currentTarget: { dataset: { index, key } } }) =>
            onDelete?.(parseInt(index ?? ""), key, tag), [onDelete, tag]);
    const recognizer = useMemo(() => new PressHoldGestureRecognizer<HTMLDivElement>(gestureHandler), []);
    useEffect(() => {
        recognizer.unbind();
        if (editable)
            recognizer.bind(ref.current as HTMLDivElement);
        else if (editMode)
            setEditMode(false);
        return () => recognizer.unbind();
    }, [editable]);

    const Container = template as ElementType ?? "div";

    return <div {...other} className={`d-grid grid-auto-m15 p-3${className ? ` ${className}` : ""}`} ref={ref}>
        {React.Children.map(children, (child, index) =>
            <Container className="d-flex align-items-center gap-0 border rounded-1 shadow-sm overflow-hidden">
                {child}
                {editMode && <button type="button" className="btn btn-round btn-plain ms-auto mx-2" onClick={deleteHandler}
                    data-index={index} data-key={(child && typeof child === "object" && "key" in child) ? child.key : undefined}>
                    <svg><use href="sprites.svg#trash" /></svg>
                </button>}
            </Container>)}
    </div>;
}

DataList.defaultProps = {
    template: "div",
    editable: true
} as DataListProps;