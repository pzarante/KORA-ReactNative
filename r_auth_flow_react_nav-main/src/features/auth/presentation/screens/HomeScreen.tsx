import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ScrollView, Image } from 'react-native';

export default function HomeScreen({ navigation }: { navigation: any }) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* Header con saludo y perfil */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>¡HOLA, JUANA!</Text>
            <Text style={styles.mainTitle}>BIENVENIDO/A{'\n'}A LA COMUNIDAD</Text>
            <Text style={styles.subTitle}>Personas • Ideas • Oportunidades{'\n'}En un solo lugar</Text>
          </View>
          {/* Avatar circular superior */}
          <View style={styles.profileAvatar}>
            <Text style={styles.avatarEmoji}>👩‍🦰</Text>
          </View>
        </View>

        {/* Tarjeta de descripción y banner */}
        <View style={styles.bannerCard}>
          <View style={styles.bannerTextContent}>
            <Text style={styles.bannerDescription}>
              Un espacio para descubrir iniciativas, conectar con personas afines y aportar tus conocimientos y habilidades.
            </Text>
          </View>
          {/* Aquí puedes colocar una imagen o ilustración del grupo */}
          <View style={styles.bannerIllustration}>
            <Text style={styles.illustrationPlaceholder}>👥</Text>
            <Text style={styles.badgeText}>Conecta para crear</Text>
          </View>
        </View>

        {/* Sección "Descubre todo lo que puedes hacer con KORA" */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Descubre todo lo que puedes hacer con KORA</Text>

          {/* Grid de 4 opciones */}
          <View style={styles.gridContainer}>
            {/* Explora */}
            <View style={styles.gridItem}>
              <View style={[styles.iconCircle, { backgroundColor: '#F3E8FF' }]}>
                <Text style={styles.gridIcon}>🔍</Text>
              </View>
              <Text style={styles.gridItemTitle}>Explora</Text>
              <Text style={styles.gridItemSub}>Descubre ideas</Text>
            </View>

            {/* Crea */}
            <View style={styles.gridItem}>
              <View style={[styles.iconCircle, { backgroundColor: '#FFEDD5' }]}>
                <Text style={styles.gridIcon}>✏️</Text>
              </View>
              <Text style={styles.gridItemTitle}>Crea</Text>
              <Text style={styles.gridItemSub}>Propon ideas</Text>
            </View>

            {/* Conecta */}
            <View style={styles.gridItem}>
              <View style={[styles.iconCircle, { backgroundColor: '#EDE9FE' }]}>
                <Text style={styles.gridIcon}>👥</Text>
              </View>
              <Text style={styles.gridItemTitle}>Conecta</Text>
              <Text style={styles.gridItemSub}>Encuentra personas</Text>
            </View>

            {/* Aporta */}
            <View style={styles.gridItem}>
              <View style={[styles.iconCircle, { backgroundColor: '#FEF3C7' }]}>
                <Text style={styles.gridIcon}>💡</Text>
              </View>
              <Text style={styles.gridItemTitle}>Aporta</Text>
              <Text style={styles.gridItemSub}>Comparte talento</Text>
            </View>
          </View>
        </View>

        {/* Tarjeta inferior con comunidad e imagen de edificio */}
        <View style={styles.bottomCard}>
          <Text style={styles.bottomCardText}>Una comunidad que impulsa ideas reales</Text>
          
          {/* Botón principal */}
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => {
              // Acción al presionar explorar la comunidad
              console.log("Explorando la comunidad...");
            }}
          >
            <Text style={styles.primaryButtonText}>Explorar la comunidad</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 12,
    fontWeight: '800',
    color: '#D97706',
    letterSpacing: 1,
    marginBottom: 4,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#4A0E95',
    lineHeight: 32,
    marginBottom: 6,
  },
  subTitle: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  profileAvatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#FADADD',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#7C3AED',
  },
  avatarEmoji: {
    fontSize: 22,
  },
  bannerCard: {
    backgroundColor: '#4A0E95',
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
    overflow: 'hidden',
  },
  bannerTextContent: {
    flex: 1,
    paddingRight: 10,
  },
  bannerDescription: {
    color: '#FFFFFF',
    fontSize: 13,
    lineHeight: 18,
  },
  bannerIllustration: {
    width: 90,
    height: 90,
    backgroundColor: '#6D28D9',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationPlaceholder: {
    fontSize: 35,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: 'bold',
    marginTop: 4,
  },
  sectionContainer: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 20,
  },
  gridContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gridItem: {
    alignItems: 'center',
    width: '23%',
  },
  iconCircle: {
    width: 55,
    height: 55,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  gridIcon: {
    fontSize: 22,
  },
  gridItemTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  gridItemSub: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
  bottomCard: {
    backgroundColor: '#FFF5F0',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFE4D6',
    marginBottom: 20,
  },
  bottomCardText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 16,
    textAlign: 'center',
  },
  primaryButton: {
    width: '100%',
    backgroundColor: '#4A0E95',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4A0E95',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
});