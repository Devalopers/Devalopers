module.exports = {
  ecmaFeatures: {
    jsx: true,
    modules: true,
    arrowFunctions: true,
    classes: true,
    spread: true,
    parser: "babel-eslint",
    parserOptions: {
      sourceType: "module",
      allowImportExportEverywhere: false,
      ecmaFeatures: {
        globalReturn: false
      },
      babelOptions: {
        configFile: "path/to/config.js"
      }
    }
  },
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    node: true,
    jest: true
  },
  extends: ["eslint:recommended", "google", "plugin:jest/recommended"],
  globals: {
    Atomics: "readonly",
    SharedArrayBuffer: "readonly"
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: "module"
  },
  rules: {
    "linebreak-style": 0,
    "max-len": [
      "error",
      {
        code: 120,
        ignoreComments: true,
        ignoreTrailingComments: true,
        ignoreUrls: true,
        ignoreStrings: true,
        "ignoreTemplateLiterals": true,
        "ignoreRegExpLiterals": true
      }
    ]
  }
};
