const path = require('path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

// apps/ holds the web apps (admin panel). Keep Metro from crawling them and their
// node_modules. Anchored to this project's own folder, so a parent folder that happens
// to be called "apps" isn't blocked.
const appsDir = path.resolve(__dirname, 'apps');
const escapeForRegExp = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const defaultConfig = getDefaultConfig(__dirname);
const config = {
  resolver: {
    // Added to Metro's own block list, not replacing it.
    blockList: [].concat(
      defaultConfig.resolver?.blockList ?? [],
      new RegExp(`^${escapeForRegExp(appsDir)}[\\\\/].*`),
    ),
  },
};

module.exports = mergeConfig(defaultConfig, config);
