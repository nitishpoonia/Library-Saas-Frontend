// Release bundles are built with NODE_ENV=production. In that case every console.*
// call is removed, so error objects carrying tokens or personal data never reach
// the device log (REVIEW FS3). babel-preset-expo already adds the worklets plugin.
module.exports = function (api) {
  const production = api.env("production");
  return {
    presets: ["babel-preset-expo"],
    plugins: production ? ["transform-remove-console"] : [],
  };
};
