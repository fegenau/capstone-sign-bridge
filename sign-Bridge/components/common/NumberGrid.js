import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

const NumberGrid = ({ detectedNumber, onNumberPress }) => {
  // Números del 0 al 9
  const numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Números de Referencia</Text>
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {numbers.map((number) => (
          <TouchableOpacity
            key={number}
            style={[
              styles.numberCard,
              detectedNumber === number && styles.numberCardActive,
            ]}
            onPress={() => onNumberPress && onNumberPress(number)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.numberText,
                detectedNumber === number && styles.numberTextActive,
              ]}
            >
              {number}
            </Text>
            
            {detectedNumber === number && (
              <View style={styles.activeIndicator} />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 20,
    marginBottom: 12,
    opacity: 0.7,
  },
  scrollContent: {
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  numberCard: {
    width: 60,
    height: 70,
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 6,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  numberCardActive: {
    backgroundColor: '#4A90E2',
    borderColor: '#fff',
    transform: [{ scale: 1.1 }],
  },
  numberText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  numberTextActive: {
    color: '#fff',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00FF88',
  },
});

export default NumberGrid;