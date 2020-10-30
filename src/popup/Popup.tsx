import React, { Component } from "react";
import { Tabs, Runtime } from "webextension-polyfill-ts";
import { Container } from "semantic-ui-react";

import Certificate from "../types/CommonTypes/certificate/Certificate";
import { Quality } from "../types/Quality";

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
  tabId: number | undefined;
  certificate: Certificate | undefined;
  certificateRepresentation: string;
  qualityRepresentation: string;
  errorMessageRepresentation: string;
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
      tabId: undefined,
      certificate: undefined,
      certificateRepresentation: "",
      qualityRepresentation: "",
      errorMessageRepresentation: "",
    };
  }

  /**
   * Fetches the certificate when the component is mounted
   */
  async componentDidMount(): Promise<void> {
    const tabId = await this.getCurrentTabId();
    this.setState({ tabId });
    const certificate = await this.getCertificate();
    const quality = await this.getQuality();
    const errorMessage = await this.getErrorMessage();
    const certificateRepresentation = JSON.stringify(certificate, null, 2);
    const qualityRepresentation = JSON.stringify(quality, null, 2);
    const errorMessageRepresentation = JSON.stringify(errorMessage, null, 2);
    this.setState({
      certificate,
      certificateRepresentation,
      qualityRepresentation,
      errorMessageRepresentation,
    });
  }

  /**
   * Fetches the current tab's certificate
   * @returns the current tab's certificate
   */
  async getCertificate(): Promise<Certificate | undefined> {
    const certificate = (await this.sendMessage({
      type: "getCertificate",
      params: { tabId: this.state.tabId },
    })) as Certificate;
    return certificate;
  }

  async getQuality(): Promise<Quality | undefined> {
    const quality = (await this.sendMessage({
      type: "getQuality",
      params: { tabId: this.state.tabId },
    })) as Quality;
    return quality;
  }

  async getErrorMessage(): Promise<string | undefined> {
    try {
      const error = (await this.sendMessage({
        type: "getErrorMessage",
        params: { tabId: this.state.tabId },
      })) as string;
      return error;
    } catch (e) {
      console.log("from Popup");
      console.log(e);
    }
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
        <pre>{this.state.qualityRepresentation || "No quality found"}</pre>
        <pre>{this.state.errorMessageRepresentation || "No error found"}</pre>
      </Container>
    );
  }
}
