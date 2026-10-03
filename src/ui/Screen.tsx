import type { ReactNode } from "react";
import { Platform, RefreshControl, ScrollView, View, type ViewStyle } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";
import { makeStyles, spacing, useTheme } from "./theme";

type Props = {
  children: ReactNode;
  /** Scroll the content (default). Lists that scroll themselves pass false. */
  scroll?: boolean;
  /** Keeps focused inputs above the keyboard. Use on form screens. */
  form?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  /**
   * Safe-area edges to pad on Android (default: sides and bottom; add "top" on screens
   * without a header). On iOS the scroll view adjusts itself for the header, tab bar and
   * home indicator, which is also what lets large titles collapse as you scroll.
   */
  edges?: Edge[];
  contentStyle?: ViewStyle;
  /** A bar pinned under the content, for the screen's main button. */
  footer?: ReactNode;
};

const isIOS = Platform.OS === "ios";

/** Page frame: platform background, safe areas, standard padding. */
export function Screen({
  children,
  scroll = true,
  form,
  refreshing,
  onRefresh,
  edges = ["left", "right", "bottom"],
  contentStyle,
  footer,
}: Props) {
  const t = useTheme();
  const styles = useStyles();
  const content = [styles.content, contentStyle];
  const refresh = onRefresh ? (
    <RefreshControl
      refreshing={!!refreshing}
      onRefresh={onRefresh}
      tintColor={t.colors.textMuted}
      colors={[t.colors.primary as string]}
      progressBackgroundColor={t.colors.surface as string}
    />
  ) : undefined;

  // With a footer, the footer owns the bottom inset instead of the scroll view.
  const bodyEdges = footer ? edges.filter((e) => e !== "bottom") : edges;

  let body: ReactNode;
  if (form) {
    body = (
      <KeyboardAwareScrollView
        contentContainerStyle={content}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        bottomOffset={spacing.xl}
        style={styles.fill}
      >
        {children}
      </KeyboardAwareScrollView>
    );
  } else if (scroll) {
    body = (
      <ScrollView
        contentContainerStyle={content}
        contentInsetAdjustmentBehavior="automatic"
        refreshControl={refresh}
        keyboardShouldPersistTaps="handled"
        style={styles.fill}
      >
        {children}
      </ScrollView>
    );
  } else {
    body = <View style={[styles.fill, ...content]}>{children}</View>;
  }

  const footerBar = footer ? (
    <SafeAreaView edges={["bottom", "left", "right"]} style={styles.footer}>
      {footer}
    </SafeAreaView>
  ) : null;

  if (isIOS && scroll) {
    return (
      <View style={styles.page}>
        {body}
        {footerBar}
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.page} edges={isIOS ? bodyEdges.filter((e) => e !== "top") : bodyEdges}>
      {body}
      {footerBar}
    </SafeAreaView>
  );
}

const useStyles = makeStyles((t) => ({
  page: { flex: 1, backgroundColor: t.colors.background },
  fill: { flex: 1 },
  content: { padding: spacing.lg, gap: isIOS ? spacing.xl : spacing.lg, paddingBottom: spacing.xxl },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    backgroundColor: t.colors.background,
  },
}));
