import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";
import { MemoryRouter as Router } from "react-router-dom";

import { PageHeader } from "./PageHeader";

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

test("renders component with title", () => {
  act(() => {
    renderWithRouter(<PageHeader title="title" hasHomeButton={false} />);
  });
  expect(container.textContent).toBe("title");
});

test("renders component with homeButton, when prop is supplied", () => {
  act(() => {
    renderWithRouter(<PageHeader title="title" hasHomeButton={true} />);
  });
  expect(container.querySelector("button")).toBeDefined();
});

test("doesn't render component with homeButton, when prop is not supplied", () => {
  act(() => {
    renderWithRouter(<PageHeader title="title" hasHomeButton={false} />);
  });
  expect(container.querySelector("button")).toBeNull();
});
