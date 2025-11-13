/**
 * DetectionHistory.js
 *
 * CSB-81: Componente para mostrar historial de detecciones con estadísticas
 *
 * Características:
 * ✅ Lista scrollable de detecciones (más recientes primero)
 * ✅ Timestamp de cada detección
 * ✅ Confianza color-coded (rojo/amarillo/verde)
 * ✅ Estadísticas totales: palabras detectadas, precisión promedio
 * ✅ Opción de limpiar historial
 * ✅ Contador de estado (altas, medias, bajas confianzas)
 */

import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const DetectionHistory = ({ detections = [], onClear }) => {
  // Calcular estadísticas
  const stats = useMemo(() => {
    if (detections.length === 0) {
      return {
        total: 0,
        averageConfidence: 0,
        highConfidence: 0,
        mediumConfidence: 0,
        lowConfidence: 0,
        uniqueWords: new Set(),
      };
    }

    const highConf = detections.filter((d) => d.confidence >= 0.7).length;
    const mediumConf = detections.filter(
      (d) => d.confidence >= 0.5 && d.confidence < 0.7
    ).length;
    const lowConf = detections.filter((d) => d.confidence < 0.5).length;
    const avgConf =
      detections.reduce((sum, d) => sum + d.confidence, 0) / detections.length;
    const uniqueWords = new Set(detections.map((d) => d.word));

    return {
      total: detections.length,
      averageConfidence: avgConf,
      highConfidence: highConf,
      mediumConfidence: mediumConf,
      lowConfidence: lowConf,
      uniqueWords,
    };
  }, [detections]);

  const getConfidenceColor = (conf) => {
    if (conf >= 0.7) return '#00FF88'; // Verde
    if (conf >= 0.5) return '#FFB800'; // Amarillo
    return '#FF6B6B'; // Rojo
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('es-CL', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  if (detections.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="time-outline" size={40} color="#666" />
        <Text style={styles.emptyText}>Sin historial aún</Text>
        <Text style={styles.emptySubtext}>
          Las detecciones aparecerán aquí
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Encabezado con título y botón limpiar */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Ionicons name="list-outline" size={20} color="#00FF88" />
          <Text style={styles.title}>Historial de Detecciones</Text>
        </View>
        {onClear && (
          <TouchableOpacity
            onPress={onClear}
            style={styles.clearButton}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
          </TouchableOpacity>
        )}
      </View>

      {/* Panel de estadísticas */}
      <View style={styles.statsPanel}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Total</Text>
          <Text style={styles.statValue}>{stats.total}</Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Promedio</Text>
          <Text style={[styles.statValue, { color: '#00FF88' }]}>
            {(stats.averageConfidence * 100).toFixed(0)}%
          </Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Palabras únicas</Text>
          <Text style={styles.statValue}>{stats.uniqueWords.size}</Text>
        </View>
      </View>

      {/* Mini gráfico de confianzas */}
      <View style={styles.confidenceChart}>
        <View
          style={[
            styles.chartBar,
            {
              flex: stats.highConfidence,
              backgroundColor: '#00FF88',
            },
          ]}
        >
          {stats.highConfidence > 0 && (
            <Text style={styles.chartLabel}>{stats.highConfidence}</Text>
          )}
        </View>
        <View
          style={[
            styles.chartBar,
            {
              flex: stats.mediumConfidence,
              backgroundColor: '#FFB800',
            },
          ]}
        >
          {stats.mediumConfidence > 0 && (
            <Text style={styles.chartLabel}>{stats.mediumConfidence}</Text>
          )}
        </View>
        <View
          style={[
            styles.chartBar,
            {
              flex: stats.lowConfidence,
              backgroundColor: '#FF6B6B',
            },
          ]}
        >
          {stats.lowConfidence > 0 && (
            <Text style={styles.chartLabel}>{stats.lowConfidence}</Text>
          )}
        </View>
      </View>

      {/* Leyenda del gráfico */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#00FF88' }]} />
          <Text style={styles.legendText}>Alta (≥70%)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#FFB800' }]} />
          <Text style={styles.legendText}>Media (50-70%)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#FF6B6B' }]} />
          <Text style={styles.legendText}>Baja (menor 50%)</Text>
        </View>
      </View>

      {/* Lista de detecciones */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {detections.map((item, idx) => (
          <View key={idx} style={styles.historyItem}>
            <View style={styles.itemHeader}>
              <Text style={styles.wordInHistory}>
                {item.word.replace(/_/g, ' ').toUpperCase()}
              </Text>
              <Text style={styles.timestamp}>
                {formatTime(item.timestamp || Date.now())}
              </Text>
            </View>

            <View style={styles.itemContent}>
              <View style={styles.confidenceBar}>
                <View
                  style={[
                    styles.confidenceFill,
                    {
                      width: `${(item.confidence * 100).toFixed(0)}%`,
                      backgroundColor: getConfidenceColor(item.confidence),
                    },
                  ]}
                />
              </View>
              <Text
                style={[
                  styles.confidenceValue,
                  { color: getConfidenceColor(item.confidence) },
                ]}
              >
                {(item.confidence * 100).toFixed(1)}%
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    maxHeight: 400,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  title: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },

  clearButton: {
    padding: 8,
  },

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },

  emptyText: {
    color: '#999999',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 12,
  },

  emptySubtext: {
    color: '#666666',
    fontSize: 12,
    marginTop: 4,
  },

  statsPanel: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 255, 136, 0.05)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 136, 0.2)',
    padding: 12,
    marginBottom: 12,
    justifyContent: 'space-around',
  },

  statItem: {
    alignItems: 'center',
    flex: 1,
  },

  statLabel: {
    color: '#999999',
    fontSize: 11,
    marginBottom: 4,
  },

  statValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },

  confidenceChart: {
    flexDirection: 'row',
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
    gap: 2,
    padding: 2,
  },

  chartBar: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  chartLabel: {
    color: '#000000',
    fontSize: 10,
    fontWeight: 'bold',
  },

  legend: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
    justifyContent: 'center',
  },

  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  legendText: {
    color: '#CCCCCC',
    fontSize: 11,
  },

  scrollView: {
    maxHeight: 150,
  },

  historyItem: {
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },

  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },

  wordInHistory: {
    color: '#00FF88',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },

  timestamp: {
    color: '#999999',
    fontSize: 10,
    marginLeft: 8,
  },

  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  confidenceBar: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },

  confidenceFill: {
    height: '100%',
    borderRadius: 3,
  },

  confidenceValue: {
    fontSize: 11,
    fontWeight: '600',
    minWidth: 40,
    textAlign: 'right',
  },
});

export default DetectionHistory;
