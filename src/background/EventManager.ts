import {
  BrowserAction,
  Events,
  Runtime,
  Tabs,
  WebNavigation,
  WebRequest,
} from "webextension-polyfill-ts";
import UnhandledMessageError from "../types/errors/UnhandledMessageError";

import App from "./App";

export default class EventManager {
  constructor(
    private webRequestEmitter: WebRequest.onHeadersReceivedEvent,
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

  init(): void {
    const filter: WebRequest.RequestFilter = {
      urls: ["<all_urls>"],
      types: ["main_frame"],
    };
    const extraInfoSpec: WebRequest.OnHeadersReceivedOptions[] = ["blocking"];
    this.webRequestEmitter.addListener(
      this.receiveWebRequest.bind(this),
      filter,
      extraInfoSpec
    );
    this.webRequestErrorEmitter.addListener(
      this.receiveWebRequestError.bind(this)
    );
    this.messageEmitter.addListener(this.receiveMessage.bind(this));
    this.tabActivatedEmitter.addListener(this.changeBrowserAction.bind(this));
  }

  private receiveWebRequest(
    requestDetails: WebRequest.OnHeadersReceivedDetailsType
  ): void {
    // using await is not possible here, since making receiveWebRequest async is not allowed
    this.app.fetchCertificate(requestDetails).then(() => {
      this.changeBrowserAction(requestDetails);
    });
  }

  private receiveWebRequestError(
    requestDetails: WebNavigation.OnErrorOccurredDetailsType
  ): void {
    this.app.analyzeError(requestDetails);
    this.changeBrowserAction(requestDetails);
  }

  private receiveMessage(
    message: { type: string; params: unknown },
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
      default:
        sendResponse(new UnhandledMessageError(JSON.stringify(message)));
    }
  }

  private changeBrowserAction(tabInfo: { tabId: number }): void {
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
