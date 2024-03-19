import React, { useEffect, useMemo, useRef } from "react";
import { HoldDelay, PressHoldGestureRecognizer as Recognizer } from "../services/gestures/PressHoldGestureRecognizer";

export function useRefWithPressHoldGesture<T extends HTMLElement>(handler: () => void, enable: boolean,
    delay: HoldDelay = "normal", tolerance: number = 5): React.RefObject<T> {
    const ref = useRef<T>(null);
    const recognizer = useMemo(() => new Recognizer<NonNullable<T>>(handler, delay, tolerance), [handler, delay, tolerance]);
    useEffect(() => {
        recognizer.unbind();
        if (ref.current && enable)
            recognizer.bind(ref.current);
        return () => recognizer.unbind();
    }, [recognizer, enable]);
    return ref;
}