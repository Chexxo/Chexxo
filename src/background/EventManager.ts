import {
  BrowserAction,
  Events,
  Runtime,
  Tabs,
  WebNavigation,
  WebRequest,
} from "webextension-polyfill-ts";

import { Configuration } from "../types/Configuration";
import { StorageError } from "../types/errors/StorageError";
import { UnhandledMessageError } from "../types/errors/UnhandledMessageError";

import { App } from "./App";

export class EventManager {
  constructor(
    private webRequestBeforeEmitter: WebRequest.onBeforeRequestEvent,
    private webRequestHeadersEmitter: WebRequest.onHeadersReceivedEvent,
    private webRequestErrorEmitter: WebNavigation.onErrorOccurredEvent,
    private messageEmitter: Events.Event<
      (
        message: { type: string; params: unknown },
        sender: Runtime.MessageSender,
        sendResponse: (response: unknown) => void
      ) => void | Promise<unknown>
    >,
    private tabActivatedEmitter: Events.Event<
      (activeInfo: Tabs.OnActivatedActiveInfoType) => void
    >,
    private setBrowserActionIcon: (
      details: BrowserAction.SetIconDetailsType
    ) => Promise<void>,
    private setBrowserActionText: (
      details: BrowserAction.SetBadgeTextDetailsType
    ) => Promise<void>,
    private setBrowserActionBackground: (
      details: BrowserAction.SetBadgeBackgroundColorDetailsType
    ) => Promise<void>,
    private app: App
  ) {}

  public init(): void {
    const filter: WebRequest.RequestFilter = {
      urls: ["<all_urls>"],
      types: ["main_frame"],
    };
    const extraInfoSpec: WebRequest.OnHeadersReceivedOptions[] = ["blocking"];
    this.webRequestHeadersEmitter.addListener(
      this.receiveWebRequest.bind(this),
      filter,
      extraInfoSpec
    );
    this.webRequestErrorEmitter.addListener(
      this.receiveWebRequestError.bind(this)
    );
    this.messageEmitter.addListener(this.receiveMessage.bind(this));
    this.tabActivatedEmitter.addListener(this.changeBrowserAction.bind(this));
    this.webRequestBeforeEmitter.addListener(
      this.resetTabData.bind(this),
      filter,
      []
    );
  }

  public resetTabData(requestDetails: { tabId: number }): void {
    this.app.resetTabData(requestDetails.tabId);
  }

  public receiveWebRequest(
    requestDetails: WebRequest.OnHeadersReceivedDetailsType
  ): void {
    // using await is not possible here, since making receiveWebRequest async is not allowed
    this.app.fetchCertificate(requestDetails).then(() => {
      this.changeBrowserAction(requestDetails);
    });
  }

  public receiveWebRequestError(
    requestDetails: WebNavigation.OnErrorOccurredDetailsType
  ): void {
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

    this.app.analyzeError(fixedDetails);
    this.changeBrowserAction(fixedDetails);
  }

  public receiveMessage(
    message: { type: string; params?: unknown },
    _: Runtime.MessageSender,
    sendResponse: (response: unknown) => void
  ): void {
    let params;
    switch (message.type) {
      case "getCertificate":
        params = message.params as { tabId: number };
        const certificate = this.app.getCertificate(params.tabId);
        sendResponse(certificate);
        break;
      case "getQuality":
        params = message.params as { tabId: number };
        const quality = this.app.getQuality(params.tabId);
        sendResponse(quality);
        break;
      case "getErrorMessage":
        params = message.params as { tabId: number };
        const errorMessage = this.app.getErrorMessage(params.tabId);
        sendResponse(errorMessage);
        break;
      case "getConfiguration":
        try {
          const configuration = this.app.getConfiguration();
          sendResponse(configuration);
        } catch (error) {
          sendResponse(error as StorageError);
        }
        break;
      case "setConfiguration":
        params = message.params as { configuration: Configuration };
        try {
          this.app.setConfiguration(params.configuration);
          sendResponse(true);
        } catch (error) {
          sendResponse(error as Error);
        }
        break;
      case "removeCache":
        sendResponse(this.app.removeCache());
        break;
      case "exportLogs":
        try {
          sendResponse(this.app.exportLogs());
        } catch (error) {
          sendResponse(error as Error);
        }
        break;
      case "removeLogs":
        try {
          sendResponse(this.app.removeLogs());
        } catch (error) {
          sendResponse(error as Error);
        }
        break;
      default:
        sendResponse(new UnhandledMessageError(JSON.stringify(message)));
    }
  }

  public changeBrowserAction(tabInfo: { tabId: number }): void {
    const { tabId } = tabInfo;
    if (this.app.getErrorMessage(tabId)) {
      this.setBrowserActionIcon({ path: "../assets/logo_error.svg" });
      this.setBrowserActionBackground({ color: "#d32f2f" });
      this.setBrowserActionText({ text: "!" });
    } else {
      this.setBrowserActionIcon({ path: "../assets/logo.svg" });
      this.setBrowserActionBackground({ color: "#1976d2" });

      const quality = this.app.getQuality(tabId);
      if (quality) {
        const stars = "*".repeat(quality.level);
        this.setBrowserActionText({ text: stars });
      } else {
        this.setBrowserActionText({ text: "" });
      }
    }
  }
}
