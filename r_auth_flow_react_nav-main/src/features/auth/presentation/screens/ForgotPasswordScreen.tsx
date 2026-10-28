import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView
} from 'react-native';

export default function ForgotPasswordScreen({ navigation }: { navigation: any }) {
  const [email, setEmail] = useState('');

  const handleSendResetEmail = () => {
    // Aquí puedes integrar la lógica para enviar el correo de recuperación
    console.log("Enviando enlace de recuperación a:", email);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.innerContainer}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {/* Logo superior */}
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>K</Text>
          </View>

          {/* Títulos y descripción */}
          <View style={styles.headerContainer}>
            <Text style={styles.subHeader}>¿OLVIDASTE TU CONTRASEÑA?</Text>
            <Text style={styles.title}>Recuperar Contraseña</Text>
            <Text style={styles.description}>
              Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
            </Text>
          </View>

          {/* Formulario */}
          <View style={styles.formContainer}>
            <Text style={styles.label}>Correo Electrónico</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputIcon}>✉️</Text>
              <TextInput 
                style={styles.input}
                placeholder="ejemplo@uninorte.co"
                placeholderTextColor="#A0A0A0"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            {/* Enlace rápido debajo del input */}
            <TouchableOpacity onPress={handleSendResetEmail} style={styles.sendLinkContainer}>
              <Text style={styles.sendLinkText}>Enviar enlace</Text>
            </TouchableOpacity>
          </View>

          {/* Botón Volver a Inicio de sesión */}
          <TouchableOpacity 
            style={styles.primaryButton} 
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.primaryButtonText}>Volver a Inicio de sesión →</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  innerContainer: {
    flex: 1,
  },
  scrollContainer: {
    paddingHorizontal: 24,
    paddingVertical: 40,
    flexGrow: 1,
    justifyContent: 'center',
  },
  logoContainer: {
    marginBottom: 20,
  },
  logoText: {
    fontSize: 36,
    fontWeight: '900',
    color: '#4A0E95',
  },
  headerContainer: {
    marginBottom: 30,
  },
  subHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7C3AED',
    letterSpacing: 1,
    marginBottom: 4,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  formContainer: {
    width: '100%',
    marginBottom: 30,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#EFECE9',
    borderRadius: 16,
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 14,
    height: 55,
    marginBottom: 8,
  },
  inputIcon: {
    marginRight: 10,
    fontSize: 16,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#1A1A1A',
  },
  sendLinkContainer: {
    alignItems: 'flex-start',
    marginTop: 4,
    paddingLeft: 4,
  },
  sendLinkText: {
    color: '#4A0E95',
    fontSize: 13,
    fontWeight: '650',
    textDecorationLine: 'underline',
  },
  primaryButton: {
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
    fontSize: 16,
    fontWeight: 'bold',
  },
});