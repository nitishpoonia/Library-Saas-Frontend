import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { api } from "@/api/client";

/**
 * Push notifications from the backend (daily digest, subscription reminders) arrive
 * through Firebase Cloud Messaging. On Android the device token *is* the FCM token,
 * which the backend sends to directly.
 *
 * iOS gives an APNs token instead, which FCM can't use as is; iOS push needs either
 * Firebase's iOS SDK or Expo's push service, so it's skipped for now.
 */

let registeredToken: string | null = null;

/** The token this phone registered, so sign-out can remove it (REVIEW FS4). */
export const getRegisteredToken = () => registeredToken;

export function configureNotifications() {
  // Show notifications that arrive while the app is open, too (REVIEW FN2).
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
  if (Platform.OS === "android") {
    void Notifications.setNotificationChannelAsync("default", {
      name: "Library updates",
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
}

/** Asks for permission once and registers this phone with the backend. */
export async function registerDevice(): Promise<string | null> {
  if (Platform.OS !== "android") return null;

  const current = await Notifications.getPermissionsAsync();
  const granted = current.granted || (current.canAskAgain && (await Notifications.requestPermissionsAsync()).granted);
  if (!granted) return null;

  const token = await Notifications.getDevicePushTokenAsync();
  await sendToken(String(token.data));
  return registeredToken;
}

/**
 * Detaches this phone from the account on the server, while the session still works.
 * Best effort: a failure here shouldn't block signing out.
 */
export async function unregisterDevice() {
  const token = registeredToken;
  if (!token) return;
  await api.delete(`/me/devices/${encodeURIComponent(token)}`);
  registeredToken = null;
}

export async function sendToken(token: string) {
  await api.post("/me/devices", { token, platform: "ANDROID" });
  registeredToken = token;
}
