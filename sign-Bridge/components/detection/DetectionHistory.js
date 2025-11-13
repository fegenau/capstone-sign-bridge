import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const DetectionHistory = ({ history = [], onClear }) => {
  if (history.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="time-outline" size={32} color="#666" />
        <Text style={styles.emptyText}>Sin historial aún</Text>
      </View>
    );
  }

  const getConfidenceColor = (conf) => {
    if (conf < 50) return '#FF6B6B';
    if (conf < 75) return '#FFB800';
    return '#00FF88';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Historial</Text>
        {onClear && (
          <TouchableOpacity onPress={onClear}>
            <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
          </TouchableOpacity>
        )}
      </View>
      <ScrollView style={styles.scrollView}>
        {history.map((item, idx) => (
          <View key={idx} style={styles.historyItem}>
            <Text style={styles.wordInHistory}>
              {item.word.replace(/_/g, ' ')}
            </Text>
            <View style={styles.confidenceBar}>
              <View 
                style={[
                  styles.confidenceFill,
                  { 
                    width: `${item.confidence}%`,
                    backgroundColor: getConfidenceColor(item.confidence)
                  }
                ]}
              />
            </View>
            <Text style={styles.confidenceValue}>{item.confidence}%</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 20,
    marginVertical: 10,
    maxHeight: 200
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20
  },
  emptyText: {
    color: '#666',
    fontSize: 14,
    marginTop: 8
  },
  scrollView: {
    maxHeight: 150
  },
  historyItem: {
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)'
  },
  wordInHistory: {
    color: '#00FF88',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'capitalize'
  },
  confidenceBar: {
    height: 6,
    backgroundColor: '#333',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 2
  },
  confidenceFill: {
    height: '100%'
  },
  confidenceValue: {
    color: '#ccc',
    fontSize: 12,
    marginTop: 2
  }
});
