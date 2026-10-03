import { ActivityIndicator, StyleSheet, View } from "react-native";
import { errorMessage } from "@/api/errors";
import { Button } from "./Button";
import { Text } from "./Text";
import { colors, spacing } from "./theme";

export function LoadingView() {
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

/** Shown when a query fails, instead of blank data (REVIEW FD1). */
export function ErrorView({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  return (
    <View style={styles.center}>
      <Text variant="subheading" style={styles.centerText}>
        {errorMessage(error)}
      </Text>
      {onRetry ? <Button title="Try again" variant="secondary" onPress={onRetry} /> : null}
    </View>
  );
}

export function EmptyView({ title, message, action }: { title: string; message?: string; action?: React.ReactNode }) {
  return (
    <View style={styles.center}>
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

/** A red box for a form-level error (e.g. wrong password). */
export function ErrorBanner({ error }: { error: unknown }) {
  if (!error) return null;
  return (
    <View style={styles.banner} accessibilityRole="alert">
      <Text variant="body" color={colors.dangerText}>
        {errorMessage(error)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xl, gap: spacing.md },
  centerText: { textAlign: "center" },
  banner: {
    backgroundColor: colors.dangerSoft,
    borderColor: "#FECACA",
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.md,
  },
});
