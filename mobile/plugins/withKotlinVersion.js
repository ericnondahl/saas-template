const { withGradleProperties, withProjectBuildGradle } = require('@expo/config-plugins');

/**
 * Expo config plugin to set the Kotlin version for Android builds.
 * This is needed to ensure compatibility between Kotlin and Compose Compiler.
 */
const withKotlinVersion = (config, { kotlinVersion = '1.9.25' } = {}) => {
  // Add kotlin version to gradle.properties
  config = withGradleProperties(config, (config) => {
    config.modResults = config.modResults.filter(
      (item) => !(item.type === 'property' && item.key === 'android.kotlinVersion')
    );

    config.modResults.push({
      type: 'property',
      key: 'android.kotlinVersion',
      value: kotlinVersion,
    });

    return config;
  });

  // Modify build.gradle to explicitly use the kotlin version in the classpath
  config = withProjectBuildGradle(config, (config) => {
    const buildGradle = config.modResults.contents;

    // Replace the kotlin-gradle-plugin classpath to use the explicit version
    const updatedBuildGradle = buildGradle.replace(
      /classpath\(['"]org\.jetbrains\.kotlin:kotlin-gradle-plugin['"]\)/,
      `classpath("org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlinVersion")`
    );

    config.modResults.contents = updatedBuildGradle;
    return config;
  });

  return config;
};

module.exports = withKotlinVersion;
