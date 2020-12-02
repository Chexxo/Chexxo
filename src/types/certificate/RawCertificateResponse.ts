import { RawCertificate } from "../../shared/types/certificate/RawCertificate";

export class RawCertificateResponse {
  constructor(
    readonly requestUuid: string,
    readonly rawCertificate?: RawCertificate,
    readonly error?: Error
  ) {}
}
