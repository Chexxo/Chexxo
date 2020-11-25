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

describe("<Popup />", () => {
  test("should render correctly", async () => {
    const { getByText } = render(
      <Popup getTabs={getTabs} sendMessage={sendMessage} />
    );
    expect(getByText("Chexxo")).toBeDefined();
  });
});
