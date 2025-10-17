// components/common/AlphabetGrid.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

// Opcional: permitir configurar columnas
const DEFAULT_COLUMNS = 6;

const AlphabetGrid = ({ detectedLetter, onLetterPress, columns = DEFAULT_COLUMNS, title = 'Alfabeto de Referencia', style }) => {
  const alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

  return (
  <View style={[styles.container, style]}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {/* Contenedor cuadrado */}
      <View style={styles.squareWrapper}>
        <View style={styles.grid}>
          {alphabet.map((letter) => (
            <View key={letter} style={[styles.letterBox, { width: `${100 / columns}%` }]}>
              <TouchableOpacity
                style={[
                  styles.letterInner,
                  detectedLetter === letter && styles.letterInnerActive,
                ]}
                onPress={() => onLetterPress && onLetterPress(letter)}
                accessibilityRole="button"
                accessibilityLabel={`Seleccionar letra ${letter}`}
              >
                <Text
                  style={[
                    styles.letterText,
                    detectedLetter === letter && styles.letterTextActive,
                  ]}
                >
                  {letter}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  squareWrapper: {
    width: '100%',
    aspectRatio: 1, // cuadrado
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    padding: 8,
    backgroundColor: '#111',
    overflow: 'hidden',
  },
  grid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  letterBox: {
    aspectRatio: 1,
    padding: 4,
  },
  letterInner: {
    flex: 1,
    backgroundColor: '#333',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  letterInnerActive: {
    backgroundColor: '#00FF88',
  },
  letterText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  letterTextActive: {
    color: '#000',
  },
});

export default AlphabetGrid;