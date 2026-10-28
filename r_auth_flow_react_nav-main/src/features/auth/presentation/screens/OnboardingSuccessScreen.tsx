import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Image } from 'react-native';

export default function OnboardingSuccessScreen({ navigation }: { navigation: any }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>K</Text>
        </View>

        <View style={styles.headerContainer}>
          <Text style={styles.title}>¡Todo listo!</Text>
          <Text style={styles.subtitle}>Tu perfil ha sido creado exitosamente</Text>
        </View>

        {/* Imagen de perfil con insignia de verificación */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatarWrapper}>
            {/* Puedes cambiar esto por una imagen real con <Image source={...} /> */}
            <View style={styles.avatarPlaceholderBox}>
              <Text style={styles.avatarEmoji}>👩‍🦰</Text>
            </View>
            <View style={styles.checkBadge}>
              <Text style={styles.checkIcon}>✓</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.primaryButton} 
          onPress={() => {
            // Aquí simulas que el usuario completó el flujo y entra a la app principal
            // (puedes disparar tu función de login o cambiar el estado isLoggedIn)
            console.log("Ir a la comunidad...");
          }}
        >
          <Text style={styles.primaryButtonText}>Ir a la comunidad</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  innerContainer: { flex: 1, paddingHorizontal: 24, justifyContent: 'center', alignItems: 'center' },
  logoContainer: { position: 'absolute', top: 30, left: 24 },
  logoText: { fontSize: 36, fontWeight: '900', color: '#4A0E95' },
  headerContainer: { alignItems: 'center', marginBottom: 30, marginTop: 40 },
  title: { fontSize: 30, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#666666', textAlign: 'center' },
  avatarContainer: { marginBottom: 40, alignItems: 'center' },
  avatarWrapper: { width: 160, height: 160, borderRadius: 80, position: 'relative', borderWidth: 2, borderColor: '#7C3AED', overflow: 'hidden' },
  avatarPlaceholderBox: { flex: 1, backgroundColor: '#FADADD', alignItems: 'center', justifyContent: 'center' },
  avatarEmoji: { fontSize: 80 },
  checkBadge: { position: 'absolute', bottom: 5, right: 10, backgroundColor: '#4A0E95', width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#FFF' },
  checkIcon: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  primaryButton: { width: '100%', backgroundColor: '#4A0E95', paddingVertical: 16, borderRadius: 30, alignItems: 'center', justifyContent: 'center', shadowColor: '#4A0E95', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 4 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});