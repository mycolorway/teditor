module.exports = {
  root: true,
  env: {
    browser: true,
    // jasmine: true,
  },
  extends: [
    'airbnb-base',
    // 'plugin:jasmine/recommended'
  ],
  rules: {
    "no-use-before-define": ["error", { "functions": false }]
}
};