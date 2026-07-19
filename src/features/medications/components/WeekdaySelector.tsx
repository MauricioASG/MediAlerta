import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  ALL_WEEKDAYS,
  WEEKDAY_BUTTON_LABELS,
  WEEKDAY_FULL_NAMES,
  type Weekday,
} from '../../../types/weekday.types';
import { palette, radius, spacing, touchTarget } from '../../../shared/theme/tokens';

interface WeekdaySelectorProps {
  selected: Weekday[];
  onChange: (weekdays: Weekday[]) => void;
}

export const WeekdaySelector = ({ selected, onChange }: WeekdaySelectorProps) => {
  const toggle = (day: Weekday) => {
    const isSelected = selected.includes(day);

    // Keep at least one day selected.
    if (isSelected && selected.length === 1) return;

    const next = isSelected
      ? selected.filter((d) => d !== day)
      : ([...selected, day].sort((a, b) => a - b) as Weekday[]);

    onChange(next);
  };

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>Repetir</Text>
      <View style={styles.row}>
        {ALL_WEEKDAYS.map((day) => {
          const isActive = selected.includes(day);

          return (
            <Pressable
              key={day}
              onPress={() => toggle(day)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isActive }}
              accessibilityLabel={WEEKDAY_FULL_NAMES[day]}
              style={[styles.dayButton, isActive && styles.dayButtonActive]}
            >
              <Text style={[styles.dayText, isActive && styles.dayTextActive]}>
                {WEEKDAY_BUTTON_LABELS[day]}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginTop: spacing.lg,
  },
  label: {
    marginBottom: spacing.sm,
    fontSize: 14,
    fontWeight: '600',
    color: palette.textPrimary,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  dayButton: {
    flex: 1,
    height: touchTarget,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: palette.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.surface,
  },
  dayButtonActive: {
    borderColor: palette.primary,
    backgroundColor: palette.primarySoft,
  },
  dayText: {
    fontSize: 13,
    fontWeight: '700',
    color: palette.textSecondary,
  },
  dayTextActive: {
    color: palette.primaryDark,
  },
});
