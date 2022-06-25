import SvgMergeTransform, { SvgMergeOptions } from "./SvgMergeTransform";

export type SvgStackMergeOptions = SvgMergeOptions & {
    dimensions?: { w: number, h: number },

};

export default class SvgStackMergeTransform extends SvgMergeTransform<SvgStackMergeOptions> {
    constructor(options: SvgStackMergeOptions) {
        super({ path: "stack.svg", ...(options ?? {}) });
        const { dimensions: { w = 24, h = 24 } = {} } = this.options;
        this.doc.root()!.attr({ width: w.toString(), height: h.toString() });
        this.doc.root()!.node("style").cdata(":root>svg{display:none}:root>svg:target{display:block}");
    }

    get containerNodeName(): string {
        return "svg";
    }
}