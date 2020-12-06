import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";
import { MemoryRouter as Router } from "react-router-dom";

import { Navigation } from "./Navigation";

let container: HTMLDivElement;
const renderWithRouter = (node: JSX.Element) =>
  render(<Router>{node}</Router>, container);

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  unmountComponentAtNode(container);
  container.remove();
});

test("renders component with openOptionsPage", () => {
  act(() => {
    renderWithRouter(<Navigation openOptionsPage={jest.fn()} />);
  });
  expect(container.hasChildNodes).toBeTruthy();
});

test("opens options page on button click", async () => {
  const openOptionsPage = jest.fn();
  await act(async () => {
    renderWithRouter(<Navigation openOptionsPage={openOptionsPage} />);
    const button = container.getElementsByClassName("item")[1];
    button.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await null; // prevents Popper update() to be called outside of act, causing warnings
  });
  expect(openOptionsPage).toHaveBeenCalled();
});
