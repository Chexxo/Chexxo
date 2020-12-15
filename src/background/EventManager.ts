/* eslint-disable max-lines */
import {
  BrowserAction,
  Runtime,
  Tabs,
  WebNavigation,
  WebRequest,
} from "webextension-polyfill-ts";

import { Configuration } from "../types/Configuration";
import { StorageError } from "../types/errors/StorageError";
import { UnhandledMessageError } from "../types/errors/UnhandledMessageError";
import { Quality } from "../types/Quality";

import { App } from "./App";

/**
 * Class which is responsible for detecting and handling browser api
 * events.
 */
export class EventManager {
  // eslint-disable-next-line max-params
  constructor(
    private webNavigation: WebNavigation.Static,
    private runtime: Runtime.Static,
    private tabs: Tabs.Static,
    private browserAction: BrowserAction.Static,
    private app: App,
    private webRequest?: WebRequest.Static
  ) {}

  /**
   * Initializes the class by registering the needed callbacks within the
   * browsers api.
   */
  public init(): void {
    this.webNavigation.onBeforeNavigate.addListener(this.resetTab.bind(this));

    if (this.webRequest) {
      const filter: WebRequest.RequestFilter = {
        urls: ["<all_urls>"],
        types: ["main_frame"],
      };
      const extraInfoSpec: WebRequest.OnHeadersReceivedOptions[] = ["blocking"];
      this.webRequest.onHeadersReceived.addListener(
        this.receiveWebRequestHeaders.bind(this),
        filter,
        extraInfoSpec
      );
    } else {
      this.webNavigation.onCommitted.addListener(
        this.receiveWebRequestHeaders.bind(this)
      );
    }

    this.webNavigation.onErrorOccurred.addListener(
      this.receiveWebNavigationError.bind(this)
    );
    this.webNavigation.onCompleted.addListener(
      this.changeBrowserAction.bind(this)
    );
    this.runtime.onMessage.addListener(this.receiveMessage.bind(this));
  }

  /**
   * Resets the cached tab information for the tab specified within
   * the request details if the tab is a primary tab and the
   * connection was made with https.
   *
   * @param requestDetails The details of the request which lead
   * to this invocation.
   */
  public resetTab(requestDetails: {
    url: string;
    tabId: number;
    parentFrameId: number;
  }): void {
    if (requestDetails.parentFrameId !== -1) {
      return;
    }

    if (!this.isHttps(requestDetails.url)) {
      this.app.resetTabData(requestDetails.tabId);
    }
  }

  /**
   * Fetches the certificate for the tab provided within
   * the request details given that the tab is a primary
   * tab and the connection was made with https. This
   * function also cancels the connection construction
   * if the quality has decreased since the users last
   * visit to the domain in question. If the quality has
   * indeed decreased a redirect will be made to the
   * extensions blocking view.
   *
   * @param requestDetails The details of the request which lead
   * to this invocation.
   */
  public async receiveWebRequestHeaders(requestDetails: {
    url: string;
    tabId: number;
  }): Promise<WebRequest.BlockingResponse> {
    /*
      has to be asserted twice, because 'webextension-polyfill-ts' has declared 
      OnCommittedDetailsType incorrectly
    */
    const fixedDetails = (requestDetails as unknown) as {
      url: string;
      tabId: number;
      parentFrameId: number;
    };

    if (fixedDetails.parentFrameId !== -1) {
      return {};
    }

    if (!this.isHttps(fixedDetails.url)) {
      return {};
    }

    await this.app.fetchCertificate(requestDetails);
    const hasQualityDecreased = await this.app.analyzeQuality(requestDetails);

    if (hasQualityDecreased) {
      const path = `blocked.html?url=${requestDetails.url}`;
      this.tabs.update(requestDetails.tabId, {
        url: this.runtime.getURL(path),
      });
      return { cancel: true };
    }
    return {};
  }

  /**
   * Callback for errors which occured within the browsers api. Errors
   * like expired certificates are handled by this function which will
   * then set the correct errors within the extension.
   *
   * @param requestDetails The request which lead to the error.
   */
  public receiveWebNavigationError(requestDetails: {
    url: string;
    tabId: number;
    frameId: number;
  }): void {
    /*
      has to be asserted twice, because 'webextension-polyfill-ts' has declared 
      OnErrorOccuredDetailsType incorrectly
    */
    const fixedDetails = (requestDetails as unknown) as {
      url: string;
      tabId: number;
      frameId: number;
      error: string;
    };

    if (requestDetails.frameId !== 0) {
      return;
    }
    if (!this.isHttps(requestDetails.url)) {
      return;
    }

    this.app.analyzeError(fixedDetails);
    this.changeBrowserAction(requestDetails);
  }

  /**
   * Handles messages from the extensions popup and returns an
   * appropriate answers.
   *
   * @param message The message which was sent by the extensions
   * popup.
   */
  // eslint-disable-next-line max-lines-per-function
  public receiveMessage(message: {
    type: string;
    params?: unknown;
  }): Promise<unknown> {
    // eslint-disable-next-line complexity, max-lines-per-function
    return new Promise((resolve, reject) => {
      let params;
      switch (message.type) {
        case "getTabData":
          params = message.params as { tabId: number };
          const tabData = this.app.getTabData(params.tabId);
          resolve(tabData);
          break;
        case "resetQuality":
          params = message.params as { url: string };
          this.app.resetQuality(params.url);
          resolve(undefined);
          break;
        case "getConfiguration":
          try {
            const configuration = this.app.getConfiguration();
            resolve(configuration);
          } catch (error) {
            reject(error as StorageError);
          }
          break;
        case "setConfiguration":
          params = message.params as { configuration: Configuration };
          try {
            this.app.setConfiguration(params.configuration);
            resolve(undefined);
          } catch (error) {
            reject(error as Error);
          }
          break;
        case "removeCache":
          resolve(this.app.removeCache());
          break;
        case "exportLogs":
          try {
            resolve(this.app.exportLogs());
          } catch (error) {
            reject(error as Error);
          }
          break;
        case "removeLogs":
          try {
            resolve(this.app.removeLogs());
          } catch (error) {
            reject(error as Error);
          }
          break;
        default:
          reject(new UnhandledMessageError(JSON.stringify(message)));
      }
    });
  }

  /**
   * Sets the extensions icon according to the information provided
   * within the request details. If an error occured the icon will
   * be set to represent that an error occured. If no error occured
   * the icon will be set to respresent the quality which was
   * evaluated for the given tab.
   *
   * @param requestDetails The details of the request which lead
   * to this invocation.
   */
  public changeBrowserAction(requestDetails: {
    url: string;
    tabId: number;
  }): void {
    const { url, tabId } = requestDetails;
    const { parentFrameId } = (requestDetails as unknown) as {
      parentFrameId: number;
    };

    if (parentFrameId !== -1) {
      return;
    }

    if (!this.isHttps(url)) {
      this.browserAction.setIcon({ tabId, path: "../assets/logo.svg" });
      this.browserAction.setBadgeBackgroundColor({ tabId, color: "#1976d2" });
      this.browserAction.disable(tabId);
      return;
    }

    this.browserAction.enable(tabId);

    const tabData = this.app.getTabData(tabId);

    if (tabData?.errorMessage) {
      this.setErrorIcon(tabId);
    } else {
      this.setQualityIcon(tabId, tabData?.quality);
    }
  }

  /**
   * Sets the extensions icon to represent that an error
   * occured.
   *
   * @param tabId The id of the tab in which an error
   * occured.
   */
  private setErrorIcon(tabId: number) {
    this.browserAction.setIcon({
      tabId,
      path: "../assets/logo_error.svg",
    });
    this.browserAction.setBadgeBackgroundColor({
      tabId,
      color: "#d32f2f",
    });
    this.browserAction.setBadgeText({ tabId, text: "!" });
  }

  /**
   * Sets the extensions icon to represent the given quality.
   *
   * @param tabId The id of the tab of which the icon should
   * be adjusted.
   * @param quality Te quality which should be represented by
   * the icon.
   */
  private setQualityIcon(tabId: number, quality?: Quality) {
    this.browserAction.setIcon({ tabId, path: "../assets/logo.svg" });
    this.browserAction.setBadgeBackgroundColor({ tabId, color: "#1976d2" });

    if (quality) {
      const stars = "*".repeat(quality.level);
      this.browserAction.setBadgeText({ tabId, text: stars });
    } else {
      this.browserAction.setBadgeText({ tabId, text: "" });
    }
  }

  /**
   * Checks if the given url is using the https protocol.
   *
   * @param url The url to be checked.
   */
  private isHttps(url: string): boolean {
    const realUrl = new URL(url);
    return realUrl.protocol === "https:";
  }
}
