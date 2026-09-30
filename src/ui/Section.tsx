import type { ReactNode } from "react";
import { View } from "react-native";
import { Text } from "./Text";
import { makeStyles, spacing } from "./theme";

/** A titled group of content on a page (dashboard blocks, "History", …). */
export function Section({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  const styles = useStyles();
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text variant="heading" accessibilityRole="header">
          {title}
        </Text>
        {action}
      </View>
      {children}
    </View>
  );
}

const useStyles = makeStyles(() => ({
  section: { gap: spacing.md },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xs,
  },
}));
