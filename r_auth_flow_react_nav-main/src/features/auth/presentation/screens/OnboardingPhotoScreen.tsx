import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView } from 'react-native';

export default function OnboardingPhotoScreen({ navigation }: { navigation: any }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>K</Text>
        </View>

        <View style={styles.headerContainer}>
          <Text style={styles.title}>Agrega una foto de perfil</Text>
          <Text style={styles.subtitle}>Una foto hara que la comunidad te reconozca</Text>
        </View>

        {/* Avatar Placeholder con icono de cámara */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarPlaceholderIcon}>👤</Text>
            <View style={styles.cameraBadge}>
              <Text style={styles.cameraIcon}>📷</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.secondaryButton} onPress={() => console.log("Subir foto...")}>
          <Text style={styles.secondaryButtonText}>Subir foto</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('OnboardingSuccess')} style={styles.skipContainer}>
          <Text style={styles.skipText}>Omitir por ahora</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.primaryButton} 
          onPress={() => navigation.navigate('OnboardingSuccess')}
        >
          <Text style={styles.primaryButtonText}>Continuar →</Text>
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
  title: { fontSize: 26, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#666666', textAlign: 'center' },
  avatarContainer: { marginBottom: 24, alignItems: 'center' },
  avatarCircle: { width: 130, height: 130, borderRadius: 65, borderWidth: 1.5, borderColor: '#7C3AED', backgroundColor: '#F8F6FC', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  avatarPlaceholderIcon: { fontSize: 50 },
  cameraBadge: { position: 'absolute', bottom: 0, right: 10, backgroundColor: '#4A0E95', width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FFF' },
  cameraIcon: { fontSize: 16 },
  secondaryButton: { width: '100%', backgroundColor: '#EFEBF5', paddingVertical: 16, borderRadius: 30, alignItems: 'center', marginBottom: 12 },
  secondaryButtonText: { color: '#4A0E95', fontSize: 15, fontWeight: 'bold' },
  skipContainer: { marginBottom: 30 },
  skipText: { color: '#888', fontSize: 14, fontWeight: '600' },
  primaryButton: { width: '100%', backgroundColor: '#4A0E95', paddingVertical: 16, borderRadius: 30, alignItems: 'center', justifyContent: 'center', shadowColor: '#4A0E95', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 4 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});