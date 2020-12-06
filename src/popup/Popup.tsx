import React, { Component } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { Tabs, Runtime } from "webextension-polyfill-ts";

import { Certificate } from "../types/certificate/Certificate";
import { ErrorMessage } from "../types/errors/ErrorMessage";
import { Quality } from "../types/Quality";
import { TabData } from "../types/TabData";
import { CertificateView } from "./pages/CertificateView";
import { Home } from "./pages/Home";

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
export class Popup extends Component<Props, State> {
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
    const tabData = await this.getTabData();
    this.setState({
      certificate: tabData?.certificate,
      quality: tabData?.quality,
      errorMessage: tabData?.errorMessage,
    });
  }

  /**
   * Queries the current tab's id
   * @returns the current tab's id
   */
  private async getCurrentTabId(): Promise<number | undefined> {
    const tabs = await this.getTabs({
      active: true,
      currentWindow: true,
    });
    const currentTab = tabs[0];
    return currentTab.id;
  }

  /**
   * Queries the current tab's {@link TabData} object
   * @returns Either the {@link TabData} object associated with the tabId or undefined
   */
  private async getTabData(): Promise<TabData | undefined> {
    const tabData = (await this.sendMessage({
      type: "getTabData",
      params: { tabId: this.state.tabId },
    })) as TabData;
    return tabData;
  }

  /**
   * Renders the Popup component
   * @returns the rendered Popup component
   */
  render(): JSX.Element {
    return (
      <Router>
        <Switch>
          <Route path="/certificate">
            <CertificateView certificate={this.state.certificate} />
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
