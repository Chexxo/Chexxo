import Issuer from "./Issuer";
import Subject from "./Subject";

export default class Certificate {
  constructor(
    readonly fingerprint: string,
    readonly fingerprint256: string,
    readonly issuer: Issuer,
    readonly serialNumber: string,
    readonly subject: Subject,
    readonly subjectAltName: string[],
    readonly validFrom: number,
    readonly validTo: number,
    readonly certificatePolicies: string[]
  ) {}
}
