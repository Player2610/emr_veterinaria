import React, { useState, forwardRef } from 'react';
import {
  TextInput,
  View,
  Text,
  type TextInputProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '@/context/theme-context';

// ─── Types ────────────────────────────────────────────────────────────────────

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  containerStyle?: StyleProp<ViewStyle>;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const Input = forwardRef<TextInput, InputProps>(
  (
    {
      label,
      error,
      hint,
      containerStyle,
      leftElement,
      rightElement,
      style,
      ...props
    },
    ref
  ) => {
    const { colors } = useTheme();
    const [focused, setFocused] = useState(false);

    const borderColor = error
      ? colors.destructive
      : focused
      ? colors.ring
      : colors.input;

    return (
      <View style={[{ marginBottom: 16 }, containerStyle]}>
        {label && (
          <Text
            style={{
              fontSize: 14,
              fontWeight: '500',
              color: colors.foreground,
              marginBottom: 6,
            }}
          >
            {label}
          </Text>
        )}

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: focused ? 2 : 1,
            borderColor,
            borderRadius: 8,
            backgroundColor: colors.surface,
            paddingHorizontal: 12,
            minHeight: 44,
          }}
        >
          {leftElement && <View style={{ marginRight: 8 }}>{leftElement}</View>}

          <TextInput
            ref={ref}
            style={[
              {
                flex: 1,
                fontSize: 15,
                color: colors.foreground,
                paddingVertical: 0,
              },
              style,
            ]}
            placeholderTextColor={colors.mutedForeground}
            onFocus={(e) => {
              setFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              props.onBlur?.(e);
            }}
            {...props}
          />

          {rightElement && <View style={{ marginLeft: 8 }}>{rightElement}</View>}
        </View>

        {error && (
          <Text
            style={{
              fontSize: 12,
              color: colors.destructive,
              marginTop: 4,
            }}
          >
            {error}
          </Text>
        )}

        {hint && !error && (
          <Text
            style={{
              fontSize: 12,
              color: colors.mutedForeground,
              marginTop: 4,
            }}
          >
            {hint}
          </Text>
        )}
      </View>
    );
  }
);

Input.displayName = 'Input';
