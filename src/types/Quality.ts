export const Quality = {
  Unknown: {
    key: "?",
    level: 0,
    text: "Unknown",
  },
  DomainValidated: {
    key: "DV",
    level: 1,
    text: "Domain Validated",
  },
  OrganizationValidated: {
    key: "OV",
    level: 2,
    text: "Organization Validated",
  },
  ExtendedValidated: {
    key: "EV",
    level: 3,
    text: "Extended Validated",
  },
};

export type Quality = typeof Quality[keyof typeof Quality];
