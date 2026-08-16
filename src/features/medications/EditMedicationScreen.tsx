import { useRouter } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { palette, spacing } from '../../shared/theme/tokens';
import { AppButton } from '../../shared/ui/AppButton';
import {
  MedicationForm,
  type MedicationFormValues,
} from './components/MedicationForm';
import { useMedicationEditor } from './useMedicationEditor';

interface EditMedicationScreenProps {
  medicationId: string;
}

export const EditMedicationScreen = ({
  medicationId,
}: EditMedicationScreenProps) => {
  const router = useRouter();
  const { initialValues, isLoading, loadError, isSaving, saveMedication } =
    useMedicationEditor(medicationId);

  const handleSave = async (values: MedicationFormValues) => {
    const saved = await saveMedication(values);

    if (saved) {
      router.back();
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={palette.primary} />
      </View>
    );
  }

  if (loadError || !initialValues) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>
          {loadError ?? 'No se pudo cargar el medicamento.'}
        </Text>

        <View style={styles.errorAction}>
          <AppButton label="Volver" onPress={() => router.back()} variant="ghost" />
        </View>
      </View>
    );
  }

  return (
    <MedicationForm
      initialValues={initialValues}
      submitLabel="Guardar cambios"
      submittingLabel="Guardando..."
      isSubmitting={isSaving}
      onSubmit={handleSave}
      onCancel={() => router.back()}
    />
  );
};

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: palette.background,
  },
  errorText: {
    fontSize: 16,
    color: palette.textSecondary,
    textAlign: 'center',
  },
  errorAction: {
    marginTop: spacing.lg,
    alignSelf: 'stretch',
  },
});
