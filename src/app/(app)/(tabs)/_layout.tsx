import { NativeTabs } from "expo-router/unstable-native-tabs";
import { Platform } from "react-native";
import { useCanManage } from "@/session/CurrentLibrary";
import { useTheme } from "@/ui";

/**
 * The system tab bar: Liquid Glass on iOS 26 (it shrinks while you scroll down), the
 * translucent bar on older iOS, and the Material 3 navigation bar on Android.
 */
export default function TabsLayout() {
  const canManage = useCanManage();
  const t = useTheme();
  const c = t.colors;

  return (
    <NativeTabs
      minimizeBehavior="onScrollDown"
      {...(Platform.OS === "android"
        ? {
            backgroundColor: c.surface,
            indicatorColor: c.secondaryContainer,
            rippleColor: c.ripple,
            iconColor: { default: c.textMuted, selected: c.onSecondaryContainer },
            labelStyle: { default: { color: c.textMuted }, selected: { color: c.text } },
            labelVisibilityMode: "labeled" as const,
          }
        : {})}
    >
      <NativeTabs.Trigger name="(home)">
        <NativeTabs.Trigger.Icon sf={{ default: "house", selected: "house.fill" }} md="home" />
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="(students)">
        <NativeTabs.Trigger.Icon sf={{ default: "person.2", selected: "person.2.fill" }} md="group" />
        <NativeTabs.Trigger.Label>Students</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      {/* Only owners and managers see expenses. The tab stays declared and is hidden, since
          native tabs can't be added or removed after launch. */}
      <NativeTabs.Trigger name="(money)" hidden={!canManage}>
        <NativeTabs.Trigger.Icon sf={{ default: "indianrupeesign.circle", selected: "indianrupeesign.circle.fill" }} md="account_balance_wallet" />
        <NativeTabs.Trigger.Label>Expenses</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="(menu)">
        <NativeTabs.Trigger.Icon sf={{ default: "ellipsis.circle", selected: "ellipsis.circle.fill" }} md="more_horiz" />
        <NativeTabs.Trigger.Label>More</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
