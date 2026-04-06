import { type ButtonHTMLAttributes } from "react";

type BookmarkButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    bookmarked?: boolean;
    icons?: [string, string];
}

const defaultIcons: [string, string] = ["symbols.svg#star_rate_fill1", "symbols.svg#star_rate"]

export function BookmarkButton({ className, children, bookmarked, icons = defaultIcons, ...other }: BookmarkButtonProps) {
    const title = bookmarked ? "Remove bookmark from the Home section" : "Add bookmark to the Home section";
    return <button type="button" className={`btn btn-icon${className ? ` ${className}` : ""}`}
        disabled={bookmarked === undefined} title={title} {...other}>
        {children || <svg><use href={icons[bookmarked === true ? 0 : 1]} /></svg>}
    </button>
}