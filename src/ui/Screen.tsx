import type { ReactNode } from "react";
import { RefreshControl, ScrollView, StyleSheet, View, type ViewStyle } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";
import { colors, spacing } from "./theme";

type Props = {
  children: ReactNode;
  /** Scroll the content (default). Lists that scroll themselves pass false. */
  scroll?: boolean;
  /** Keeps focused inputs above the keyboard. Use on form screens. */
  form?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  edges?: Edge[];
  contentStyle?: ViewStyle;
  footer?: ReactNode;
};

/** Page frame: safe area, white background, standard padding. */
export function Screen({
  children,
  scroll = true,
  form,
  refreshing,
  onRefresh,
  edges = ["top", "left", "right"],
  contentStyle,
  footer,
}: Props) {
  const content = [styles.content, contentStyle];
  const refresh = onRefresh ? (
    <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
  ) : undefined;

  let body: ReactNode;
  if (form) {
    body = (
      <KeyboardAwareScrollView contentContainerStyle={content} keyboardShouldPersistTaps="handled" bottomOffset={spacing.xl}>
        {children}
      </KeyboardAwareScrollView>
    );
  } else if (scroll) {
    body = (
      <ScrollView contentContainerStyle={content} refreshControl={refresh} keyboardShouldPersistTaps="handled">
        {children}
      </ScrollView>
    );
  } else {
    body = <View style={[styles.fill, ...content]}>{children}</View>;
  }

  return (
    <SafeAreaView style={styles.fill} edges={edges}>
      {body}
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.lg },
  footer: {
    padding: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
});
