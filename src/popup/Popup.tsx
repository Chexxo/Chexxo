import React, { Component } from "react";
import { browser } from "webextension-polyfill-ts";
import { Container } from "semantic-ui-react";

import Certificate from "../models/Certificate";

/**
 * Represent the required props for the Popup component
 */
interface PopupProps {
  certificate: Certificate | null;
  certificateRepresentation: string;
}

/**
 * Represents a popup window
 * @noInheritDoc
 */
export default class Popup extends Component<unknown, PopupProps> {
  /**
   * Initializes the component's default state
   * @param props the required props for the component
   */
  constructor(props: PopupProps) {
    super(props);
    this.state = {
      certificate: null,
      certificateRepresentation: "",
    };
  }

  /**
   * Fetches the certificate when the component is mounted
   */
  async componentDidMount(): Promise<void> {
    const certificate = await this.getCertificate();
    const certificateRepresentation = JSON.stringify(certificate, null, 2);
    this.setState({
      certificate,
      certificateRepresentation,
    });
  }

  /**
   * Fetches the current tab's certificate
   * @returns the current tab's certificate
   */
  async getCertificate(): Promise<Certificate> {
    const tabId = await this.getCurrentTabId();
    return await browser.runtime.sendMessage({
      type: "getCertificate",
      params: { tabId },
    });
  }

  /**
   * Returns the current tab's id
   * @returns the current tab's id
   */
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
      <Container text>
        <pre>
          {this.state.certificateRepresentation || "No certificate found"}
        </pre>
      </Container>
    );
  }
}
