import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";
import { Blocked } from "./Blocked";

let container: HTMLDivElement;

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  unmountComponentAtNode(container);
  container.remove();
});

test("renders component", () => {
  act(() => {
    render(<Blocked sendMessage={jest.fn()} />, container);
  });
  expect(container.hasChildNodes).toBeTruthy();
});
