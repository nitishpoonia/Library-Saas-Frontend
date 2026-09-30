import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import { useCurrentLibrary } from "@/session/CurrentLibrary";
import { registerDevice, sendToken } from "./push";

/**
 * Runs once a signed-in user has a branch (REVIEW FN1: not inside a screen):
 * registers the phone for push, keeps the token fresh, and opens the right screen
 * when a notification is tapped.
 */
export function useNotifications(enabled: boolean) {
  const { select } = useCurrentLibrary();
  const handled = useRef<string | null>(null);
  const response = Notifications.useLastNotificationResponse();

  useEffect(() => {
    if (!enabled) return;
    registerDevice().catch(() => {
      // No permission or offline: push is optional, the app works without it.
    });
    if (Platform.OS !== "android") return;
    const sub = Notifications.addPushTokenListener((token) => {
      void sendToken(String(token.data)).catch(() => {});
    });
    return () => sub.remove();
  }, [enabled]);

  // A tapped notification says which branch and screen it's about (REVIEW FN2).
  useEffect(() => {
    if (!enabled || !response) return;
    const id = response.notification.request.identifier;
    if (handled.current === id) return;
    handled.current = id;

    const data = response.notification.request.content.data as { libraryId?: string; screen?: string } | undefined;
    if (data?.libraryId) select(Number(data.libraryId));
    if (data?.screen === "billing") router.push("/billing");
    else router.navigate("/");
  }, [enabled, response, select]);
}
