import * as React from "react";
import * as ReactDOM from "react-dom";
import "semantic-ui-css/semantic.css";

import "./Options.scss";
import Options from "./Options";
import { browser } from "webextension-polyfill-ts";

ReactDOM.render(
  <Options sendMessage={browser.runtime.sendMessage} />,
  document.getElementById("options")
);
