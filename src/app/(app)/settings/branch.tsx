import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { keys } from "@/api/keys";
import type { Library } from "@/api/types";
import { useUpdateLibrary } from "@/features/account/mutations";
import { librariesApi } from "@/features/libraries/api";
import { useLibrary } from "@/session/CurrentLibrary";
import { Button, ErrorBanner, ErrorView, FormTextField, LoadingView, Screen, Text } from "@/ui";

const schema = z.object({
  name: z.string().trim().min(2, "At least 2 characters").max(100),
  address: z.string().trim().min(2, "At least 2 characters").max(300),
  gracePeriodDays: z.string().refine((v) => /^\d+$/.test(v) && Number(v) >= 1 && Number(v) <= 30, "1 to 30 days"),
});
type Values = z.infer<typeof schema>;

export default function BranchSettingsScreen() {
  const library = useLibrary();
  const details = useQuery({ queryKey: keys.libraryDetails(library.id), queryFn: () => librariesApi.get(library.id) });
  if (details.isLoading) return <LoadingView />;
  if (!details.data) return <ErrorView error={details.error} onRetry={() => details.refetch()} />;
  return <BranchForm library={details.data} />;
}

function BranchForm({ library }: { library: Library }) {
  const update = useUpdateLibrary(library.id);
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: library.name, address: library.address, gracePeriodDays: String(library.gracePeriodDays) },
  });

  const onSubmit = form.handleSubmit((v) =>
    update.mutate(
      { name: v.name, address: v.address, gracePeriodDays: Number(v.gracePeriodDays) },
      { onSuccess: () => router.back() },
    ),
  );

  return (
    <Screen form footer={<Button title="Save" onPress={onSubmit} loading={update.isPending} />}>
      <FormTextField control={form.control} name="name" label="Branch name" />
      <FormTextField control={form.control} name="address" label="Address" />
      <FormTextField control={form.control} name="gracePeriodDays" label="Hold seats for (days)" keyboardType="number-pad" />
      <Text variant="caption">
        When a membership ends without renewal, the seat stays reserved for this many days. The student is warned the day
        before it's released.
      </Text>
      <ErrorBanner error={update.error} />
    </Screen>
  );
}
