import { MediaQueries, useMediaQuery } from "../../hooks/MediaQuery";
import { Browser } from "./Browser";
import { useContentBrowser } from "./BrowserUtils";

export default function ContentBrowser() {
    const { params: { device, ...navParams }, ...other } = useContentBrowser(undefined, { id: "0" });
    const largeScreen = useMediaQuery(MediaQueries.largeScreen);
    const touchScreen = useMediaQuery(MediaQueries.touchDevice);
    return <Browser {...other} {...navParams} device={device as string}
        displayMode={largeScreen ? "table" : "list"}
        navigationMode={touchScreen ? "tap" : "dbl-click"} />
}