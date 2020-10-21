import { Events, Runtime, WebRequest } from "webextension-polyfill-ts";

import CertificateService from "./CertificateService";

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
    private certificateService: CertificateService
  ) {}

  init(): void {
    const filter: WebRequest.RequestFilter = {
      urls: ["<all_urls>"],
      types: ["main_frame"],
    };
    this.webRequestEmitter.addListener(
      this.receiveWebRequest.bind(this),
      filter
    );
    this.messageEmitter.addListener(this.receiveMessage.bind(this));
  }

  private receiveWebRequest(
    requestDetails: WebRequest.OnHeadersReceivedDetailsType
  ): void {
    console.log(requestDetails.url);
    this.certificateService.fetchCertificate(requestDetails);
  }

  private receiveMessage(
    message: { type: string; params: unknown },
    _: Runtime.MessageSender,
    sendResponse: (response: unknown) => void
  ): void {
    switch (message.type) {
      case "getCertificate":
        const params = message.params as { tabId: number };
        const certificate = this.certificateService.getCertificate(
          params.tabId
        );
        sendResponse(certificate);
        break;
    }
  }
}
