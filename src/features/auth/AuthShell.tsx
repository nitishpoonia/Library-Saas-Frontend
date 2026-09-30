import type { ReactNode } from "react";
import { Image, StyleSheet, View } from "react-native";
import { Screen, Text, spacing } from "@/ui";

/** Shared frame for the sign-in and sign-up screens. */
export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <Screen form edges={["top", "bottom", "left", "right"]} contentStyle={styles.content}>
      <View style={styles.header}>
        <Image source={require("../../../assets/images/icon.png")} style={styles.logo} />
        <Text variant="title">{title}</Text>
        <Text variant="body" color="#6B7280">
          {subtitle}
        </Text>
      </View>
      {children}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: spacing.xxl * 1.5, gap: spacing.lg },
  header: { gap: spacing.sm, marginBottom: spacing.md },
  logo: { width: 56, height: 56, borderRadius: 14, marginBottom: spacing.sm },
});
