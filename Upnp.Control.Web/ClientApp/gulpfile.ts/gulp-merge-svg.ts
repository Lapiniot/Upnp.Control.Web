import { Element, Node } from "libxmljs2";
import SvgStackMergeTransform, { SvgStackMergeOptions } from "./SvgTransforms/SvgStackMergeTransform";
import SvgSymbolsMergeTransform, { SvgSymbolsMergeOptions } from "./SvgTransforms/SvgSymbolsMergeTransform";

type SvgTransformOptions =
    (({ mode: "symbols" } & Omit<SvgSymbolsMergeOptions, "optimizations">) |
        ({ mode: "stack" } & Omit<SvgStackMergeOptions, "optimizations">)) &
    { optimizations?: (SvgOptiomizations | ((svg: Element) => void))[] };

export default function (options: SvgTransformOptions = { mode: "symbols" }) {
    const { mode, optimizations = [], ...other } = options;
    const callbacks = optimizations.map(value => typeof (value) === "function" ? value : optimizers[value]);
    switch (mode) {
        case "symbols":
            return new SvgSymbolsMergeTransform({ ...other, optimizations: callbacks });
        case "stack":
            return new SvgStackMergeTransform({ ...other, optimizations: callbacks });
        default:
            throw new Error("Unsupported transform mode.");
    }
}

const optimizers = {
    promoteGroupChildren: (svg: Element) => forEachContainer(svg, removeRedundandGroup, 5),
    removeInvisible: (svg: Element) => forEachContainer(svg, removeInvisible, 1)
}

type SvgOptiomizations = keyof typeof optimizers;

function forEachContainer(svg: Element, fix: (cntr: Element) => boolean, maxPasses: number) {
    const children = svg.childNodes();
    for (let i = 0; i < children.length; i++) {
        const node = children[i];

        if (node.type() !== "element") {
            continue;
        }

        const cntr = node as Element;
        let pass = 0;
        while (fix(cntr) && pass++ < maxPasses);
    }
}

function removeInvisible(cntr: Element) {
    let changes = false;
    const stack = [cntr];

    while (stack.length > 0) {
        const current = stack.shift()!;
        if (current.attr("fill")?.value() === "none") {
            current.remove();
            changes = true;
        } else {
            const children = current.childNodes();
            for (let i = 0; i < children.length; i++) {
                const node = children[i];
                if (node.type() === "element") {
                    stack.push(node as Element);
                }
            }
        }
    }

    return changes;
}

function removeRedundandGroup(cntr: Element) {
    const children = cntr.childNodes();
    const promoted: Node[] = [];

    for (let i = 0; i < children.length; i++) {
        const node = children[i];
        if (node.type() !== "element") {
            continue;
        }

        const e = node as Element;
        if (e.name() === "g" && e.attrs().length === 0) {
            promoted.push(...e.childNodes());
            e.remove();
        }
    }

    for (let i = 0; i < promoted.length; i++) {
        cntr.addChild(promoted[i]);
    }

    return promoted.length > 0;
}