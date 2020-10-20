import CertificateService from "./CertificateService";
import InBrowserProvider from "./InBrowserProvider";

export default class App {
  private certificateService: CertificateService;

  constructor(
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
    private webRequestEmitter: any,
    private messageEmitter: EvListener<browser.runtime.onMessageEvent>
  ) {
    this.certificateService = new CertificateService(new InBrowserProvider());
  }

  init(): void {
    this.webRequestEmitter.addListener(this.receiveWebRequest);
    this.messageEmitter.addListener(this.receiveMessage);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async receiveWebRequest(requestDetails: any) {
    this.certificateService.fetchCertificate(requestDetails);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private receiveMessage(message: any, _: any, sendResponse: any): void {
    switch (message.type) {
      case "fetchCertificate":
        break;
      case "getCertificate":
        sendResponse({ text: "hello" });
        break;
    }
  }
}
