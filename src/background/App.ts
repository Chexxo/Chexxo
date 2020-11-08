import {
  BrowserAction,
  Events,
  Runtime,
  Tabs,
  WebRequest,
} from "webextension-polyfill-ts";
import UnhandledMessageError from "../types/errors/UnhandledMessageError";

import CertificateStore from "./stores/CertificateStore";
import "../assets/logo.svg";
import "../assets/logo_error.svg";

export default class App {
  constructor(
    private webRequestEmitter: WebRequest.onHeadersReceivedEvent,
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
    private browserAction: BrowserAction.Static,
    private certificateStore: CertificateStore
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
    this.messageEmitter.addListener(this.receiveMessage.bind(this));
    this.tabActivatedEmitter.addListener(this.changeBrowserAction.bind(this));
  }

  private receiveWebRequest(
    requestDetails: WebRequest.OnHeadersReceivedDetailsType
  ): void {
    // using await is not possible here, since making receiveWebRequest async is not allowed
    this.certificateStore.fetchCertificate(requestDetails).then(() => {
      this.changeBrowserAction(requestDetails);
    });
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
        const certificate = this.certificateStore.getCertificate(params.tabId);
        sendResponse(certificate);
        break;
      case "getQuality":
        params = message.params as { tabId: number };
        const quality = this.certificateStore.getQuality(params.tabId);
        sendResponse(quality);
        break;
      case "getErrorMessage":
        params = message.params as { tabId: number };
        const errorMessage = this.certificateStore.getErrorMessage(
          params.tabId
        );
        sendResponse(errorMessage);
        break;
      default:
        sendResponse(new UnhandledMessageError());
    }
  }

  private changeBrowserAction(tabInfo: { tabId: number }): void {
    const { tabId } = tabInfo;
    if (this.certificateStore.getErrorMessage(tabId)) {
      this.browserAction.setIcon({ path: "../assets/logo_error.svg" });
      this.browserAction.setBadgeBackgroundColor({ color: "#d32f2f" });
      this.browserAction.setBadgeText({ text: "!" });
    } else {
      this.browserAction.setIcon({ path: "../assets/logo.svg" });
      this.browserAction.setBadgeBackgroundColor({ color: "#1976d2" });

      const quality = this.certificateStore.getQuality(tabId);
      if (quality) {
        const stars = "*".repeat(quality.level);
        this.browserAction.setBadgeText({ text: stars });
      } else {
        this.browserAction.setBadgeText({ text: "" });
      }
    }
  }
}
