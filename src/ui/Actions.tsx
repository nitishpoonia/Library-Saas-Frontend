import { Stack, useNavigation } from "expo-router";
import { useLayoutEffect, useRef } from "react";
import { Platform, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon, type IconName } from "./Icon";
import { Text } from "./Text";
import { makeStyles, spacing, useTheme } from "./theme";

/**
 * A screen's main "create" action, placed where each platform expects it:
 * iOS: a button in the navigation bar (a prominent Liquid Glass button on iOS 26).
 * Android: a Material 3 extended floating action button, bottom-right.
 *
 * Render it anywhere inside the screen; on Android the parent must be a full-screen View.
 */
export function PrimaryAction({ label, icon, onPress }: { label: string; icon: IconName; onPress: () => void }) {
  if (Platform.OS === "ios") {
    return (
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button icon={icon.ios} variant="prominent" accessibilityLabel={label} onPress={onPress} />
      </Stack.Toolbar>
    );
  }
  return <Fab label={label} icon={icon} onPress={onPress} />;
}

function Fab({ label, icon, onPress }: { label: string; icon: IconName; onPress: () => void }) {
  const t = useTheme();
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  return (
    <View pointerEvents="box-none" style={[styles.fabWrap, { right: spacing.lg + insets.right }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={onPress}
        android_ripple={{ color: t.colors.ripple, foreground: true }}
        style={styles.fab}
      >
        <Icon name={icon} size={24} color={t.colors.onPrimarySoft} />
        <Text variant="bodyStrong" color={t.colors.onPrimarySoft} style={styles.fabLabel}>
          {label}
        </Text>
      </Pressable>
    </View>
  );
}

/**
 * A secondary action in the navigation bar (Edit, Share…): an SF Symbol button on iOS,
 * a Material icon button in the top app bar on Android.
 */
export function HeaderAction({ label, icon, onPress }: { label: string; icon: IconName; onPress: () => void }) {
  if (Platform.OS === "ios") {
    return (
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button icon={icon.ios} accessibilityLabel={label} onPress={onPress} />
      </Stack.Toolbar>
    );
  }
  return <AndroidHeaderAction label={label} icon={icon} onPress={onPress} />;
}

/**
 * Sets the top app bar action and removes it again when this unmounts, so a screen can
 * hide the action by not rendering it (a page-level Stack.Screen would leave it behind).
 */
function AndroidHeaderAction({ label, icon, onPress }: { label: string; icon: IconName; onPress: () => void }) {
  const navigation = useNavigation();
  // Latest handler without re-setting options on every render (that would loop).
  const press = useRef(onPress);
  useLayoutEffect(() => {
    press.current = onPress;
  });
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => <HeaderIconButton label={label} icon={icon} onPress={() => press.current()} />,
    });
    return () => navigation.setOptions({ headerRight: undefined });
  }, [navigation, label, icon]);
  return null;
}

function HeaderIconButton({ label, icon, onPress }: { label: string; icon: IconName; onPress: () => void }) {
  const t = useTheme();
  const styles = useStyles();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      android_ripple={{ color: t.colors.ripple, borderless: true, radius: 20 }}
      style={styles.iconButton}
      hitSlop={4}
    >
      <Icon name={icon} size={24} color={t.colors.textMuted} />
    </Pressable>
  );
}

const useStyles = makeStyles((t) => ({
  fabWrap: { position: "absolute", bottom: spacing.lg },
  fab: {
    height: 56,
    minWidth: 80,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingLeft: spacing.lg,
    paddingRight: spacing.xl - spacing.xs,
    borderRadius: 16,
    backgroundColor: t.colors.primarySoft,
    overflow: "hidden",
    elevation: 3,
  },
  fabLabel: { fontSize: 14, letterSpacing: 0.1 },
  iconButton: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
}));
