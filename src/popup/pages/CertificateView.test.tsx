import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";
import { MemoryRouter as Router } from "react-router-dom";

import { Certificate } from "../../types/certificate/Certificate";
import { Issuer } from "../../types/certificate/Issuer";
import { Subject } from "../../types/certificate/Subject";
import { CertificateView } from "./CertificateView";

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

test("renders component with certificate", () => {
  const certificate = new Certificate(
    "",
    "",
    new Issuer(
      "ca.example.com",
      "Example Organization",
      "Example OrganizationalUnit",
      "Example City",
      "Example State",
      "Example Country"
    ),
    "",
    new Subject(
      "example.com",
      "Example Organization",
      "Example OrganizationalUnit",
      "Example City",
      "Example State",
      "Example Country"
    ),
    ["www.example.com"],
    0,
    0,
    []
  );
  act(() => {
    renderWithRouter(<CertificateView certificate={certificate} />);
  });
  expect(container.textContent).toContain("example.com");
});

test("renders component without certificate", () => {
  act(() => {
    renderWithRouter(<CertificateView certificate={undefined} />);
  });
  expect(container.textContent).toContain("No certificate found");
});
