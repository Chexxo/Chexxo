import React from "react";
import { render } from "@testing-library/react";

import { Popup } from "./Popup";
import { Tabs } from "webextension-polyfill-ts";

function getTabs(): Promise<Tabs.Tab[]> {
  return new Promise((resolve) => {
    resolve();
  });
}

function sendMessage(): Promise<unknown> {
  return new Promise((resolve) => {
    resolve();
  });
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
function openOptionsPage(): Promise<void> {
  return new Promise((resolve) => {
    resolve();
  });
}

describe("<Popup />", () => {
  test("should render correctly", async () => {
    const { getByText } = render(
      <Popup
        getTabs={getTabs}
        sendMessage={sendMessage}
        openOptionsPage={openOptionsPage}
      />
    );
    expect(getByText("Chexxo")).toBeDefined();
  });
});
