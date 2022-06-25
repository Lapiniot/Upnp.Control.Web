import Vinyl from "vinyl";
import { Document, Element, Node } from "libxmljs2";
import { Transform, TransformCallback } from "stream";

export interface SvgMergeOptions {
    path?: string;
    pathSeparator?: string;
    generateId?: (name: string, file?: any) => string;
    formatting?: { omitXmlDeclaration?: boolean; pretty?: boolean; collapseEmpty?: boolean }
}

const defaults: SvgMergeOptions = {
    path: "result.svg",
    generateId: (name: string) => name,
    pathSeparator: "--",
    formatting: {
        omitXmlDeclaration: false,
        pretty: false,
        collapseEmpty: true
    }
}

export default abstract class SvgMergeTransform<TOptions extends SvgMergeOptions> extends Transform {
    protected doc: Document;
    protected options: TOptions;

    constructor(options: TOptions) {
        super({ readableObjectMode: true, readableHighWaterMark: 16, writableObjectMode: true, writableHighWaterMark: 16 });
        this.options = { ...defaults, ...options };
        this.options.formatting = { ...defaults.formatting, ...(options.formatting ?? {}) };
        this.doc = new Document();
        this.doc.node("svg").defineNamespace("http://www.w3.org/2000/svg");
    }

    override _transform(chunk: any, _encoding: BufferEncoding, callback: TransformCallback): void {
        if (!(chunk instanceof Vinyl)) { callback(null, chunk); };

        const file = chunk as Vinyl;

        if (file.isNull()) {
            callback(null, file);
        } else if (file.isBuffer()) {
            this.append(file, this.doc);
            callback();
        } else if (file.isStream()) {
            this.emit("error", new Error("Streams are not supported."));
        }
    }

    override _flush(callback: TransformCallback): void {
        const { path, formatting: { omitXmlDeclaration, collapseEmpty, pretty } = {} } = this.options;
        const output = new Vinyl({
            path,
            contents: Buffer.from((this.doc as any).toString({
                format: !!pretty,
                declaration: !omitXmlDeclaration,
                selfCloseEmpty: !!collapseEmpty,
                type: "xml",
                encoding: "UTF-8"
            }))
        });
        this.push(output);
        callback();
    }

    protected id(file: Vinyl): string {
        const { generateId = n => n, pathSeparator: separator = "--" } = this.options;
        const path = file.relative;
        const ext = file.extname;
        return generateId(path.substring(0, path.length - ext.length), file)
            .replaceAll("/", separator)
            .replaceAll("\\", separator)
            .replaceAll(" ", "_");
    }

    protected copyContent(src: Element, dst: Element, filter?: (node: Node) => boolean) {
        const nodes = src.childNodes();
        for (let index = 0; index < nodes.length; index++) {
            const node = nodes[index];

            if (node instanceof Element) {
                const element = node as Element;

                if (filter?.(element) === false)
                    continue;

                const copy = dst.node(element.name());
                const attrs = element.attrs();

                for (let index = 0; index < attrs.length; index++) {
                    const attr = attrs[index];

                    if (filter?.(attr) === false)
                        continue;

                    copy.attr(attr.name(), attr.value());
                }

                this.copyContent(element, copy);
            }
        }
    }

    protected abstract append(file: Vinyl, doc: Document): void;
}
