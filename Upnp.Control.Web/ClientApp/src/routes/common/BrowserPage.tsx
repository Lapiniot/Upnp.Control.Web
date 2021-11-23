import { Browser } from "./Browser";
import { withBrowserDataFetchNavigation } from "./BrowserUtils";

const BrowserPage = withBrowserDataFetchNavigation(Browser, false);

export default BrowserPage;