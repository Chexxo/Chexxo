import * as React from "react";
import * as ReactDOM from "react-dom";

import "../../options/Options.scss";
import { Options } from "../../options/Options";
import { browser } from "webextension-polyfill-ts";

/**
 * The options page for the firefox version of the extension.
 */
ReactDOM.render(
  <Options sendMessage={browser.runtime.sendMessage} hasServer={false} />,
  document.getElementById("options")
);
