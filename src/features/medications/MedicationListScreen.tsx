import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { palette, radius, shadow, spacing, touchTarget } from '../../shared/theme/tokens';
import { MedicationCard } from './components/MedicationCard';
import { useMedications } from './useMedications';

const EmptyState = ({ onAdd }: { onAdd: () => void }) => (
  <View style={styles.empty}>
    <Text style={styles.emptyTitle}>Aún no tienes medicamentos</Text>
    <Text style={styles.emptyText}>
      Agrega tu primer medicamento para empezar a recibir recordatorios.
    </Text>
    <Pressable
      onPress={onAdd}
      accessibilityRole="button"
      accessibilityLabel="Agregar medicamento"
      style={({ pressed }) => [styles.emptyButton, pressed && styles.pressed]}
    >
      <Text style={styles.emptyButtonText}>Agregar medicamento</Text>
    </Pressable>
  </View>
);

export const MedicationListScreen = () => {
  const router = useRouter();
  const {
    medications,
    scheduleSummaries,
    isLoading,
    loadMedications,
    removeMedication,
  } = useMedications();

  useFocusEffect(
    useCallback(() => {
      loadMedications();
    }, [loadMedications]),
  );

  const goToAdd = useCallback(() => {
    router.push('/medication/new');
  }, [router]);

  const goToEdit = useCallback(
    (medicationId: string) => {
      router.push({
        pathname: '/medication/[id]',
        params: { id: medicationId },
      });
    },
    [router],
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Mis medicamentos</Text>
        <Text style={styles.subtitle}>
          {medications.length > 0
            ? `${medications.length} activo${medications.length === 1 ? '' : 's'}`
            : 'Gestiona tus recordatorios'}
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={palette.primary} />
        </View>
      ) : (
        <FlatList
          data={medications}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <MedicationCard
              medication={item}
              scheduleSummary={scheduleSummaries[item.id] ?? 'Cargando horario...'}
              onEdit={goToEdit}
              onDeactivate={removeMedication}
            />
          )}
          ListEmptyComponent={<EmptyState onAdd={goToAdd} />}
        />
      )}

      <Pressable
        onPress={goToAdd}
        accessibilityRole="button"
        accessibilityLabel="Agregar medicamento"
        style={({ pressed }) => [styles.fab, pressed && styles.pressed]}
      >
        <Text style={styles.fabIcon}>+</Text>
      </Pressable>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.background,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: palette.textPrimary,
  },
  subtitle: {
    marginTop: spacing.xs,
    fontSize: 15,
    color: palette.textSecondary,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: 96,
    flexGrow: 1,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.lg,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: palette.textPrimary,
    textAlign: 'center',
  },
  emptyText: {
    marginTop: spacing.sm,
    fontSize: 15,
    color: palette.textSecondary,
    textAlign: 'center',
  },
  emptyButton: {
    marginTop: spacing.xl,
    minHeight: touchTarget,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
    borderRadius: radius.md,
    backgroundColor: palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: palette.onColor,
  },
  fab: {
    position: 'absolute',
    right: spacing.xl,
    bottom: spacing.xl,
    width: 60,
    height: 60,
    borderRadius: radius.full,
    backgroundColor: palette.success,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.floating,
  },
  fabIcon: {
    fontSize: 32,
    lineHeight: 36,
    fontWeight: '700',
    color: palette.onColor,
  },
  pressed: {
    opacity: 0.8,
  },
});
