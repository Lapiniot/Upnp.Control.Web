import { createPopper, Instance, OptionsGeneric, StrictModifiers } from "@popperjs/core/lib/popper";

export abstract class PopupPlacementStrategy {
    public abstract update(popup: HTMLElement, anchor: HTMLElement, options?: Partial<OptionsGeneric<StrictModifiers>>): Promise<void>;
    public abstract destroy(): void;
    protected abstract get popup(): HTMLElement;

    public async toggle(visible: boolean): Promise<void> {
        const popup = this.popup;
        popup.classList.add("showing");
        if (visible) {
            popup.classList.add("show");
            popup.offsetHeight;
            await this.visibilityChanged(true);
            popup.classList.remove("showing");
            await this.animationsFinished(popup);
        } else {
            await this.animationsFinished(popup);
            popup.classList.remove("show", "showing");
            await this.visibilityChanged(false);
        }
    }

    protected animationsFinished(element: HTMLElement) {
        return Promise.allSettled(element.getAnimations().map(a => a.finished));
    }

    protected visibilityChanged(_visible: boolean): Promise<void> | void { }
}

export class PopperStrategy extends PopupPlacementStrategy {
    instance: Instance | null = null;

    protected get popup(): HTMLElement {
        const popper = this.instance?.state.elements.popper;
        if (!popper) throw new Error("Popper instance is not initialized properly.");
        return popper;
    }

    override async update(popup: HTMLElement, anchor: HTMLElement, options: Partial<OptionsGeneric<StrictModifiers>>): Promise<void> {
        if (this.instance?.state.elements.popper !== popup || this.instance.state.elements.reference !== anchor) {
            this.instance?.destroy();
            this.instance = createPopper<StrictModifiers>(anchor, popup, options);
        } else {
            await this.instance.setOptions(options);
        }
    }

    protected override async visibilityChanged(visible: boolean) {
        await this.instance?.setOptions((options) => ({
            ...options,
            modifiers: [...options.modifiers!.filter(m => m.name !== "eventListeners"), { name: "eventListeners", enabled: visible }]
        }));
    }

    override destroy(): void {
        this.instance?.destroy();
    }
}