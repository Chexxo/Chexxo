import * as React from "react";
import * as ReactDOM from "react-dom";
import "semantic-ui-css/semantic.css";
import { browser } from "webextension-polyfill-ts";

import "../popup/Popup.scss";
import { Popup } from "../popup/Popup";

const {
  tabs: { query },
  runtime: { sendMessage },
} = browser;

ReactDOM.render(
  <Popup getTabs={query} sendMessage={sendMessage} />,
  document.getElementById("popup")
);
