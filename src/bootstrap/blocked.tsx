import * as React from "react";
import * as ReactDOM from "react-dom";
import "semantic-ui-css/semantic.css";
import { browser } from "webextension-polyfill-ts";

import "../blocked/Blocked.scss";
import { Blocked } from "../blocked/Blocked";

ReactDOM.render(
  <Blocked sendMessage={browser.runtime.sendMessage} />,
  document.getElementById("blocked")
);
