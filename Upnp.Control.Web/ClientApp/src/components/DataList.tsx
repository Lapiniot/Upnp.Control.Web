import React, { ElementType, HTMLAttributes, MouseEventHandler, useCallback, useEffect, useRef } from "react";
import { PressHoldGestureRecognizer } from "../services/gestures/PressHoldGestureRecognizer";

type DataListProps<T> = HTMLAttributes<HTMLDivElement> & {
    context?: T;
    editable?: boolean;
    editMode?: boolean;
    template?: ElementType;
    onToggleModeRequested?: (context?: T) => void;
    onDeleteRequested?: (index: number, key?: string, context?: T) => void;
}

export function DataList<T extends string | number | object>({
    children, className, editable = false, editMode, template: Container = "div", context,
    onToggleModeRequested, onDeleteRequested, ...other }: DataListProps<T>) {

    const ref = useRef<HTMLDivElement>(null);
    const deleteHandler = useCallback<MouseEventHandler<HTMLButtonElement>>(
        ({ currentTarget: { dataset: { index, key } } }) =>
            onDeleteRequested?.(parseInt(index ?? ""), key, context), [onDeleteRequested, context]);

    useEffect(() => {
        if (ref.current && editable) {
            const recognizer = new PressHoldGestureRecognizer(() => onToggleModeRequested?.(context));
            recognizer.bind(ref.current);
            return () => {
                return recognizer.unbind();
            };
        }
    }, [context, editable, onToggleModeRequested]);

    return <div role="list" {...other} className={`d-grid grid-list flex-1 g-3 p-3${className ? ` ${className}` : ""}`} ref={ref}>
        {React.Children.map(children, (child, index) =>
            <Container role="listitem" className="d-flex align-items-center">
                {child}
                {editMode && <button type="button" className="btn btn-icon ms-auto mx-2" onClick={deleteHandler}
                    data-index={index} data-key={(child && typeof child === "object" && "key" in child) ? child.key : undefined}>
                    <svg><use href="symbols.svg#delete_forever" /></svg>
                </button>}
            </Container>)}
    </div>
}