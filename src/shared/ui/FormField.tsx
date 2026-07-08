import { StyleSheet, Text, TextInput, View } from 'react-native';
import type { TextInputProps } from 'react-native';

import { palette, radius, spacing } from '../theme/tokens';

interface FormFieldProps extends TextInputProps {
  label: string;
}

export const FormField = ({ label, style, ...inputProps }: FormFieldProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={palette.textMuted}
        accessibilityLabel={label}
        style={[styles.input, style]}
        {...inputProps}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  label: {
    marginBottom: spacing.sm,
    fontSize: 14,
    fontWeight: '600',
    color: palette.textPrimary,
  },
  input: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radius.md,
    backgroundColor: palette.surface,
    fontSize: 16,
    color: palette.textPrimary,
  },
});
