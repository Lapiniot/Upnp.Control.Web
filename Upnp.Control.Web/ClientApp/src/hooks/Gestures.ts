import React, { RefObject, useEffect, useMemo, useRef } from "react";
import { HoldDelay, PressHoldGestureRecognizer as Recognizer } from "../services/gestures/PressHoldGestureRecognizer";
import { SlideGestureRecognizer, SlideParams } from "../services/gestures/SlideGestureRecognizer";

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

export function useSlideGesture<T extends HTMLElement>(targetRef: RefObject<T>, handler: (element: T, gesture: "slide", params: SlideParams) => void) {
    const recognizer = useMemo(() => new SlideGestureRecognizer(handler), [handler]);
    useEffect(() => {
        if (targetRef.current) {
            recognizer.bind(targetRef.current);
            return () => recognizer.unbind();
        }
    }, [recognizer, targetRef]);
}