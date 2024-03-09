import { DetailsHTMLAttributes, useCallback, useRef, MouseEvent, ReactNode } from "react";
import { animate } from "../services/Extensions";

type SpoilerProps = DetailsHTMLAttributes<HTMLDetailsElement> & {
    caption: ReactNode,
    disabled?: boolean,
    context?: unknown,
    renderCaption?(caption: ReactNode, context: unknown): ReactNode
}

export default ({ caption, children, className, disabled, context, renderCaption, ...other }: SpoilerProps) => {
    const ref = useRef<HTMLDetailsElement>(null);
    const handler = useCallback(async (event: MouseEvent<HTMLElement>) => {
        event.preventDefault();

        const details = ref.current!;
        const summary = details.firstChild as HTMLElement;
        const content = summary.nextSibling as HTMLElement;

        if (details.open) {
            await animate(details, animationsComplete, "sp-collapsing");
            details.toggleAttribute("open");
            void content.offsetWidth; // force reflow to reset animation state
        } else {
            details.toggleAttribute("open");
            await animate(details, animationsComplete, "sp-expanding");
        }

        async function animationsComplete() {
            // Wait for all pending animations for any element in the summary + all animations
            // for content grid warapper (no subtree included for perf.reasons).
            const promises = summary.getAnimations({ subtree: true })
                .concat(content.getAnimations()).map(a => a.finished);
            await Promise.allSettled(promises);
        }
    }, []);

    return <details ref={ref} className={`spoiler${className ? ` ${className}` : ""}`}
        {...other} inert={disabled ? "" : undefined}>
        <summary onClick={handler}>
            <div>{typeof renderCaption === "function" ? renderCaption(caption, context) : caption}</div>
        </summary>
        <div>
            {/* Do not remove this wrapper div! It wraps children content and has to have overflow: hidden set.
            It makes the trick together with parent div with display: grid and dynamic content 
            row height animatable from 0fr to 1fr. */}
            <div>
                {children}
            </div>
        </div>
    </details>
}