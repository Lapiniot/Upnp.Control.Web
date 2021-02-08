import React from "react";
import { Bookmarks } from "../../../components/BookmarkService";
import { getFallbackIcon, getOptimalIcon } from "../DeviceIcon";
import { DeviceActionProps } from "./Actions";


export class AddBookmarkAction extends React.Component<DeviceActionProps, { bookmarked?: boolean; }> {

    private clickHandler = () => {
        const { device: { udn: device, name, description, icons, type }, category } = this.props;
        const key = this.getKey();
        const bookmarked = Bookmarks.contains(key);
        if (bookmarked)
            Bookmarks.remove(key);

        else
            Bookmarks.add(key, "DeviceBookmarkWidget", {
                device, category, name, description,
                icon: getOptimalIcon(icons)?.url ?? getFallbackIcon(type)
            });
        this.setState({ bookmarked });
    };

    private getKey() {
        const { device: { udn: device }, category } = this.props;
        return `dev.bookmark.${category}.${device}`;
    }

    render() {
        const { device, category, className, ...other } = this.props;
        const bookmarked = Bookmarks.contains(this.getKey());
        const title = bookmarked
            ? "Remove bookmark from the Home section"
            : "Add bookmark to the Home section";
        return <button type="button" className={`btn btn-round btn-plain${className ? ` ${className}` : ""}`}
            title={title} onClick={this.clickHandler} {...other}>
            <svg className="icon"><use href={bookmarked ? "#star-solid" : "#star"} /></svg>
        </button>;
    }
}