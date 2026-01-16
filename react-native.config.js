// Root level react-native config to help autolinking in monorepo
module.exports = {
  project: {
    android: {
      sourceDir: './mobile/android',
      packageName: 'com.saastemplate.app',
    },
  },
  // Don't autolink in the root - mobile has its own config
  dependencies: {},
};
