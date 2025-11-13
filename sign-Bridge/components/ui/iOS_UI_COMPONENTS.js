/**
 * components/ui/iOS_UI_COMPONENTS.js
 *
 * Glassmorphic iOS-style reusable UI components
 * Built with React Native for max compatibility
 *
 * Components:
 * - GlassCard: Base glassmorphic container
 * - GlassButton: iOS-style button with glass effect
 * - StatusBadge: Small indicator badges
 * - ProgressIndicator: Circular progress with glassmorphism
 * - CameraStatus: Camera state visualization
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles as glasStyles, colors, typography } from '../../styles/iosGlassMorphism';

/**
 * GlassCard - Glassmorphic card component
 *
 * Props:
 * - title: Card title
 * - children: Content
 * - style: Custom styles
 * - icon: Ionicon name for header
 */
export const GlassCard = ({ title, children, style, icon }) => (
  <View style={[glasStyles.largeCard, style]}>
    {(title || icon) && (
      <View style={ios_styles.cardHeader}>
        {icon && <Ionicons name={icon} size={20} color={colors.neonGreen} />}
        {title && <Text style={glasStyles.textPrimary}>{title}</Text>}
      </View>
    )}
    {children}
  </View>
);

/**
 * GlassButton - iOS-style glassmorphic button
 *
 * Props:
 * - onPress: Callback
 * - title: Button text
 * - variant: 'primary' | 'secondary' | 'outline'
 * - icon: Ionicon name
 * - disabled: Boolean
 * - loading: Boolean
 * - style: Custom styles
 */
export const GlassButton = ({
  onPress,
  title,
  variant = 'primary',
  icon,
  disabled = false,
  loading = false,
  style,
}) => {
  const getButtonStyle = () => {
    if (variant === 'primary') {
      return glasStyles.glassButtonPrimary;
    } else if (variant === 'secondary') {
      return glasStyles.glassButtonSecondary;
    }
    return glasStyles.glassButton;
  };

  const getTextStyle = () => {
    if (variant === 'primary') {
      return glasStyles.glassButtonPrimaryText;
    } else if (variant === 'secondary') {
      return glasStyles.glassButtonSecondaryText;
    }
    return { ...glasStyles.textPrimary, fontWeight: '600' };
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        getButtonStyle(),
        disabled && { opacity: 0.5 },
        style,
      ]}
      activeOpacity={0.7}
    >
      <View style={ios_styles.buttonContent}>
        {loading ? (
          <ActivityIndicator
            color={variant === 'primary' ? colors.darkBackground : colors.neonGreen}
            size="small"
          />
        ) : (
          <>
            {icon && (
              <Ionicons
                name={icon}
                size={18}
                color={variant === 'primary' ? colors.darkBackground : colors.neonGreen}
                style={ios_styles.buttonIcon}
              />
            )}
            {title && <Text style={getTextStyle()}>{title}</Text>}
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};

/**
 * StatusBadge - Small status indicator
 *
 * Props:
 * - label: Badge text
 * - status: 'success' | 'warning' | 'error' | 'info'
 * - icon: Ionicon name
 */
export const StatusBadge = ({ label, status = 'info', icon }) => {
  const getStatusColor = () => {
    const statusColors = {
      success: colors.neonGreen,
      warning: colors.warning,
      error: colors.error,
      info: colors.neonBlue,
    };
    return statusColors[status] || colors.neonBlue;
  };

  const statusColor = getStatusColor();

  return (
    <View style={[ios_styles.statusBadge, { borderColor: statusColor }]}>
      {icon && <Ionicons name={icon} size={12} color={statusColor} />}
      <Text style={[ios_styles.statusBadgeText, { color: statusColor }]}>
        {label}
      </Text>
    </View>
  );
};

/**
 * ProgressBar - Glassmorphic progress indicator
 *
 * Props:
 * - progress: 0-1 value
 * - label: Optional label
 * - showPercentage: Boolean
 */
export const ProgressBar = ({ progress = 0, label, showPercentage = true }) => {
  const percentage = Math.min(Math.max(progress, 0), 1);

  return (
    <View style={ios_styles.progressContainer}>
      {label && (
        <View style={ios_styles.progressHeader}>
          <Text style={glasStyles.textSecondary}>{label}</Text>
          {showPercentage && (
            <Text style={[glasStyles.textSecondary, { fontWeight: '600' }]}>
              {Math.round(percentage * 100)}%
            </Text>
          )}
        </View>
      )}
      <View style={glasStyles.progressBarBackground}>
        <View
          style={[
            glasStyles.progressBarFill,
            { width: `${percentage * 100}%` },
          ]}
        />
      </View>
    </View>
  );
};

/**
 * CameraStatus - Camera readiness indicator
 *
 * Props:
 * - ready: Boolean
 * - detecting: Boolean
 * - message: Status message
 */
export const CameraStatus = ({ ready = false, detecting = false, message = '' }) => {
  const getStatusIcon = () => {
    if (detecting) return 'radio-button-on';
    if (ready) return 'checkmark-circle';
    return 'close-circle';
  };

  const getStatusColor = () => {
    if (detecting) return colors.neonGreen;
    if (ready) return colors.neonGreen;
    return colors.error;
  };

  return (
    <View style={ios_styles.cameraStatusContainer}>
      <Ionicons
        name={getStatusIcon()}
        size={24}
        color={getStatusColor()}
        style={{ marginRight: 12 }}
      />
      <View style={{ flex: 1 }}>
        <Text style={[glasStyles.textPrimary, { fontWeight: '600' }]}>
          {detecting ? '🔴 En directo' : ready ? '✅ Listo' : '❌ No disponible'}
        </Text>
        {message && <Text style={glasStyles.textSecondary}>{message}</Text>}
      </View>
    </View>
  );
};

/**
 * MediaPipeStatus - MediaPipe initialization status
 *
 * Props:
 * - initialized: Boolean
 * - hands: Number of hands detected (0, 1, 2)
 * - confidence: Detection confidence 0-1
 */
export const MediaPipeStatus = ({ initialized = false, hands = 0, confidence = 0 }) => {
  return (
    <GlassCard title="🤚 MediaPipe" icon="hand-left-outline">
      <View style={ios_styles.statusGrid}>
        <View style={ios_styles.statusItem}>
          <Text style={glasStyles.textSecondary}>Estado</Text>
          <Text style={[glasStyles.textPrimary, { fontWeight: '700', fontSize: 16 }]}>
            {initialized ? '✅ Activo' : '⏳ Cargando'}
          </Text>
        </View>

        <View style={ios_styles.statusItem}>
          <Text style={glasStyles.textSecondary}>Manos</Text>
          <Text style={[glasStyles.textPrimary, { fontWeight: '700', fontSize: 16 }]}>
            {hands} / 2
          </Text>
        </View>

        <View style={ios_styles.statusItem}>
          <Text style={glasStyles.textSecondary}>Confianza</Text>
          <Text style={[glasStyles.textPrimary, { fontWeight: '700', fontSize: 16 }]}>
            {(confidence * 100).toFixed(0)}%
          </Text>
        </View>
      </View>
    </GlassCard>
  );
};

/**
 * DetectionResult - Display detected gesture/letter
 *
 * Props:
 * - result: Detected item (letter, word, gesture)
 * - confidence: Confidence score 0-1
 * - alternative: Alternative prediction
 */
export const DetectionResult = ({ result, confidence = 0, alternative }) => {
  return (
    <GlassCard title="🎯 Detección" icon="checkmark-circle-outline">
      {result ? (
        <>
          <Text style={[glasStyles.textPrimary, { fontSize: 48, fontWeight: '700', textAlign: 'center' }]}>
            {result}
          </Text>
          <ProgressBar progress={confidence} label="Confianza" showPercentage={true} />
          {alternative && (
            <>
              <Text style={[glasStyles.textSecondary, { marginTop: 12, marginBottom: 4 }]}>
                Alternativa
              </Text>
              <Text style={[glasStyles.textTertiary, { fontSize: 14 }]}>
                {alternative}
              </Text>
            </>
          )}
        </>
      ) : (
        <Text style={[glasStyles.textTertiary, { textAlign: 'center', padding: 20 }]}>
          Esperando detección...
        </Text>
      )}
    </GlassCard>
  );
};

/**
 * DebugPanel - Development debugging panel
 *
 * Props:
 * - logs: Array of log messages
 * - collapsed: Boolean
 * - onToggle: Callback when toggled
 */
export const DebugPanel = ({ logs = [], collapsed = true, onToggle }) => {
  return (
    <View style={ios_styles.debugPanel}>
      <TouchableOpacity onPress={onToggle} style={ios_styles.debugHeader}>
        <Ionicons
          name={collapsed ? 'chevron-down' : 'chevron-up'}
          size={20}
          color={colors.warning}
        />
        <Text style={[glasStyles.textSecondary, { marginLeft: 8, fontWeight: '600' }]}>
          🐛 Debug Panel ({logs.length})
        </Text>
      </TouchableOpacity>

      {!collapsed && (
        <View style={ios_styles.debugContent}>
          {logs.length === 0 ? (
            <Text style={glasStyles.textTertiary}>No logs</Text>
          ) : (
            logs.slice(0, 10).map((log, idx) => (
              <Text
                key={idx}
                style={[
                  glasStyles.caption,
                  { color: colors.textTertiary, marginBottom: 4 },
                ]}
                numberOfLines={1}
              >
                {log}
              </Text>
            ))
          )}
        </View>
      )}
    </View>
  );
};

// ============================================================================
// INTERNAL STYLES
// ============================================================================

const ios_styles = StyleSheet.create({
  // Card header
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderColor,
  },

  // Button
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  buttonIcon: {
    marginRight: 8,
  },

  // Status badge
  statusBadge: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: 'center',
    alignSelf: 'flex-start',
  },

  statusBadgeText: {
    ...typography.caption,
    marginLeft: 4,
  },

  // Progress
  progressContainer: {
    marginVertical: 8,
  },

  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },

  // Camera status
  cameraStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginVertical: 8,
    ...glasStyles.largeCard,
  },

  // Status grid
  statusGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },

  statusItem: {
    alignItems: 'center',
  },

  // Debug panel
  debugPanel: {
    ...glasStyles.largeCard,
    marginTop: 12,
  },

  debugHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  debugContent: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderColor,
  },
});
