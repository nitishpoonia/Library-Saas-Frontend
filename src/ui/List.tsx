import { Children, isValidElement, type ReactNode } from "react";
import { Color } from "expo-router";
import { Platform, Pressable, Switch, View, type ColorValue } from "react-native";
import { Icon, icons, type IconName } from "./Icon";
import { Text } from "./Text";
import { makeStyles, radius, spacing, useTheme } from "./theme";

const isIOS = Platform.OS === "ios";

/** Colors for the icon tiles on iOS rows, like the Settings app (Android rows use plain icons). */
export const tileColors = {
  blue: Color.ios.systemBlue,
  green: Color.ios.systemGreen,
  orange: Color.ios.systemOrange,
  indigo: Color.ios.systemIndigo,
  gray: Color.ios.systemGray,
  red: Color.ios.systemRed,
  teal: Color.ios.systemTeal,
} as const;

/**
 * A group of rows.
 * iOS: an inset-grouped list, like the Settings app (rounded block, hairlines between
 * rows, small header above and footnote below).
 * Android: a Material 3 list: flat rows on the page, with a primary-colored subheader.
 */
export function ListSection({ title, footer, children }: { title?: string; footer?: string; children: ReactNode }) {
  const styles = useStyles();
  const rows = Children.toArray(children).filter(isValidElement);
  return (
    <View style={styles.section}>
      {title ? (
        <Text variant="label" accessibilityRole="header" style={styles.header}>
          {isIOS ? title.toUpperCase() : title}
        </Text>
      ) : null}
      <View style={styles.group}>
        {rows.map((row, i) => (
          <View key={row.key ?? i}>
            {row}
            {isIOS && i < rows.length - 1 ? (
              <View style={[styles.separator, (row.props as { icon?: unknown }).icon ? styles.separatorInset : null]} />
            ) : null}
          </View>
        ))}
      </View>
      {footer ? (
        <Text variant="label" style={styles.footer}>
          {footer}
        </Text>
      ) : null}
    </View>
  );
}

type RowProps = {
  title: string;
  subtitle?: string;
  /** Leading icon. On iOS it sits on a colored tile, like Settings. */
  icon?: IconName;
  /** Tile color on iOS (defaults to the tint color). */
  iconColor?: ColorValue;
  /** Text on the trailing side (a count, a current value). */
  value?: string;
  /** Anything on the trailing side (a badge, a switch). */
  trailing?: ReactNode;
  selected?: boolean;
  destructive?: boolean;
  onPress?: () => void;
  /** Shows a chevron on iOS; defaults to on when the row navigates. */
  chevron?: boolean;
};

export function ListRow({
  title,
  subtitle,
  icon,
  iconColor,
  value,
  trailing,
  selected,
  destructive,
  onPress,
  chevron = !!onPress && !destructive,
}: RowProps) {
  const t = useTheme();
  const styles = useStyles();
  const titleColor = destructive ? t.colors.danger : t.colors.text;

  const leading = icon ? (
    isIOS ? (
      <View style={[styles.tile, { backgroundColor: destructive ? t.colors.danger : (iconColor ?? t.colors.primary) }]}>
        <Icon name={icon} size={17} color="#FFFFFF" />
      </View>
    ) : (
      <Icon name={icon} size={24} color={destructive ? t.colors.danger : t.colors.textMuted} />
    )
  ) : null;

  const body = (
    <>
      {leading}
      <View style={styles.texts}>
        <Text variant="body" color={titleColor} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="caption" numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {value ? (
        <Text variant="body" color={t.colors.textMuted} numberOfLines={1} style={styles.value}>
          {value}
        </Text>
      ) : null}
      {trailing}
      {selected ? <Icon name={icons.check} size={isIOS ? 18 : 24} color={t.colors.primary} /> : null}
      {isIOS && chevron ? <Icon name={icons.forward} size={14} color={t.colors.textFaint} /> : null}
    </>
  );

  if (!onPress) {
    return <View style={[styles.row, subtitle ? styles.tall : null]}>{body}</View>;
  }
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={[title, subtitle, value].filter(Boolean).join(", ")}
      onPress={onPress}
      android_ripple={{ color: t.colors.ripple }}
      style={({ pressed }) => [styles.row, subtitle ? styles.tall : null, isIOS && pressed && styles.pressed]}
    >
      {body}
    </Pressable>
  );
}

/**
 * One cell of a long list rendered by FlashList, where ListSection can't wrap the rows.
 * iOS: pieces of an inset-grouped block (round the first and last, hairlines between).
 * Android: a flat Material list row with ripple.
 * The list's content container should use `listContentStyle` so the edges line up.
 */
export function ListCell({
  first,
  last,
  onPress,
  accessibilityLabel,
  inset = spacing.lg,
  children,
}: {
  first: boolean;
  last: boolean;
  onPress?: () => void;
  accessibilityLabel?: string;
  /** Where the iOS hairline starts (after an avatar, say). */
  inset?: number;
  children: ReactNode;
}) {
  const t = useTheme();
  const styles = useStyles();
  return (
    <View style={[isIOS && styles.cellIOS, isIOS && first && styles.cellFirst, isIOS && last && styles.cellLast]}>
      <Pressable
        accessibilityRole={onPress ? "button" : undefined}
        accessibilityLabel={accessibilityLabel}
        disabled={!onPress}
        onPress={onPress}
        android_ripple={{ color: t.colors.ripple }}
        style={({ pressed }) => [styles.cell, isIOS && pressed && styles.pressed]}
      >
        {children}
      </Pressable>
      {isIOS && !last ? <View style={[styles.separator, { marginLeft: inset }]} /> : null}
    </View>
  );
}

/** Content padding for FlashLists made of ListCells. */
export const listContentStyle = isIOS
  ? { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl }
  : { paddingBottom: 96 };

/** A row with an on/off switch, styled for each platform. */
export function ListSwitchRow({
  title,
  subtitle,
  icon,
  iconColor,
  value,
  onValueChange,
  disabled,
}: Omit<RowProps, "onPress" | "trailing" | "value" | "chevron" | "selected" | "destructive"> & {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <ListRow
      title={title}
      subtitle={subtitle}
      icon={icon}
      iconColor={iconColor}
      trailing={<Toggle value={value} onValueChange={onValueChange} disabled={disabled} accessibilityLabel={title} />}
    />
  );
}

/** The platform switch, with Material 3 colors on Android. */
export function Toggle({
  value,
  onValueChange,
  disabled,
  accessibilityLabel,
}: {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  accessibilityLabel?: string;
}) {
  const t = useTheme();
  return (
    <Switch
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      accessibilityLabel={accessibilityLabel}
      {...(isIOS
        ? {}
        : {
            trackColor: { true: t.colors.primary, false: t.colors.fill },
            thumbColor: value ? t.colors.onPrimary : t.colors.borderStrong,
          })}
    />
  );
}

const useStyles = makeStyles((t) => ({
  section: { gap: isIOS ? spacing.sm : 0 },
  header: isIOS
    ? { paddingHorizontal: spacing.lg }
    : {
        paddingTop: spacing.sm,
        paddingBottom: spacing.sm,
        color: t.colors.primary,
        fontSize: 14,
        letterSpacing: 0.1,
      },
  group: isIOS
    ? { backgroundColor: t.colors.surface, borderRadius: radius.lg, borderCurve: "continuous", overflow: "hidden" }
    : { marginHorizontal: -spacing.lg },
  footer: isIOS ? { paddingHorizontal: spacing.lg } : { paddingTop: spacing.xs },
  row: isIOS
    ? {
        minHeight: 48,
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.md,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
      }
    : {
        minHeight: 56,
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.lg,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
      },
  tall: isIOS ? { minHeight: 60 } : { minHeight: 72 },
  cellIOS: { backgroundColor: t.colors.surface, overflow: "hidden", borderCurve: "continuous" },
  cellFirst: { borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg },
  cellLast: { borderBottomLeftRadius: radius.lg, borderBottomRightRadius: radius.lg },
  cell: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: isIOS ? 60 : 72,
  },
  pressed: { backgroundColor: t.colors.fill },
  texts: { flex: 1, gap: 1 },
  value: { flexShrink: 1, maxWidth: "45%" },
  tile: {
    width: 30,
    height: 30,
    borderRadius: 7,
    borderCurve: "continuous",
    alignItems: "center",
    justifyContent: "center",
  },
  // Hairline starts under the text, not under the icon, like iOS lists.
  separator: { height: 0.5, backgroundColor: t.colors.border, marginLeft: spacing.lg },
  separatorInset: { marginLeft: spacing.lg + 30 + spacing.md },
}));
