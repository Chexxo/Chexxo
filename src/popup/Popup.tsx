import React, { Component } from "react";
import { Tabs, Runtime } from "webextension-polyfill-ts";
import { Container } from "semantic-ui-react";

import Certificate from "../types/CommonTypes/certificate/Certificate";

/**
 * Represents the required props for the Popup component
 */
interface Props {
  getTabs: (queryInfo: Tabs.QueryQueryInfoType) => Promise<Tabs.Tab[]>;
  sendMessage: (
    message: { type: string; params: unknown },
    options?: Runtime.SendMessageOptionsType | undefined
  ) => Promise<unknown>;
}

interface State {
  certificate: Certificate | null;
  certificateRepresentation: string;
}

/**
 * Represents a popup window
 * @noInheritDoc
 */
export default class Popup extends Component<Props, State> {
  private sendMessage;
  private getTabs;

  /**
   * Initializes the component's default state
   * @param props the required props for the component
   */
  constructor(props: Props) {
    super(props);
    this.sendMessage = props.sendMessage;
    this.getTabs = props.getTabs;
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
    const certificate = (await this.sendMessage({
      type: "getCertificate",
      params: { tabId }
    })) as Certificate;
    return certificate;
  }

  /**
   * Returns the current tab's id
   * @returns the current tab's id
   */
  async getCurrentTabId(): Promise<number | undefined> {
    const tabs = await this.getTabs({
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
