import { Browser } from "./Browser";
import { useContentBrowser } from "./BrowserUtils";

export default function ContentBrowser() {
    const { params: { device, ...navParams }, ...other } = useContentBrowser();
    return <Browser {...other} {...navParams} device={device as string} />
}