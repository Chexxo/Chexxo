import * as React from "react";
import * as ReactDOM from "react-dom";

import "./Options.scss";
import Options from "./Options";
import { browser } from "webextension-polyfill-ts";

ReactDOM.render(
  <Options storage={browser.storage.local} />,
  document.getElementById("options")
);
