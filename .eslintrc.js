module.exports = {
  "extends": "airbnb",
  "env": {
    "browser": true
  },
  "plugins": [
    "react",
    "jsx-a11y",
    "import"
  ],
  "rules": {
    "semi": [2, "never"],
    "react/jsx-filename-extension": [1, { "extensions": [".js", ".jsx"] }],
    "react/prop-types": [0]
  }
};
