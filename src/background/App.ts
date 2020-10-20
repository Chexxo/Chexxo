import { Events, Runtime, WebRequest } from "webextension-polyfill-ts";

import CertificateService from "./CertificateService";
import InBrowserProvider from "./InBrowserProvider";

export default class App {
  private certificateService: CertificateService;

  constructor(
    private webRequestEmitter: WebRequest.onHeadersReceivedEvent,
    private messageEmitter: Events.Event<
      (
        message: { type: string },
        sender: Runtime.MessageSender,
        sendResponse: (response: unknown) => void
      ) => void | Promise<unknown>
    >
  ) {
    this.certificateService = new CertificateService(new InBrowserProvider());
  }

  init(): void {
    const filter = { urls: ["<all_urls>"] };
    const extraInfoSpec: WebRequest.OnHeadersReceivedOptions[] = ["blocking"];
    this.webRequestEmitter.addListener(
      this.receiveWebRequest,
      filter,
      extraInfoSpec
    );
    this.messageEmitter.addListener(this.receiveMessage);
  }

  private receiveWebRequest(
    requestDetails: WebRequest.OnHeadersReceivedDetailsType
  ) {
    this.certificateService.fetchCertificate(requestDetails);
  }

  private receiveMessage(
    message: { type: string },
    _: Runtime.MessageSender,
    sendResponse: (response: unknown) => void
  ): void {
    switch (message.type) {
      case "fetchCertificate":
        break;
      case "getCertificate":
        sendResponse({ text: "hello" });
        break;
    }
  }
}
