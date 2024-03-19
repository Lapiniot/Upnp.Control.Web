import React, { useEffect, useMemo, useRef } from "react";
import { PressHoldGestureRecognizer } from "../services/gestures/PressHoldGestureRecognizer";

export function usePressHoldGesture<T extends HTMLElement>(elementRef: React.RefObject<T>, handler: () => void, enable: boolean): void {
    const recognizer = useMemo(() => new PressHoldGestureRecognizer<NonNullable<T>>(handler), [handler]);
    useEffect(() => {
        recognizer.unbind();

        if (elementRef.current && enable) {
            recognizer.bind(elementRef.current);
        }

        return () => {
            recognizer.unbind();
        };
    }, [recognizer, elementRef, enable]);
}

export function useRefWithPressHoldGesture<T extends HTMLElement>(handler: () => void, enable: boolean): React.RefObject<T> {
    const ref = useRef<T>(null);
    const recognizer = useMemo(() => new PressHoldGestureRecognizer<NonNullable<T>>(handler), [handler]);
    useEffect(() => {
        recognizer.unbind();

        if (ref.current && enable) {
            recognizer.bind(ref.current);
        }

        return () => {
            recognizer.unbind();
        };
    }, [recognizer, enable]);

    return ref;
}