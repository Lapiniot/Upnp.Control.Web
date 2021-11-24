import { Browser } from "./Browser";
import { useContentBrowser } from "./BrowserUtils";
import { BrowserRouterNavigationContextProvider } from "./Navigator";

function ContentBrowser() {
    const { params: { device, ...navParams }, ...other } = useContentBrowser();
    return <Browser {...other} {...navParams} device={device as string} />
}

export default function () {
    return <BrowserRouterNavigationContextProvider>
        <ContentBrowser />
    </BrowserRouterNavigationContextProvider>
}