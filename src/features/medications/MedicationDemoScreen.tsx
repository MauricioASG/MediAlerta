import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { DEFAULT_MEDICATION_TYPE } from '../../shared/constants/medicationTypes';
import type { Medication } from '../../types/medication.types';
import {
  createMedication,
  deactivateMedication,
  getActiveMedications,
} from './medication.repository';

export const MedicationDemoScreen = () => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [instructions, setInstructions] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const loadMedications = useCallback(async () => {
    try {
      const activeMedications = await getActiveMedications();
      setMedications(activeMedications);
    } catch (error) {
      console.error('[Medications] Error loading medications:', error);
      Alert.alert('Error', 'No se pudieron cargar los medicamentos.');
    }
  }, []);

  useEffect(() => {
    loadMedications();
  }, [loadMedications]);

  const handleCreateMedication = async () => {
    if (!name.trim()) {
      Alert.alert('Dato requerido', 'Ingresa el nombre del medicamento.');
      return;
    }

    if (!dosage.trim()) {
      Alert.alert('Dato requerido', 'Ingresa la dosis del medicamento.');
      return;
    }

    try {
      setIsLoading(true);

      await createMedication({
        name,
        type: DEFAULT_MEDICATION_TYPE,
        dosage,
        instructions: instructions || null,
        startDate: new Date().toISOString(),
        endDate: null,
      });

      setName('');
      setDosage('');
      setInstructions('');

      await loadMedications();
    } catch (error) {
      console.error('[Medications] Error creating medication:', error);
      Alert.alert('Error', 'No se pudo guardar el medicamento.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeactivateMedication = async (medicationId: string) => {
    try {
      await deactivateMedication(medicationId);
      await loadMedications();
    } catch (error) {
      console.error('[Medications] Error deactivating medication:', error);
      Alert.alert('Error', 'No se pudo desactivar el medicamento.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>MediAlerta</Text>
      <Text style={styles.subtitle}>Prueba local de medicamentos con SQLite</Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Nuevo medicamento</Text>

        <Text style={styles.label}>Nombre</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Ej. Metformina 850 mg"
          style={styles.input}
        />

        <Text style={styles.label}>Dosis</Text>
        <TextInput
          value={dosage}
          onChangeText={setDosage}
          placeholder="Ej. 1 tableta"
          style={styles.input}
        />

        <Text style={styles.label}>Instrucciones</Text>
        <TextInput
          value={instructions}
          onChangeText={setInstructions}
          placeholder="Ej. Tomar después de comer"
          style={[styles.input, styles.textArea]}
          multiline
        />

        <Pressable
          onPress={handleCreateMedication}
          disabled={isLoading}
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.buttonPressed,
            isLoading && styles.buttonDisabled,
          ]}
        >
          <Text style={styles.primaryButtonText}>
            {isLoading ? 'Guardando...' : 'Guardar medicamento'}
          </Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Medicamentos activos</Text>

        {medications.length === 0 ? (
          <Text style={styles.emptyText}>Todavía no hay medicamentos guardados.</Text>
        ) : (
          medications.map((medication) => (
            <View key={medication.id} style={styles.medicationItem}>
              <View style={styles.medicationInfo}>
                <Text style={styles.medicationName}>{medication.name}</Text>
                <Text style={styles.medicationDosage}>{medication.dosage}</Text>

                {medication.instructions ? (
                  <Text style={styles.medicationInstructions}>
                    {medication.instructions}
                  </Text>
                ) : null}
              </View>

              <Pressable
                onPress={() => handleDeactivateMedication(medication.id)}
                style={({ pressed }) => [
                  styles.secondaryButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.secondaryButtonText}>Desactivar</Text>
              </Pressable>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: '#f5f7fb',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1f2937',
  },
  subtitle: {
    marginTop: 4,
    fontSize: 15,
    color: '#6b7280',
  },
  card: {
    marginTop: 20,
    padding: 16,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  sectionTitle: {
    marginBottom: 14,
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  label: {
    marginBottom: 6,
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  input: {
    marginBottom: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    backgroundColor: '#ffffff',
    fontSize: 16,
  },
  textArea: {
    minHeight: 82,
    textAlignVertical: 'top',
  },
  primaryButton: {
    marginTop: 4,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#2563eb',
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  secondaryButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#fee2e2',
  },
  secondaryButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#b91c1c',
  },
  buttonPressed: {
    opacity: 0.75,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  emptyText: {
    fontSize: 15,
    color: '#6b7280',
  },
  medicationItem: {
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  medicationInfo: {
    flex: 1,
    paddingRight: 12,
  },
  medicationName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  medicationDosage: {
    marginTop: 2,
    fontSize: 14,
    color: '#374151',
  },
  medicationInstructions: {
    marginTop: 4,
    fontSize: 13,
    color: '#6b7280',
  },
});
