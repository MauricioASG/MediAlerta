import { useLocalSearchParams } from 'expo-router';

import { EditMedicationScreen } from '../../src/features/medications';

export default function EditMedication() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <EditMedicationScreen medicationId={id} />;
}
