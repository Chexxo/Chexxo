export const Quality = {
  Unknown: {
    key: "?",
    level: 0,
    text: "Unknown",
    info: "The certificate quality couldn't be determined.",
  },
  DomainValidated: {
    key: "DV",
    level: 1,
    text: "Domain Validated",
    info: "The certificate authority verifies domain-ownership.",
  },
  OrganizationValidated: {
    key: "OV",
    level: 2,
    text: "Organization Validated",
    info:
      "The certificate authority verifies domain-ownership and performs background checks on the organization.",
  },
  ExtendedValidated: {
    key: "EV",
    level: 3,
    text: "Extended Validated",
    info:
      "The certificate authority verifies ownership of the certificate's domain and organization.",
  },
};

export type Quality = typeof Quality[keyof typeof Quality];

export const maxQuality = 3;
