import type { ConfigContext, ExpoConfig } from "expo/config";

/**
 * App identity and native settings. The android/ and ios/ folders are generated from
 * this file (Continuous Native Generation), so native changes go here, not there.
 *
 * `android.package` must stay "com.librarysaas": it's the id the Play Store knows.
 * Bump `android.versionCode` for every store release.
 */
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "LibrarySaaS",
  slug: "library-saas",
  version: "1.1.0",
  scheme: "librarysaas",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  userInterfaceStyle: "light",
  android: {
    package: "com.librarysaas",
    versionCode: 15,
    googleServicesFile: "./google-services.json",
    predictiveBackGestureEnabled: false,
    // Added by default libraries but not used by this app; the Play Store asks
    // for a justification of each one, so they're removed.
    blockedPermissions: [
      "android.permission.SYSTEM_ALERT_WINDOW",
      "android.permission.READ_EXTERNAL_STORAGE",
      "android.permission.WRITE_EXTERNAL_STORAGE",
    ],
  },
  ios: {
    bundleIdentifier: "com.librarysaas",
    supportsTablet: false,
  },
  plugins: [
    "expo-router",
    "expo-secure-store",
    [
      "expo-splash-screen",
      {
        backgroundColor: "#FFFFFF",
        image: "./assets/images/splash-icon.png",
        imageWidth: 96,
      },
    ],
    [
      "expo-notifications",
      {
        color: "#526EA8",
      },
    ],
    "@react-native-community/datetimepicker",
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
});
