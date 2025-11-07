import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, SafeAreaView } from 'react-native';
import NumberGrid from '../components/common/NumberGrid';
import { NUMBER_IMAGES } from '../utils/constants/numberImages';

const NumberScreen = ({ navigation }) => {
  const [selectedNumber, setSelectedNumber] = useState(null);

  const handleNumberPress = (number) => {
    setSelectedNumber(number);
    // Si más adelante hay una pantalla de detalle, aquí se puede navegar
    // navigation.navigate('NumberDetail', { number });
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
        <Text style={styles.title}>Números</Text>
        <Text style={styles.subtitle}>Explora todos los números del 1 al 10 y visualiza sus señas correspondientes</Text>
        <NumberGrid detectedNumber={selectedNumber} onNumberPress={handleNumberPress} />
        {selectedNumber && NUMBER_IMAGES[selectedNumber] && (
          <View style={styles.previewContainer}>
            <Text style={styles.previewTitle}>Número seleccionado: {selectedNumber}</Text>
            <Image
              source={NUMBER_IMAGES[selectedNumber]}
              style={styles.previewImage}
              resizeMode="contain"
              accessible
              accessibilityLabel={`Seña del número ${selectedNumber}`}
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

export default NumberScreen;
