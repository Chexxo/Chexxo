import * as React from "react";
import * as ReactDOM from "react-dom";

import "../../options/Options.scss";
import Options from "../../options/Options";
import { browser } from "webextension-polyfill-ts";

ReactDOM.render(
  <Options sendMessage={browser.runtime.sendMessage} hasServer={true} />,
  document.getElementById("options")
);
