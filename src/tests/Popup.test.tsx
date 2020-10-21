import React from "react";
import { render } from "@testing-library/react";

import Popup from "../popup/Popup";

describe("<Popup />", () => {
  test("should pass", async () => {
    const { getByText } = render(<Popup />);
    expect(getByText("Hello, world!")).toBeDefined();
  });
});
