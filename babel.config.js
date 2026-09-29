// Release builds bundle with NODE_ENV=production. In that case every console.* call is
// removed, so error objects that carry tokens or personal data never reach the device log.
const isProduction =
  process.env.BABEL_ENV === 'production' || process.env.NODE_ENV === 'production';

module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    ...(isProduction ? ['transform-remove-console'] : []),
    // Must stay the last plugin.
    'react-native-worklets/plugin',
  ],
};
