import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, SafeAreaView } from 'react-native';
import AlphabetGrid from '../components/common/AlphabetGrid';
import { LETTER_IMAGES } from '../utils/constants/alphabetImages';

const DictionaryScreen = ({ navigation}) => {
  const [selectedLetter, setSelectedLetter] = useState(null);

  const handleLetterPress = (letter) => {
    setSelectedLetter(letter);
    // Si más adelante hay una pantalla de detalle, aquí se puede navegar
    // navigation.navigate('LetterDetail', { letter });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={true}
        scrollIndicatorInsets={{ right: 2 }}
        bounces={true}
        alwaysBounceVertical={true}
        persistentScrollbar={true}
      >
        <Text style={styles.title}>Diccionario</Text>
        <Text style={styles.subtitle}>Explora todas las letras de la A a la Z y visualiza sus señas correspondientes</Text>
        <AlphabetGrid detectedLetter={selectedLetter} onLetterPress={handleLetterPress} />
        {selectedLetter && LETTER_IMAGES[selectedLetter] && (
          <View style={styles.previewContainer}>
            <Text style={styles.previewTitle}>Letra seleccionada: {selectedLetter}</Text>
            <Image
              source={LETTER_IMAGES[selectedLetter]}
              style={styles.previewImage}
              resizeMode="contain"
              accessible
              accessibilityLabel={`Seña de la letra ${selectedLetter}`}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  scrollContainer: {
    paddingTop: 14,
    paddingBottom: 50,
    minHeight: '120%',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    color: '#CCCCCC',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  previewContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
  },
  previewTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginVertical: 12,
  },
  previewImage: {
    width: '90%',
    height: 300,
    borderRadius: 8,
  },
});

export default DictionaryScreen;
