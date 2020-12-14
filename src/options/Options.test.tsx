import React from "react";
import { render, unmountComponentAtNode } from "react-dom";

import { Options } from "./Options";
import { act } from "react-dom/test-utils";
import { Configuration } from "../types/Configuration";

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
  const sendMessage = jest.fn();
  sendMessage.mockResolvedValueOnce(
    new Configuration("http://example.com", true)
  );
  act(() => {
    render(<Options sendMessage={sendMessage} hasServer={true} />, container);
  });
  expect(container.textContent).toContain("Server");
});

test("renders component without server", () => {
  const sendMessage = jest.fn();
  sendMessage.mockResolvedValueOnce(
    new Configuration("http://example.com", true)
  );
  act(() => {
    render(<Options sendMessage={sendMessage} hasServer={false} />, container);
  });
  expect(container.textContent).not.toContain("Server");
});

test("renders message on configuration error", () => {
  const sendMessage = jest.fn();
  sendMessage.mockImplementation(() => {
    throw new Error();
  });
  act(() => {
    render(<Options sendMessage={sendMessage} hasServer={true} />, container);
  });
  expect(container.textContent).toContain(
    "Could not persist current configuration"
  );
});
