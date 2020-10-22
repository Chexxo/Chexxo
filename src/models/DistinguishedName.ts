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
    const regex = /(CN?|OU?|L|ST)=([^,]*)/g;
    let matches: RegExpExecArray | null = null;
    const params = new Map();

    while ((matches = regex.exec(stringRepresentation))) {
      params.set(matches[1], matches[2]);
    }

    return new DistinguishedName(
      params.get("CN") || "",
      params.get("O") || "",
      params.get("OU") || "",
      params.get("L") || "",
      params.get("ST") || "",
      params.get("C") || ""
    );
  }
}
