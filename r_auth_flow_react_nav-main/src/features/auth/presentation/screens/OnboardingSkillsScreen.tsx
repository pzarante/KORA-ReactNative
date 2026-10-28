import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';

export default function OnboardingSkillsScreen({ navigation }: { navigation: any }) {
  const [skills, setSkills] = useState<string[]>([]);
  const availableSkills = [
    'Creatividad', 'Investigación', 'Innovación', 'Programación',
    'Liderazgo', 'Marketing', 'Comunicación', 'Emprendimiento',
    'Diseño', 'Trabajo en equipo', 'Tecnología', 'Gestión de proyectos'
  ];

  const toggleSkill = (skill: string) => {
    if (skills.includes(skill)) {
      setSkills(skills.filter(s => s !== skill));
    } else {
      setSkills([...skills, skill]);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>K</Text>
        </View>

        <View style={styles.headerContainer}>
          <Text style={styles.title}>¿Cuáles son tus principales habilidades?</Text>
          <Text style={styles.subtitle}>Selecciona la opción(es) que mejor te describa</Text>
        </View>

        <View style={styles.gridContainer}>
          {availableSkills.map((skill) => {
            const isSelected = skills.includes(skill);
            return (
              <TouchableOpacity 
                key={skill}
                style={[styles.skillButton, isSelected && styles.skillSelected]}
                onPress={() => toggleSkill(skill)}
              >
                <Text style={[styles.skillText, isSelected && styles.skillTextSelected]}>
                  {skill}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity 
          style={styles.primaryButton} 
          onPress={() => navigation.navigate('OnboardingBio')}
        >
          <Text style={styles.primaryButtonText}>Continuar →</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContainer: { paddingHorizontal: 24, paddingVertical: 30 },
  logoContainer: { marginBottom: 15 },
  logoText: { fontSize: 36, fontWeight: '900', color: '#4A0E95' },
  headerContainer: { marginBottom: 20 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#666666' },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 30, gap: 10 },
  skillButton: { width: '48%', borderWidth: 1.5, borderColor: '#EFECE9', borderRadius: 20, paddingVertical: 14, alignItems: 'center', backgroundColor: '#FAFAFA' },
  skillSelected: { borderColor: '#4A0E95', backgroundColor: '#F8F6FC' },
  skillText: { fontSize: 13, fontWeight: '600', color: '#444' },
  skillTextSelected: { color: '#4A0E95', fontWeight: 'bold' },
  primaryButton: { backgroundColor: '#4A0E95', paddingVertical: 16, borderRadius: 30, alignItems: 'center', justifyContent: 'center', shadowColor: '#4A0E95', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 4 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});