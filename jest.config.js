module.exports = {
  coveragePathIgnorePatterns: [".+\\.(css|styl|less|sass|scss)$"],
  preset: "ts-jest",
  roots: ["<rootDir>/src/"],
  testEnvironment: "jsdom",
  transform: {
    ".+\\.(css|styl|less|sass|scss)$": "jest-css-modules-transform",
  },
};
