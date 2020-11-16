export default class DistinguishedName {
  constructor(
    readonly commonName: string,
    readonly organization: string,
    readonly organizationalUnit: string,
    readonly location: string,
    readonly state: string,
    readonly country: string
  ) {}
}
