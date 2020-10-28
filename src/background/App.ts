import { Events, Runtime, WebRequest } from "webextension-polyfill-ts";

import CertificateService from "./CertificateService";

export default class App {
  public test = "poop";

  constructor(
    private webRequestEmitter: WebRequest.onHeadersReceivedEvent,
    private messageEmitter: Events.Event<
      (
        message: { type: string; params: unknown },
        sender: Runtime.MessageSender,
        sendResponse: (response: unknown) => void
      ) => void | Promise<unknown>
    >,
    private certificateService: CertificateService
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
    this.certificateService.fetchCertificate(requestDetails);
  }

  private receiveMessage(
    message: { type: string; params: unknown },
    _: Runtime.MessageSender,
    sendResponse: (response: unknown) => void
  ): void {
    let params;
    switch (message.type) {
      case "getError":
        params = message.params as { tabId: number };
        const error = this.certificateService.getError(params.tabId);
        sendResponse(error);
        break;
      case "getCertificate":
        params = message.params as { tabId: number };
        const certificate = this.certificateService.getCertificate(
          params.tabId
        );
        sendResponse(certificate);
        break;
      case "getQuality":
        params = message.params as { tabId: number };
        const quality = this.certificateService.getQuality(params.tabId);
        sendResponse(quality);
        break;
    }
  }
}
