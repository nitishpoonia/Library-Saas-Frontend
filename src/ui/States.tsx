import type { ReactNode } from "react";
import { ActivityIndicator, Platform, ScrollView, View } from "react-native";
import { errorMessage } from "@/api/errors";
import { Button } from "./Button";
import { Icon, icons, type IconName } from "./Icon";
import { Text } from "./Text";
import { makeStyles, radius, spacing, useTheme } from "./theme";

export function LoadingView() {
  const t = useTheme();
  const styles = useStyles();
  return (
    <View style={[styles.center, styles.page]}>
      <ActivityIndicator size="large" color={Platform.OS === "ios" ? undefined : t.colors.primary} />
    </View>
  );
}

/** Shown when a query fails, instead of blank data (REVIEW FD1). */
export function ErrorView({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const t = useTheme();
  const styles = useStyles();
  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={styles.center}
      contentInsetAdjustmentBehavior="automatic"
    >
      <Icon name={icons.warning} size={40} color={t.colors.textFaint} />
      <Text variant="subheading" style={styles.centerText}>
        {errorMessage(error)}
      </Text>
      {onRetry ? <Button title="Try again" variant="secondary" onPress={onRetry} /> : null}
    </ScrollView>
  );
}

export function EmptyView({
  title,
  message,
  action,
  icon,
}: {
  title: string;
  message?: string;
  action?: ReactNode;
  icon?: IconName;
}) {
  const t = useTheme();
  const styles = useStyles();
  return (
    <View style={[styles.center, styles.empty]}>
      {icon ? <Icon name={icon} size={44} color={t.colors.textFaint} /> : null}
      <Text variant="subheading" style={styles.centerText}>
        {title}
      </Text>
      {message ? (
        <Text variant="caption" style={styles.centerText}>
          {message}
        </Text>
      ) : null}
      {action}
    </View>
  );
}

/** A tinted box for a form-level error (e.g. wrong password). */
export function ErrorBanner({ error }: { error: unknown }) {
  const t = useTheme();
  const styles = useStyles();
  if (!error) return null;
  return (
    <View style={styles.banner} accessibilityRole="alert">
      <Icon name={icons.warning} size={18} color={t.colors.dangerText} />
      <Text variant="caption" color={t.colors.dangerText} style={styles.bannerText}>
        {errorMessage(error)}
      </Text>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  page: { flex: 1, backgroundColor: t.colors.background },
  center: { flexGrow: 1, alignItems: "center", justifyContent: "center", padding: spacing.xl, gap: spacing.md },
  empty: { paddingVertical: spacing.xxl * 2 },
  centerText: { textAlign: "center" },
  banner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    backgroundColor: t.colors.dangerSoft,
    borderRadius: radius.md,
    borderCurve: "continuous",
    padding: spacing.md,
  },
  bannerText: { flex: 1 },
}));
