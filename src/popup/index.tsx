import * as React from "react";
import * as ReactDOM from "react-dom";
import "semantic-ui-css/semantic.css";

import "./Popup.scss";
import { Popup } from "./Popup";
import { browser } from "webextension-polyfill-ts";

const {
  tabs: { query },
  runtime: { openOptionsPage, sendMessage },
} = browser;

ReactDOM.render(
  <Popup
    getTabs={query}
    openOptionsPage={openOptionsPage}
    sendMessage={sendMessage}
  />,
  document.getElementById("popup")
);
