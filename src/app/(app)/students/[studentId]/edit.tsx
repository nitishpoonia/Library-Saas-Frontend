import { zodResolver } from "@hookform/resolvers/zod";
import { router, useLocalSearchParams } from "expo-router";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { applyServerErrors } from "@/features/auth/useServerErrors";
import { useStudent, useUpdateStudent } from "@/features/students/queries";
import { cleanPhone, name, phone } from "@/features/students/schemas";
import { useLibrary } from "@/session/CurrentLibrary";
import { Button, ErrorBanner, ErrorView, FormTextField, LoadingView, Screen } from "@/ui";

const schema = z.object({ name, phone });
type Values = z.infer<typeof schema>;

export default function EditStudentScreen() {
  const library = useLibrary();
  const { studentId } = useLocalSearchParams<{ studentId: string }>();
  const student = useStudent(library.id, Number(studentId));

  if (student.isLoading) return <LoadingView />;
  if (!student.data) return <ErrorView error={student.error} onRetry={() => student.refetch()} />;
  return <EditForm studentId={Number(studentId)} initial={{ name: student.data.name, phone: student.data.phone.replace(/^\+91/, "") }} />;
}

function EditForm({ studentId, initial }: { studentId: number; initial: Values }) {
  const library = useLibrary();
  const update = useUpdateStudent(library.id, studentId);
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: initial });

  const onSubmit = form.handleSubmit((v) =>
    update.mutate(
      { name: v.name, phone: cleanPhone(v.phone) },
      {
        onSuccess: () => router.back(),
        onError: (error) => applyServerErrors(error, form.setError, ["name", "phone"]),
      },
    ),
  );

  return (
    <Screen form edges={["bottom", "left", "right"]} footer={<Button title="Save" onPress={onSubmit} loading={update.isPending} />}>
      <FormTextField control={form.control} name="name" label="Name" autoCapitalize="words" />
      <FormTextField control={form.control} name="phone" label="Mobile number" keyboardType="phone-pad" />
      <ErrorBanner error={update.error && !Object.keys(form.formState.errors).length ? update.error : null} />
    </Screen>
  );
}
