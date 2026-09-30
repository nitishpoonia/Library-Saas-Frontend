import { Link, type Href } from "expo-router";
import type { ReactNode } from "react";
import { Image, View } from "react-native";
import { Screen, Text, makeStyles, spacing, useTheme } from "@/ui";

/** Shared frame for the sign-in and sign-up screens. */
export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  const t = useTheme();
  const styles = useStyles();
  return (
    <Screen form edges={["top", "bottom", "left", "right"]} contentStyle={styles.content}>
      <View style={styles.header}>
        <Image source={require("../../../assets/images/icon.png")} style={styles.logo} accessibilityIgnoresInvertColors />
        <Text variant="title" accessibilityRole="header">
          {title}
        </Text>
        <Text variant="body" color={t.colors.textMuted} style={styles.subtitle}>
          {subtitle}
        </Text>
      </View>
      {children}
    </Screen>
  );
}

/** "New here? Create an account" under the form. */
export function AuthSwitch({ prompt, action, href }: { prompt: string; action: string; href: Href }) {
  const t = useTheme();
  const styles = useStyles();
  return (
    <View style={styles.switch}>
      <Text variant="body" color={t.colors.textMuted}>
        {prompt}
      </Text>
      <Link href={href} replace accessibilityRole="link">
        <Text variant="bodyStrong" color={t.colors.primary}>
          {action}
        </Text>
      </Link>
    </View>
  );
}

const useStyles = makeStyles(() => ({
  content: { paddingTop: spacing.xxl * 1.5, gap: spacing.lg },
  header: { gap: spacing.sm, marginBottom: spacing.md, alignItems: "center" },
  logo: { width: 72, height: 72, borderRadius: 16, borderCurve: "continuous", marginBottom: spacing.sm },
  subtitle: { textAlign: "center" },
  switch: { flexDirection: "row", justifyContent: "center", flexWrap: "wrap", gap: spacing.xs, marginTop: spacing.sm },
}));
