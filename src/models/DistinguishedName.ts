export default class DistinguishedName {
  constructor(
    readonly commonName: string,
    readonly organization: string,
    readonly organizationalUnit: string,
    readonly location: string,
    readonly state: string,
    readonly country: string
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static fromString(stringRepresentation: string): DistinguishedName {
    return new DistinguishedName("", "", "", "", "", "");
  }
}
