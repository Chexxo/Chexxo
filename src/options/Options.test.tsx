import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";

import { Configuration } from "../types/Configuration";
import { Options } from "./Options";

let container: HTMLDivElement;

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  unmountComponentAtNode(container);
  container.remove();
});

test("renders component with server", () => {
  const sendMessage = jest.fn(() => {
    return new Promise<Configuration>((resolve) => {
      resolve(new Configuration("https://localhost:3000", true));
    });
  });

  act(() => {
    render(<Options sendMessage={sendMessage} hasServer={true} />, container);
  });
  expect(container.textContent).toContain("Server");
});

test("renders component without server", () => {
  const sendMessage = jest.fn(() => {
    return new Promise<Configuration>((resolve) => {
      resolve(new Configuration("https://localhost:3000", true));
    });
  });

  act(() => {
    render(<Options sendMessage={sendMessage} hasServer={false} />, container);
  });
  expect(container.textContent).not.toContain("Server");
});

test("handles thrown error on sendMessage", () => {
  // TODO: implement unit test
  expect(1).toBe(1);
});
