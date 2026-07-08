import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  palette,
  radius,
  shadow,
  spacing,
  touchTarget,
} from '../../../shared/theme/tokens';
import type { Medication } from '../../../types/medication.types';

interface MedicationCardProps {
  medication: Medication;
  scheduleSummary: string;
  onDeactivate: (medicationId: string) => void;
}

export const MedicationCard = ({
  medication,
  scheduleSummary,
  onDeactivate,
}: MedicationCardProps) => {
  return (
    <View style={styles.card}>
      <View style={styles.info}>
        <Text style={styles.name}>{medication.name}</Text>
        <Text style={styles.dosage}>{medication.dosage}</Text>

        <View style={styles.scheduleRow}>
          <View style={styles.scheduleDot} />
          <Text style={styles.schedule}>{scheduleSummary}</Text>
        </View>

        {medication.instructions ? (
          <Text style={styles.instructions}>{medication.instructions}</Text>
        ) : null}
      </View>

      <Pressable
        onPress={() => onDeactivate(medication.id)}
        accessibilityRole="button"
        accessibilityLabel={`Desactivar ${medication.name}`}
        style={({ pressed }) => [
          styles.deactivateButton,
          pressed && styles.pressed,
        ]}
      >
        <Text style={styles.deactivateText}>Desactivar</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: palette.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shadow.card,
  },
  info: {
    flex: 1,
    paddingRight: spacing.md,
  },
  name: {
    fontSize: 17,
    fontWeight: '700',
    color: palette.textPrimary,
  },
  dosage: {
    marginTop: 2,
    fontSize: 14,
    color: palette.textSecondary,
  },
  scheduleRow: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  scheduleDot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
    backgroundColor: palette.primary,
  },
  schedule: {
    fontSize: 14,
    fontWeight: '700',
    color: palette.primaryDark,
  },
  instructions: {
    marginTop: spacing.sm,
    fontSize: 13,
    color: palette.textMuted,
  },
  deactivateButton: {
    minHeight: touchTarget,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.dangerSoft,
  },
  deactivateText: {
    fontSize: 13,
    fontWeight: '700',
    color: palette.dangerText,
  },
  pressed: {
    opacity: 0.75,
  },
});
