import { deepMock, MockzillaDeep } from "mockzilla";
import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";
import { Browser } from "webextension-polyfill-ts";
import { TabData } from "../types/TabData";

import { Popup } from "./Popup";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let sendMessage: jest.Mock<any, any>;
let browser: Browser;
let mockBrowser: MockzillaDeep<Browser>;
let container: HTMLDivElement;

beforeEach(() => {
  sendMessage = jest.fn();
  [browser, mockBrowser] = deepMock<Browser>("browser", false);
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
        sendMessage={sendMessage}
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
        sendMessage={sendMessage}
        getTabs={browser.tabs.query}
        openOptionsPage={browser.runtime.openOptionsPage}
      />,
      container
    );
  });
  expect(mockBrowser.tabs.query.getMockCalls()).not.toEqual([]);
});

test("queries tabData on mount", async () => {
  sendMessage.mockResolvedValueOnce(
    new TabData(undefined, undefined, undefined)
  );
  await act(async () => {
    await render(
      <Popup
        sendMessage={sendMessage}
        getTabs={browser.tabs.query}
        openOptionsPage={browser.runtime.openOptionsPage}
      />,
      container
    );
  });
  expect(sendMessage).toHaveBeenCalled();
});
