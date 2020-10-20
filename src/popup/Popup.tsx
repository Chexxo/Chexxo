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
    this.fetchCertificate();
  }

  fetchCertificate(): void {
    browser.runtime.sendMessage({
      type: "fetchCertificate",
    });
  }

  /**
   * Renders the popup component
   * @returns the rendered popup component
   */
  render(): JSX.Element {
    return <div className="popup-container">Hello, world!</div>;
  }
}
