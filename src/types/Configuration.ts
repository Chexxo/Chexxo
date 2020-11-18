export default class Configuration {
  constructor(
    public serverUrl: string,
    public cacheDomainQualities: boolean,
    public cacheDomainQualitiesIncognito: boolean
  ) {}
}
