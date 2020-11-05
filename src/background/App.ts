import { Events, Runtime, WebRequest } from "webextension-polyfill-ts";
import UnhandledMessageError from "../types/errors/UnhandledMessageError";

import CertificateStore from "./stores/CertificateStore";

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
  }

  private receiveWebRequest(
    requestDetails: WebRequest.OnHeadersReceivedDetailsType
  ): void {
    this.certificateStore.fetchCertificate(requestDetails);
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
}
