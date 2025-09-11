// components/common/AlphabetGrid.js
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity 
} from 'react-native';

const AlphabetGrid = ({ detectedLetter, onLetterPress }) => {
  const alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Alfabeto de Referencia</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollView}>
        <View style={styles.row}>
          {alphabet.map((letter) => (
            <TouchableOpacity
              key={letter}
              style={[
                styles.letterBox,
                detectedLetter === letter && styles.letterBoxActive
              ]}
              onPress={() => onLetterPress && onLetterPress(letter)}
            >
              <Text style={[
                styles.letterText,
                detectedLetter === letter && styles.letterTextActive
              ]}>
                {letter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  scrollView: {
    flexGrow: 0,
  },
  row: {
    flexDirection: 'row',
    paddingHorizontal: 5,
  },
  letterBox: {
    width: 35,
    height: 35,
    backgroundColor: '#333',
    margin: 2,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  letterBoxActive: {
    backgroundColor: '#00FF88',
  },
  letterText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  letterTextActive: {
    color: '#000',
  },
});

export default AlphabetGrid;