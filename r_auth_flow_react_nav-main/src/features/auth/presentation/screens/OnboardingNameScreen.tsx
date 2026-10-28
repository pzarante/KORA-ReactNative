import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';

export default function OnboardingNameScreen({ navigation }: { navigation: any }) {
  const [name, setName] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.innerContainer}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>K</Text>
        </View>

        <View style={styles.headerContainer}>
          <Text style={styles.title}>¿Cómo te llamas?</Text>
          <Text style={styles.subtitle}>Ingresa tu nombre completo para comenzar</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputIcon}>👤</Text>
            <TextInput 
              style={styles.input}
              placeholder="Nombre completo"
              placeholderTextColor="#A0A0A0"
              value={name}
              onChangeText={setName}
            />
          </View>
        </View>

        <TouchableOpacity 
          style={styles.primaryButton} 
          onPress={() => navigation.navigate('OnboardingRole')}
        >
          <Text style={styles.primaryButtonText}>Continuar →</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
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
  formContainer: { width: '100%', marginBottom: 30 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: '#EFECE9', borderRadius: 16, backgroundColor: '#FAFAFA', paddingHorizontal: 14, height: 55 },
  inputIcon: { marginRight: 10, fontSize: 16 },
  input: { flex: 1, fontSize: 15, color: '#1A1A1A' },
  primaryButton: { backgroundColor: '#4A0E95', paddingVertical: 16, borderRadius: 30, alignItems: 'center', justifyContent: 'center', shadowColor: '#4A0E95', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 4 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});