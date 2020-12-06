import { deepMock, MockzillaDeep } from "mockzilla";
import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";
import { Browser } from "webextension-polyfill-ts";

import { Popup } from "./Popup";

let browser: Browser;
let mockBrowser: MockzillaDeep<Browser>;
let container: HTMLDivElement;

beforeEach(() => {
  [browser, mockBrowser] = deepMock<Browser>("browser", false);
  mockBrowser.runtime.sendMessage.expect(expect.anything());
  mockBrowser.runtime.openOptionsPage.mockAllowMethod();
  mockBrowser.tabs.query.expect(expect.anything()).andResolve([
    {
      id: 1,
      index: 0,
      highlighted: true,
      active: true,
      pinned: false,
      incognito: false,
    },
  ]);

  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  unmountComponentAtNode(container);
  container.remove();
});

test("renders component", () => {
  act(() => {
    render(
      <Popup
        sendMessage={browser.runtime.sendMessage}
        getTabs={browser.tabs.query}
        openOptionsPage={browser.runtime.openOptionsPage}
      />,
      container
    );
  });
  expect(container.hasChildNodes).toBeTruthy();
});

test("queries tabId on mount", () => {
  act(() => {
    render(
      <Popup
        sendMessage={browser.runtime.sendMessage}
        getTabs={browser.tabs.query}
        openOptionsPage={browser.runtime.openOptionsPage}
      />,
      container
    );
  });
  expect(mockBrowser.tabs.query.getMockCalls().length).toBeGreaterThan(0);
});

test("queries tabData on mount", () => {
  // TODO: implement test
  expect(1).toBe(1);
});
