export class DistinguishedName {
  // eslint-disable-next-line max-params
  constructor(
    readonly commonName: string,
    readonly organization: string,
    readonly organizationalUnit: string,
    readonly location: string,
    readonly state: string,
    readonly country: string
  ) {}
}
