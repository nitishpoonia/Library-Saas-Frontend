import { StyleSheet, View } from "react-native";
import type { StudentListItem } from "@/api/types";
import { formatPhone, formatRupees } from "@/lib/format";
import { Badge, Card, Text, colors, spacing } from "@/ui";
import { membershipStatus } from "./membershipStatus";

/** A row in the student list: who, which seat, and what needs attention. */
export function StudentCard({ student, onPress }: { student: StudentListItem; onPress: () => void }) {
  const m = student.current;
  const status = m ? membershipStatus(m) : null;
  return (
    <Card onPress={onPress} style={styles.card}>
      <View style={styles.top}>
        <View style={styles.flex}>
          <Text variant="bodyStrong" numberOfLines={1}>
            {student.name}
          </Text>
          <Text variant="caption">{formatPhone(student.phone)}</Text>
        </View>
        {status ? <Badge label={status.label} tone={status.tone} /> : <Badge label={student.archived ? "Removed" : "No seat"} />}
      </View>
      {m ? (
        <Text variant="caption">
          Seat {m.seatLabel} · {m.timing} · {status?.detail}
        </Text>
      ) : null}
      {student.pendingAmount > 0 ? (
        <Text variant="bodyStrong" color={colors.warning}>
          {formatRupees(student.pendingAmount)} fees pending
        </Text>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.xs },
  top: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  flex: { flex: 1 },
});
