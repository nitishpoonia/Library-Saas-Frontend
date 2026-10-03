const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

/**
 * Expo's default Metro config, plus one rule: apps/ holds the web apps (the admin
 * panel) with their own node_modules, so Metro must not crawl or resolve from it.
 * Anchored to this project's folder, so a parent folder named "apps" isn't blocked.
 */
const config = getDefaultConfig(__dirname);

const appsDir = path.resolve(__dirname, "apps");
const escapeForRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

config.resolver.blockList = [].concat(
  config.resolver.blockList ?? [],
  new RegExp(`^${escapeForRegExp(appsDir)}[\\\\/].*`),
);

module.exports = config;
