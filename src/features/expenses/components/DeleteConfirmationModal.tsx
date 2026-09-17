import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';
import { useTheme } from '@/shared/theme/ThemeContext';

interface DeleteConfirmationModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  isDeleting?: boolean;
}

export function DeleteConfirmationModal({
  visible,
  onCancel,
  onConfirm,
  title = 'Delete expense?',
  message = 'This action cannot be undone.',
  isDeleting = false,
}: DeleteConfirmationModalProps) {
  const { colors, typography, spacing, borderRadius } = useTheme();

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.dialog,
            {
              backgroundColor: colors.card,
              borderColor: colors.cardBorder,
              borderRadius: borderRadius.lg,
              padding: spacing.xl,
            },
          ]}
        >
          <View style={[styles.iconCircle, { backgroundColor: `${colors.danger}15` }]}>
            <AlertTriangle size={28} color={colors.danger} />
          </View>

          <Text style={[typography.titleLarge, { color: colors.textPrimary, marginTop: spacing.md, textAlign: 'center' }]}>
            {title}
          </Text>

          <Text style={[typography.bodyMedium, { color: colors.textSecondary, marginTop: spacing.xs, textAlign: 'center' }]}>
            {message}
          </Text>

          <View style={[styles.actionsRow, { marginTop: spacing.xl, gap: spacing.md }]}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onCancel}
              style={[
                styles.button,
                {
                  backgroundColor: colors.surfaceSubtle,
                  borderRadius: borderRadius.md,
                  borderColor: colors.border,
                  borderWidth: 1,
                },
              ]}
            >
              <Text style={[typography.button, { color: colors.textPrimary }]}>
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              disabled={isDeleting}
              onPress={onConfirm}
              style={[
                styles.button,
                {
                  backgroundColor: colors.danger,
                  borderRadius: borderRadius.md,
                },
              ]}
            >
              <Text style={[typography.button, { color: '#FFFFFF' }]}>
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  dialog: {
    width: '100%',
    maxWidth: 360,
    borderWidth: 1,
    alignItems: 'center',
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionsRow: {
    flexDirection: 'row',
    width: '100%',
  },
  button: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
});
