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
  async componentDidMount(): Promise<void> {
    const certificate = await this.getCertificate();
    this.setState({ certificate });
  }

  async getCertificate(): Promise<Certificate> {
    const tabId = await this.getCurrentTabId();
    return await browser.runtime.sendMessage({
      type: "getCertificate",
      params: { tabId },
    });
  }

  async getCurrentTabId(): Promise<number | undefined> {
    const tabs = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });
    const currentTab = tabs[0];
    return currentTab.id;
  }

  /**
   * Renders the popup component
   * @returns the rendered popup component
   */
  render(): JSX.Element {
    return (
      <div className="popup-container">
        {this.state.certificate?.subjectAltName}
      </div>
    );
  }
}
