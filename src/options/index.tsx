import * as React from "react";
import * as ReactDOM from "react-dom";

import "./Options.scss";
import Options from "./Options";
import { browser } from "webextension-polyfill-ts";
import Configurator from "./Configurator";

const configurator = new Configurator(browser.storage);
configurator.init();

ReactDOM.render(
  <Options configurator={configurator} />,
  document.getElementById("options")
);
