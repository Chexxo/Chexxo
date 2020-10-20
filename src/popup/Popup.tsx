import React, { Component } from "react";
import { browser } from "webextension-polyfill-ts";
import Certificate from "../models/Certificate";

type PopupProps = {
  certificate: Certificate | null;
};

/**
 * Represents a popup window
 * @noInheritDoc
 */

export default class Popup extends Component<unknown, PopupProps> {
  constructor(props: PopupProps) {
    super(props);
    this.state = {
      certificate: null,
    };
  }

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

  async getCertificate(): Promise<Certificate> {
    return await browser.runtime.sendMessage({
      type: "getCertificate",
    });
  }

  /**
   * Renders the popup component
   * @returns the rendered popup component
   */
  render(): JSX.Element {
    return <div className="popup-container">{this.state.certificate}</div>;
  }
}
