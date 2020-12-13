import * as React from "react";
import * as ReactDOM from "react-dom";
import { browser } from "webextension-polyfill-ts";

import "../popup/Popup.scss";
import { Popup } from "../popup/Popup";

/**
 * Represents the extensions popup.
 */
ReactDOM.render(
  <Popup
    getTabs={browser.tabs.query}
    sendMessage={browser.runtime.sendMessage}
    openOptionsPage={browser.runtime.openOptionsPage}
  />,
  document.getElementById("popup")
);
