import React, { Component } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { Tabs, Runtime } from "webextension-polyfill-ts";

import Certificate from "../types/certificate/Certificate";
import ErrorMessage from "../types/errors/ErrorMessage";
import { Quality } from "../types/Quality";
import CertificateView from "./pages/CertificateView";
import Configuration from "./pages/Configuration";
import Domains from "./pages/Domains";
import Home from "./pages/Home";
import NewQuality from "./pages/NewQuality";

/**
 * Represents the required props for the Popup component
 */
interface Props {
  getTabs: (queryInfo: Tabs.QueryQueryInfoType) => Promise<Tabs.Tab[]>;
  openOptionsPage: () => Promise<void>;
  sendMessage: (
    message: { type: string; params?: unknown },
    options?: Runtime.SendMessageOptionsType | undefined
  ) => Promise<unknown>;
}

/**
 * Represents the state object for the Popup component
 */
interface State {
  tabId: number | undefined;
  certificate: Certificate | undefined;
  quality: Quality | undefined;
  errorMessage: ErrorMessage | undefined;
}

/**
 * Represents a browser action popup window
 * @noInheritDoc
 */
export default class Popup extends Component<Props, State> {
  private sendMessage;
  private getTabs;

  /**
   * Initializes the component's default state and registers browser API methods
   * @param props the required props for the component
   */
  constructor(props: Props) {
    super(props);
    this.sendMessage = props.sendMessage;
    this.getTabs = props.getTabs;
    this.state = {
      tabId: undefined,
      certificate: undefined,
      quality: undefined,
      errorMessage: undefined,
    };
  }

  /**
   * Fetches the certificate, its quality and any errors when the component is mounted
   */
  async componentDidMount(): Promise<void> {
    const tabId = await this.getCurrentTabId();
    this.setState({ tabId });

    const certificate = await this.getCertificate();
    const quality = await this.getQuality();
    const errorMessage = await this.getErrorMessage();
    this.setState({
      certificate,
      quality,
      errorMessage,
    });
  }

  /**
   * Fetches the current tab's certificate
   * @returns the current tab's certificate or undefined
   */
  async getCertificate(): Promise<Certificate | undefined> {
    const certificate = (await this.sendMessage({
      type: "getCertificate",
      params: { tabId: this.state.tabId },
    })) as Certificate;
    return certificate;
  }

  /**
   * Fetches the current tab's certificate quality
   * @returns the current tab's certificate quality or undefined
   */
  async getQuality(): Promise<Quality | undefined> {
    const quality = (await this.sendMessage({
      type: "getQuality",
      params: { tabId: this.state.tabId },
    })) as Quality;
    return quality;
  }

  /**
   * Fetches the current tab's error message
   * @returns the current tab's error message or undefined
   */
  async getErrorMessage(): Promise<ErrorMessage | undefined> {
    const errorMessage = (await this.sendMessage({
      type: "getErrorMessage",
      params: { tabId: this.state.tabId },
    })) as ErrorMessage;
    return errorMessage;
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
      <Router>
        <Switch>
          <Route path="/certificate">
            <CertificateView />
          </Route>
          <Route path="/new-quality">
            <NewQuality />
          </Route>
          <Route path="/domains">
            <Domains />
          </Route>
          <Route path="/configuration">
            <Configuration />
          </Route>
          <Route path="/">
            <Home
              errorMessage={this.state.errorMessage}
              certificate={this.state.certificate}
              quality={this.state.quality}
              openOptionsPage={this.props.openOptionsPage}
            />
          </Route>
        </Switch>
      </Router>
    );
  }
}
