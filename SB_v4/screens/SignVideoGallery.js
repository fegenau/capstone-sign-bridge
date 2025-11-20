import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Modal, FlatList, Dimensions } from 'react-native';

/**
 * GALERÍA DE VIDEOS DE SEÑAS
 *
 * Características:
 * - Grid visual de señas con play button
 * - Videos cortos de demostración
 * - Búsqueda y filtrado por categoría
 * - Información detallada de ejecución
 * - Interfaz intuitiva tipo TikTok / Instagram
 */

const window = Dimensions.get('window');

export default function SignVideoGallery({ theme, textScale }) {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  // Base de datos de videos de señas
  const signVideos = [
    {
      id: 1,
      name: 'Número 1',
      category: 'numbers',
      duration: '0:05',
      thumbnail: '1️⃣',
      description: 'Levanta el dedo índice con la palma hacia adelante.',
      author: 'Prof. LSCh',
      views: 1200,
      tips: [
        '✓ Mantén otros dedos cerrados',
        '✓ Palma hacia adelante',
        '✓ Dedo recto y firme',
      ],
    },
    {
      id: 2,
      name: 'Hola',
      category: 'phrases',
      duration: '0:08',
      thumbnail: '👋',
      description: 'Saludo básico en Lengua de Signos Chilena.',
      author: 'Prof. LSCh',
      views: 3400,
      tips: [
        '✓ Mano abierta a la altura de la oreja',
        '✓ Movimiento hacia afuera',
        '✓ Expresión amigable',
      ],
    },
    {
      id: 3,
      name: 'Gracias',
      category: 'phrases',
      duration: '0:06',
      thumbnail: '🙏',
      description: 'Expresión de gratitud en LSCh.',
      author: 'Prof. LSCh',
      views: 2800,
      tips: [
        '✓ Mano abierta frente a la boca',
        '✓ Movimiento descendente',
        '✓ Tocar el pecho',
      ],
    },
    {
      id: 4,
      name: 'Letra A',
      category: 'letters',
      duration: '0:04',
      thumbnail: '🅰️',
      description: 'Dactilología - Letra A del alfabeto.',
      author: 'Prof. LSCh',
      views: 1900,
      tips: [
        '✓ Forma un puño',
        '✓ Levanta el pulgar',
        '✓ Palma hacia un lado',
      ],
    },
    {
      id: 5,
      name: 'Comer',
      category: 'actions',
      duration: '0:07',
      thumbnail: '🍽️',
      description: 'Acción de comer en LSCh.',
      author: 'Prof. LSCh',
      views: 2100,
      tips: [
        '✓ Dedos juntos frente a la boca',
        '✓ Movimiento repetido hacia la boca',
        '✓ Expresión natural',
      ],
    },
    {
      id: 6,
      name: 'Dormir',
      category: 'actions',
      duration: '0:05',
      thumbnail: '😴',
      description: 'Acción de dormir en LSCh.',
      author: 'Prof. LSCh',
      views: 1600,
      tips: [
        '✓ Mejilla inclinada en la mano',
        '✓ Ojos cerrados',
        '✓ Cabeza hacia un lado',
      ],
    },
  ];

  const categories = [
    { id: 'all', name: '📺 Todos' },
    { id: 'numbers', name: '🔢 Números' },
    { id: 'letters', name: '🔤 Letras' },
    { id: 'phrases', name: '💬 Frases' },
    { id: 'actions', name: '🏃 Acciones' },
  ];

  // Filtrar videos según búsqueda y categoría
  const filteredVideos = signVideos.filter(video => {
    const matchesSearch = video.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || video.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* SEARCH BAR */}
      <View style={[styles.searchBar, { backgroundColor: theme.weak + '20', borderColor: theme.weak }]}>
        <Text style={{ fontSize: 18, marginRight: 8 }}>🔍</Text>
        <TextInput
          placeholder="Buscar señas..."
          placeholderTextColor={theme.weak}
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={[styles.searchInput, { color: theme.fg }]}
        />
      </View>

      {/* FILTER TABS */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
        {categories.map(cat => (
          <Pressable
            key={cat.id}
            onPress={() => setFilterCategory(cat.id)}
            style={[
              styles.filterBtn,
              filterCategory === cat.id && { backgroundColor: theme.accent },
              filterCategory !== cat.id && { backgroundColor: theme.weak + '15' },
            ]}
          >
            <Text style={[styles.filterText, { color: filterCategory === cat.id ? theme.bg : theme.fg, fontSize: 12 * textScale }]}>
              {cat.name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* VIDEO GRID */}
      <FlatList
        data={filteredVideos}
        keyExtractor={item => item.id.toString()}
        numColumns={2}
        scrollEnabled={true}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => setSelectedVideo(item)}
            style={[styles.videoCard, { backgroundColor: theme.weak + '10' }]}
          >
            {/* Thumbnail */}
            <View style={[styles.thumbnail, { backgroundColor: theme.weak + '30' }]}>
              <Text style={styles.thumbnailIcon}>{item.thumbnail}</Text>
              <View style={[styles.playButton, { backgroundColor: theme.accent }]}>
                <Text style={styles.playIcon}>▶</Text>
              </View>
              <Text style={[styles.duration, { backgroundColor: theme.bg + 'dd' }]}>
                {item.duration}
              </Text>
            </View>

            {/* Info */}
            <Text style={[styles.videoTitle, { color: theme.fg, fontSize: 13 * textScale }]}>
              {item.name}
            </Text>
            <Text style={[styles.viewCount, { color: theme.weak, fontSize: 11 * textScale }]}>
              👁 {item.views.toLocaleString()} visualizaciones
            </Text>
          </Pressable>
        )}
      />

      {/* MODAL DE VIDEO DETAIL */}
      {selectedVideo && (
        <Modal visible={true} transparent={true} animationType="fade">
          <View style={[styles.modalOverlay, { backgroundColor: theme.bg + 'ee' }]}>
            <ScrollView style={[styles.modalContent, { backgroundColor: theme.bg }]}>
              {/* Close Button */}
              <View style={styles.modalHeader}>
                <Pressable onPress={() => setSelectedVideo(null)}>
                  <Text style={[styles.closeBtn, { color: theme.accent, fontSize: 28 }]}>×</Text>
                </Pressable>
              </View>

              {/* Video Player */}
              <View style={[styles.videoPlayer, { backgroundColor: theme.weak + '30' }]}>
                <Text style={styles.largeIcon}>{selectedVideo.thumbnail}</Text>
                <Text style={[styles.playText, { color: theme.weak }]}>Toca para reproducir</Text>
              </View>

              {/* Video Info */}
              <View style={styles.infoSection}>
                <Text style={[styles.videoName, { color: theme.fg, fontSize: 20 * textScale }]}>
                  {selectedVideo.name}
                </Text>
                <Text style={[styles.videoAuthor, { color: theme.weak, fontSize: 12 * textScale }]}>
                  Por {selectedVideo.author}
                </Text>
              </View>

              {/* Stats */}
              <View style={[styles.statsSection, { borderTopColor: theme.weak + '30', borderBottomColor: theme.weak + '30' }]}>
                <View style={styles.statItem}>
                  <Text style={[styles.statIcon]}>👁</Text>
                  <Text style={[styles.statText, { color: theme.weak }]}>
                    {selectedVideo.views.toLocaleString()} visualizaciones
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statIcon]}>⏱</Text>
                  <Text style={[styles.statText, { color: theme.weak }]}>
                    {selectedVideo.duration}
                  </Text>
                </View>
              </View>

              {/* Description */}
              <View style={styles.descSection}>
                <Text style={[styles.sectionTitle, { color: theme.fg, fontSize: 15 * textScale }]}>
                  Descripción
                </Text>
                <Text style={[styles.descText, { color: theme.weak, fontSize: 13 * textScale }]}>
                  {selectedVideo.description}
                </Text>
              </View>

              {/* Tips */}
              <View style={styles.tipsSection}>
                <Text style={[styles.sectionTitle, { color: theme.fg, fontSize: 15 * textScale }]}>
                  💡 Consejos para ejecutar
                </Text>
                {selectedVideo.tips.map((tip, idx) => (
                  <Text key={idx} style={[styles.tipText, { color: theme.fg, fontSize: 13 * textScale }]}>
                    {tip}
                  </Text>
                ))}
              </View>

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <Pressable
                  style={[styles.btn, { backgroundColor: theme.accent }]}
                  onPress={() => {
                    // Simular aprendizaje
                    setSelectedVideo(null);
                  }}
                >
                  <Text style={[styles.btnText, { color: theme.bg, fontSize: 13 * textScale }]}>
                    ✓ Marcar como Aprendido
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.btn, { backgroundColor: theme.weak + '20' }]}
                  onPress={() => setSelectedVideo(null)}
                >
                  <Text style={[styles.btnText, { color: theme.fg, fontSize: 13 * textScale }]}>
                    Cerrar
                  </Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </Modal>
      )}
    </View>
  );
}

import { TextInput } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
    marginVertical: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },
  filterScroll: {
    paddingHorizontal: 8,
    marginBottom: 12,
  },
  filterBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 4,
  },
  filterText: {
    fontWeight: '600',
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  videoCard: {
    width: '48%',
    marginBottom: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  thumbnail: {
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  thumbnailIcon: {
    fontSize: 48,
  },
  playButton: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    fontSize: 18,
    color: 'white',
  },
  duration: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
  },
  videoTitle: {
    fontWeight: '600',
    marginTop: 8,
    paddingHorizontal: 8,
  },
  viewCount: {
    marginTop: 4,
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  modalOverlay: {
    flex: 1,
  },
  modalContent: {
    flex: 1,
    paddingTop: 40,
  },
  modalHeader: {
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  closeBtn: {
    fontWeight: '700',
  },
  videoPlayer: {
    height: 280,
    marginHorizontal: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  largeIcon: {
    fontSize: 80,
    marginBottom: 12,
  },
  playText: {
    fontSize: 14,
    fontWeight: '600',
  },
  infoSection: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  videoName: {
    fontWeight: '700',
    marginBottom: 4,
  },
  videoAuthor: {
    fontWeight: '500',
  },
  statsSection: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statIcon: {
    fontSize: 16,
  },
  statText: {
    fontSize: 12,
    fontWeight: '500',
  },
  descSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontWeight: '700',
    marginBottom: 8,
  },
  descText: {
    lineHeight: 20,
  },
  tipsSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  tipText: {
    marginBottom: 6,
    lineHeight: 18,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 32,
  },
  btn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    fontWeight: '700',
  },
});
