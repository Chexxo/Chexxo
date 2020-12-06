import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";
import { MemoryRouter as Router } from "react-router-dom";

import { Certificate } from "../../types/certificate/Certificate";
import { Issuer } from "../../types/certificate/Issuer";
import { Subject } from "../../types/certificate/Subject";
import { ErrorMessage } from "../../types/errors/ErrorMessage";
import { Quality } from "../../types/Quality";
import { Home } from "./Home";

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

test("renders component without any information", () => {
  act(() => {
    renderWithRouter(
      <Home
        certificate={undefined}
        quality={undefined}
        errorMessage={undefined}
        openOptionsPage={jest.fn()}
      />
    );
  });
  expect(container.textContent).toContain(
    "Please load a page to evaluate certificate quality"
  );
});

test("renders component with certificate and quality", () => {
  const certificate = new Certificate(
    "",
    "",
    new Issuer("", "", "", "", "", ""),
    "",
    new Subject("example.com", "", "", "", "", ""),
    [],
    0,
    0,
    []
  );
  act(() => {
    renderWithRouter(
      <Home
        certificate={certificate}
        quality={Quality.DomainValidated}
        errorMessage={undefined}
        openOptionsPage={jest.fn()}
      />
    );
  });
  expect(container.textContent).toMatch(/example.com.*Domain Validated/);
});

test("renders component with errorMessage", () => {
  act(() => {
    renderWithRouter(
      <Home
        certificate={undefined}
        quality={undefined}
        errorMessage={new ErrorMessage("error message")}
        openOptionsPage={jest.fn()}
      />
    );
  });
  expect(container.textContent).toContain("error message");
});
