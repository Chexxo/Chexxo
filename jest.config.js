module.exports = {
  coveragePathIgnorePatterns: [".+\\.(css|styl|less|sass|scss)$"],
  preset: "ts-jest",
  roots: ["<rootDir>/src/"],
  setupFiles: ["jest-webextension-mock"],
  testEnvironment: "jsdom",
  transform: {
    ".+\\.(css|styl|less|sass|scss)$": "jest-css-modules-transform",
  },
};
