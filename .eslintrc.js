module.exports = {
  extends: [
    "plugin:@typescript-eslint/recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:jest/recommended",
    "plugin:prettier/recommended",
    "plugin:react-hooks/recommended",
    "plugin:react/recommended",
    "prettier",
    "prettier/@typescript-eslint",
    "prettier/react",
  ],
  plugins: [
    "@typescript-eslint", 
    "eslint-plugin-tsdoc",
    "import",
    "jest",
    "react", 
    "react-hooks",
  ],
  env: {
    browser: true,
    es6: true,
    jest: true,
  },
  globals: {
    Atomics: "readonly",
    SharedArrayBuffer: "readonly",
  },
  overrides: [
    {
      files: ["*.js"],
      rules: {
        "@typescript-eslint/no-var-requires": "off",
      },
    },
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    sourceType: "module",
    project: "./tsconfig.json",
  },
  settings: {
    "import/resolver": {
      node: {
        paths: ["src"],
        extensions: [".js", ".jsx", ".ts", ".tsx"],
      }
    },
    react: {
      version: "detect",
    },
  },
  rules: {
    "max-lines": ["error", {
      "max": 300
    }],
    "complexity": ["error", {
      "max": 10
    }],
    "max-lines-per-function": ["error", {
      "max": 30,
      "skipBlankLines": true
    }],
    "max-params": ["error",
      5
    ]
  }
};
