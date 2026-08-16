import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';

import {
  EMPTY_MEDICATION_FORM,
  MedicationForm,
  type MedicationFormValues,
} from './components/MedicationForm';
import { useMedications } from './useMedications';

export const AddMedicationScreen = () => {
  const router = useRouter();
  const { addMedication } = useMedications();

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (values: MedicationFormValues) => {
    try {
      setIsSaving(true);

      await addMedication(values);

      router.back();
    } catch (error) {
      console.error('[Medications] Error creating medication:', error);
      Alert.alert('Error', 'No se pudo guardar el medicamento.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <MedicationForm
      initialValues={EMPTY_MEDICATION_FORM}
      submitLabel="Guardar medicamento"
      submittingLabel="Guardando..."
      isSubmitting={isSaving}
      onSubmit={handleSave}
      onCancel={() => router.back()}
    />
  );
};
