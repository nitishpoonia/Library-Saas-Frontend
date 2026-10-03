import { useState } from "react";
import { Alert, Pressable, StyleSheet, Switch, View } from "react-native";
import { errorMessage } from "@/api/errors";
import type { Seat } from "@/api/types";
import { useSeatMutations, useSeats } from "@/features/seats/queries";
import { useLibrary } from "@/session/CurrentLibrary";
import { Button, Card, ErrorView, LoadingView, Screen, Section, Text, TextField, colors, spacing } from "@/ui";

/** Add, rename and remove seats (owner and manager). */
export default function SeatsScreen() {
  const library = useLibrary();
  const seats = useSeats(library.id);
  const { add } = useSeatMutations(library.id);
  const [count, setCount] = useState("");
  const [label, setLabel] = useState("");
  const [editing, setEditing] = useState<number | null>(null);

  if (seats.isLoading) return <LoadingView />;
  if (!seats.data) return <ErrorView error={seats.error} onRetry={() => seats.refetch()} />;

  const addNumbered = () => {
    const n = Number(count);
    if (!Number.isInteger(n) || n < 1 || n > 500) return Alert.alert("Enter how many seats to add (1–500)");
    add.mutate({ count: n }, { onSuccess: () => setCount(""), onError: (e) => Alert.alert("Couldn't add seats", errorMessage(e)) });
  };
  const addLabelled = () => {
    if (!label.trim()) return;
    add.mutate({ label: label.trim() }, { onSuccess: () => setLabel(""), onError: (e) => Alert.alert("Couldn't add the seat", errorMessage(e)) });
  };

  return (
    <Screen edges={["bottom", "left", "right"]}>
      <Text variant="body" color={colors.textMuted}>
        {seats.data.length} seats. Tap a seat to rename it, mark a locker or remove it.
      </Text>

      <Section title="Add seats">
        <View style={styles.row}>
          <View style={styles.flex}>
            <TextField placeholder="How many" keyboardType="number-pad" value={count} onChangeText={setCount} />
          </View>
          <Button title="Add numbered" onPress={addNumbered} loading={add.isPending} />
        </View>
        <View style={styles.row}>
          <View style={styles.flex}>
            <TextField placeholder="Custom name, e.g. A1" value={label} onChangeText={setLabel} autoCapitalize="characters" />
          </View>
          <Button title="Add" variant="secondary" onPress={addLabelled} />
        </View>
      </Section>

      <Section title="Seats">
        {seats.data.map((seat) =>
          editing === seat.id ? (
            <SeatEditor key={seat.id} seat={seat} onDone={() => setEditing(null)} />
          ) : (
            <Pressable key={seat.id} accessibilityRole="button" onPress={() => setEditing(seat.id)} style={styles.seatRow}>
              <Text variant="bodyStrong" style={styles.flex}>
                Seat {seat.label}
              </Text>
              {seat.hasLocker ? <Text variant="caption">Locker</Text> : null}
            </Pressable>
          ),
        )}
      </Section>
    </Screen>
  );
}

function SeatEditor({ seat, onDone }: { seat: Seat; onDone: () => void }) {
  const library = useLibrary();
  const { update, remove } = useSeatMutations(library.id);
  const [label, setLabel] = useState(seat.label);
  const [hasLocker, setHasLocker] = useState(seat.hasLocker);

  const save = () =>
    update.mutate(
      { seatId: seat.id, label: label.trim(), hasLocker },
      { onSuccess: onDone, onError: (e) => Alert.alert("Couldn't save", errorMessage(e)) },
    );

  const confirmRemove = () =>
    Alert.alert(`Remove seat ${seat.label}?`, "Only possible when nobody has it booked now or later.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => remove.mutate(seat.id, { onSuccess: onDone, onError: (e) => Alert.alert("Can't remove this seat", errorMessage(e)) }),
      },
    ]);

  return (
    <Card style={styles.editor}>
      <TextField label="Seat name" value={label} onChangeText={setLabel} autoCapitalize="characters" />
      <View style={styles.row}>
        <Switch value={hasLocker} onValueChange={setHasLocker} />
        <Text variant="body">Has a locker</Text>
      </View>
      <View style={styles.row}>
        <Button style={styles.flex} title="Save" onPress={save} loading={update.isPending} />
        <Button style={styles.flex} title="Cancel" variant="ghost" onPress={onDone} />
      </View>
      <Button title="Remove seat" variant="danger" onPress={confirmRemove} loading={remove.isPending} />
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  flex: { flex: 1 },
  seatRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  editor: { gap: spacing.md },
});
