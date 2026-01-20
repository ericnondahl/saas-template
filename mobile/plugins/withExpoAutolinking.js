const { withSettingsGradle } = require("@expo/config-plugins");

/**
 * Expo config plugin to fix autolinking in monorepo
 * This modifies settings.gradle to always use Expo's autolinking
 * which properly resolves packageName in monorepo setups
 */
const withExpoAutolinking = (config) => {
  return withSettingsGradle(config, (config) => {
    // Replace the entire conditional block with just the Expo autolinking command
    const oldPattern =
      /extensions\.configure\(com\.facebook\.react\.ReactSettingsExtension\) \{ ex ->\s*if \(System\.getenv\('EXPO_USE_COMMUNITY_AUTOLINKING'\) == '1'\) \{\s*ex\.autolinkLibrariesFromCommand\(\)\s*\} else \{\s*def command = \[/g;

    const newCode = `extensions.configure(com.facebook.react.ReactSettingsExtension) { ex ->
  // Use Expo's autolinking which properly resolves packageName in monorepos
  def command = [`;

    config.modResults.contents = config.modResults.contents.replace(oldPattern, newCode);

    // Also remove the closing brace for the else block (the second-to-last } before the configure block ends)
    config.modResults.contents = config.modResults.contents.replace(
      /ex\.autolinkLibrariesFromCommand\(command\)\s*\}\s*\}/g,
      `ex.autolinkLibrariesFromCommand(command)\n}`
    );

    return config;
  });
};

module.exports = withExpoAutolinking;
