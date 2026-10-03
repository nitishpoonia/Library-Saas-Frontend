import { View } from "react-native";
import type { StudentListItem } from "@/api/types";
import { formatPhone, formatRupees } from "@/lib/format";
import { Badge, ListCell, Text, makeStyles, spacing, useTheme } from "@/ui";
import { membershipStatus } from "./membershipStatus";

const AVATAR = 40;

/** A row in the student list: who, which seat, and what needs attention. */
export function StudentRow({
  student,
  onPress,
  first,
  last,
}: {
  student: StudentListItem;
  onPress: () => void;
  first: boolean;
  last: boolean;
}) {
  const t = useTheme();
  const styles = useStyles();
  const m = student.current;
  const status = m ? membershipStatus(m) : null;
  const badge = status ? <Badge label={status.label} tone={status.tone} /> : <Badge label={student.archived ? "Removed" : "No seat"} />;

  return (
    <ListCell
      first={first}
      last={last}
      onPress={onPress}
      inset={spacing.lg + AVATAR + spacing.md}
    >
      <View style={styles.avatar}>
        <Text variant="bodyStrong" color={t.colors.onPrimarySoft}>
          {initials(student.name)}
        </Text>
      </View>
      <View style={styles.texts}>
        <View style={styles.top}>
          <Text variant="bodyStrong" numberOfLines={1} style={styles.name}>
            {student.name}
          </Text>
          {badge}
        </View>
        <Text variant="caption" numberOfLines={1}>
          {formatPhone(student.phone)}
        </Text>
        {m ? (
          <Text variant="caption" numberOfLines={1}>
            Seat {m.seatLabel} · {m.timing} · {status?.detail}
          </Text>
        ) : null}
        {student.pendingAmount > 0 ? (
          <Text variant="caption" color={t.colors.warning}>
            {formatRupees(student.pendingAmount)} fees pending
          </Text>
        ) : null}
      </View>
    </ListCell>
  );
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "")).toUpperCase();
}

const useStyles = makeStyles((t) => ({
  avatar: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
    backgroundColor: t.colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  texts: { flex: 1, gap: 2 },
  top: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  name: { flex: 1 },
}));
