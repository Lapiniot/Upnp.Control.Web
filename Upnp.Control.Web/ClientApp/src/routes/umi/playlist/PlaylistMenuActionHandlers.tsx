import { UIEventHandler } from "react";

export interface PlaylistMenuActionHandlers {
    addItems: UIEventHandler<HTMLElement>;
    addUrl: UIEventHandler<HTMLElement>;
    addFiles: UIEventHandler<HTMLElement>;
    deleteItems: UIEventHandler<HTMLElement>;
    rename: UIEventHandler<HTMLElement>;
    delete: UIEventHandler<HTMLElement>;
    copy: UIEventHandler<HTMLElement>;
    showInfo: UIEventHandler<HTMLElement>;
}