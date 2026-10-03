import { useState } from "react";
import { Alert, View } from "react-native";
import { errorMessage } from "@/api/errors";
import type { Seat } from "@/api/types";
import { useSeatMutations, useSeats } from "@/features/seats/queries";
import { useLibrary } from "@/session/CurrentLibrary";
import {
  Button,
  ErrorView,
  ListRow,
  ListSection,
  ListSwitchRow,
  LoadingView,
  Screen,
  Section,
  Text,
  TextField,
  icons,
  makeStyles,
  spacing,
} from "@/ui";

/** Add, rename and remove seats (owner and manager). */
export default function SeatsScreen() {
  const library = useLibrary();
  const seats = useSeats(library.id);
  const { add } = useSeatMutations(library.id);
  const [count, setCount] = useState("");
  const [label, setLabel] = useState("");
  const [editing, setEditing] = useState<number | null>(null);
  const styles = useStyles();

  if (seats.isLoading) return <LoadingView />;
  if (!seats.data) return <ErrorView error={seats.error} onRetry={() => seats.refetch()} />;
  const editIndex = editing === null ? -1 : seats.data.findIndex((s) => s.id === editing);

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
    <Screen>
      <Text variant="caption" style={styles.intro}>
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

      {/* The seat being edited opens in place, splitting the list around it. */}
      {editIndex < 0 ? (
        <SeatList title="Seats" seats={seats.data} onPick={setEditing} />
      ) : (
        <>
          {editIndex > 0 ? <SeatList title="Seats" seats={seats.data.slice(0, editIndex)} onPick={setEditing} /> : null}
          <SeatEditor key={editing} seat={seats.data[editIndex]!} onDone={() => setEditing(null)} />
          <SeatList title={editIndex === 0 ? "Seats" : undefined} seats={seats.data.slice(editIndex + 1)} onPick={setEditing} />
        </>
      )}
    </Screen>
  );
}

function SeatList({ title, seats, onPick }: { title?: string; seats: Seat[]; onPick: (id: number) => void }) {
  if (!seats.length) return null;
  return (
    <ListSection title={title}>
      {seats.map((seat) => (
        <ListRow
          key={seat.id}
          title={`Seat ${seat.label}`}
          icon={icons.seats}
          value={seat.hasLocker ? "Locker" : undefined}
          onPress={() => onPick(seat.id)}
        />
      ))}
    </ListSection>
  );
}

function SeatEditor({ seat, onDone }: { seat: Seat; onDone: () => void }) {
  const library = useLibrary();
  const { update, remove } = useSeatMutations(library.id);
  const [label, setLabel] = useState(seat.label);
  const [hasLocker, setHasLocker] = useState(seat.hasLocker);
  const styles = useStyles();

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
    <Section title={`Edit seat ${seat.label}`}>
      <TextField label="Seat name" value={label} onChangeText={setLabel} autoCapitalize="characters" />
      <ListSection>
        <ListSwitchRow title="Has a locker" value={hasLocker} onValueChange={setHasLocker} />
      </ListSection>
      <View style={styles.row}>
        <Button style={styles.flex} title="Save" onPress={save} loading={update.isPending} />
        <Button style={styles.flex} title="Cancel" variant="ghost" onPress={onDone} />
      </View>
      <Button title="Remove seat" variant="danger" onPress={confirmRemove} loading={remove.isPending} />
    </Section>
  );
}

const useStyles = makeStyles(() => ({
  intro: { paddingHorizontal: spacing.xs },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  flex: { flex: 1 },
}));
