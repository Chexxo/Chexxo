import { Certificate } from "./Certificate";

export class CertificateResponse {
  constructor(
    readonly requestUuid: string,
    readonly certificate?: Certificate,
    readonly error?: Error
  ) {}
}
