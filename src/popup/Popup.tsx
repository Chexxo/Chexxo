import React, { Component } from "react";

/**
 * Represents a popup window
 * @noInheritDoc
 */
export default class Popup extends Component {
  /**
   * Broadcasts a message when the component is mounted
   */
  componentDidMount(): void {
    browser.runtime.sendMessage({ data: "Hello from Popup!" });
  }

  /**
   * Renders the popup component
   * @returns the rendered popup component
   */
  render(): JSX.Element {
    return <div className="popup-container">Hello, world!</div>;
  }
}
