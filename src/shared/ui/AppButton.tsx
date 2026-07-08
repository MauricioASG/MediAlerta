import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { palette, radius, spacing, touchTarget } from '../theme/tokens';

type Variant = 'primary' | 'success' | 'danger' | 'ghost';

interface AppButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  accessibilityLabel?: string;
}

const backgroundByVariant: Record<Variant, string> = {
  primary: palette.primary,
  success: palette.success,
  danger: palette.dangerSoft,
  ghost: 'transparent',
};

const textColorByVariant: Record<Variant, string> = {
  primary: palette.onColor,
  success: palette.onColor,
  danger: palette.dangerText,
  ghost: palette.primary,
};

export const AppButton = ({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  accessibilityLabel,
}: AppButtonProps) => {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: backgroundByVariant[variant] },
        variant === 'ghost' && styles.ghostBorder,
        pressed && styles.pressed,
        isDisabled && styles.disabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColorByVariant[variant]} />
      ) : (
        <Text style={[styles.label, { color: textColorByVariant[variant] }]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    minHeight: touchTarget,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostBorder: {
    borderWidth: 1,
    borderColor: palette.primary,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.6,
  },
});
