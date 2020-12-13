import * as React from "react";
import * as ReactDOM from "react-dom";
import { browser } from "webextension-polyfill-ts";

import "../blocked/Blocked.scss";
import { Blocked } from "../blocked/Blocked";

/**
 * Represents the blocked page which is shown if the certificate
 * quality of a domain has decreased.
 */
ReactDOM.render(
  <Blocked sendMessage={browser.runtime.sendMessage} />,
  document.getElementById("blocked")
);
