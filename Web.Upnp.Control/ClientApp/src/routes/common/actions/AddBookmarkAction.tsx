import React from "react";
import { deviceBookmarks as bookmarks } from "../../../components/BookmarkService";
import { getFallbackIcon, getOptimalIcon } from "../DeviceIcon";
import { DeviceActionProps } from "./Actions";


export class AddBookmarkAction extends React.Component<DeviceActionProps, { bookmarked: boolean; }> {
    state = { bookmarked: false };

    private clickHandler = async () => {
        const { device: { udn: device, name, description, icons, type }, category = "upnp" } = this.props;

        const bookmarked = await bookmarks.contains([category, device]);

        if (bookmarked) {
            await bookmarks.remove([category, device]);
        }
        else {
            await bookmarks.add("DeviceBookmarkWidget", {
                device, category, name, description,
                icon: getOptimalIcon(icons)?.url ?? getFallbackIcon(type)
            });
        }

        this.setState({ bookmarked: !bookmarked });
    };

    async componentDidMount() {
        this.setState({ bookmarked: await bookmarks.contains([this.props.category as string, this.props.device.udn]) })
    }

    render() {
        const { device, category = "upnp", className, ...other } = this.props;
        const title = this.state.bookmarked
            ? "Remove bookmark from the Home section"
            : "Add bookmark to the Home section";
        return <button type="button" className={`btn btn-round btn-plain${className ? ` ${className}` : ""}`}
            title={title} onClick={this.clickHandler} {...other}>
            <svg className="icon"><use href={this.state.bookmarked ? "#star-solid" : "#star"} /></svg>
        </button>;
    }
}