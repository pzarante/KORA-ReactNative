import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView } from 'react-native';

export default function OnboardingRoleScreen({ navigation }: { navigation: any }) {
  const [selectedRole, setSelectedRole] = useState('Estudiante');
  const roles = ['Estudiante', 'Docente', 'Egresado'];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>K</Text>
        </View>

        <View style={styles.headerContainer}>
          <Text style={styles.title}>¿Cuál es tu rol?</Text>
          <Text style={styles.subtitle}>Selecciona la opción que mejor te describa</Text>
        </View>

        <View style={styles.optionsContainer}>
          {roles.map((role) => (
            <TouchableOpacity 
              key={role}
              style={[styles.optionButton, selectedRole === role && styles.optionSelected]}
              onPress={() => setSelectedRole(role)}
            >
              <Text style={[styles.optionText, selectedRole === role && styles.optionTextSelected]}>
                {role}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity 
          style={styles.primaryButton} 
          onPress={() => navigation.navigate('OnboardingSkills')}
        >
          <Text style={styles.primaryButtonText}>Continuar →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  innerContainer: { flex: 1, paddingHorizontal: 24, justifyContent: 'center' },
  logoContainer: { marginBottom: 20 },
  logoText: { fontSize: 36, fontWeight: '900', color: '#4A0E95' },
  headerContainer: { marginBottom: 30 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#666666' },
  optionsContainer: { width: '100%', gap: 12, marginBottom: 40 },
  optionButton: { borderWidth: 1.5, borderColor: '#EFECE9', borderRadius: 25, paddingVertical: 16, alignItems: 'center', backgroundColor: '#FAFAFA' },
  optionSelected: { borderColor: '#4A0E95', backgroundColor: '#F8F6FC' },
  optionText: { fontSize: 15, fontWeight: '600', color: '#444' },
  optionTextSelected: { color: '#4A0E95', fontWeight: 'bold' },
  primaryButton: { backgroundColor: '#4A0E95', paddingVertical: 16, borderRadius: 30, alignItems: 'center', justifyContent: 'center', shadowColor: '#4A0E95', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 4 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});