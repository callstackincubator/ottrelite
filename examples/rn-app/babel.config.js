module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: ['module:@ottrelite/instrumentation-react'],
  env: {
    production: {
      plugins: ['react-native-paper/babel'],
    },
  },
};
