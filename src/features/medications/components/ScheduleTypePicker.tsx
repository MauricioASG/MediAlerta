import { Pressable, StyleSheet, Text, View } from 'react-native';

import { palette, radius, spacing, touchTarget } from '../../../shared/theme/tokens';
import type { ScheduleType } from '../../../types/schedule.types';

interface ScheduleTypePickerProps {
  value: ScheduleType;
  onChange: (value: ScheduleType) => void;
}

const OPTIONS: { value: ScheduleType; label: string }[] = [
  { value: 'interval', label: 'Por intervalo' },
  { value: 'specific_times', label: 'Horas específicas' },
];

export const ScheduleTypePicker = ({
  value,
  onChange,
}: ScheduleTypePickerProps) => {
  return (
    <View style={styles.container}>
      {OPTIONS.map((option) => {
        const isActive = value === option.value;

        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={option.label}
            style={[styles.button, isActive && styles.buttonActive]}
          >
            <Text style={[styles.text, isActive && styles.textActive]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
    flexDirection: 'row',
    gap: spacing.md,
  },
  button: {
    flex: 1,
    minHeight: touchTarget,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.surface,
  },
  buttonActive: {
    borderColor: palette.primary,
    backgroundColor: palette.primarySoft,
  },
  text: {
    fontSize: 14,
    fontWeight: '700',
    color: palette.textSecondary,
  },
  textActive: {
    color: palette.primaryDark,
  },
});
