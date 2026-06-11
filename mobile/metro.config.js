const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const sharedRoot = path.resolve(projectRoot, "../packages/shared");

const config = getDefaultConfig(projectRoot);

// @saas-template/shared is symlinked from ../packages/shared — watch its
// source so edits there trigger reloads.
config.watchFolders = [sharedRoot];

module.exports = config;
